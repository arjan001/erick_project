/**
 * M-Pesa Daraja API Service — Eric Rabar
 *
 * Handles M-Pesa STK Push, C2B, and transaction verification via the
 * Safaricom Daraja API. Settings are loaded from the payment_settings
 * Base44 entity (managed in AdminPaymentSettingsPage).
 */

const DARAJA_BASE_URL = {
  sandbox: 'https://sandbox.safaricom.co.ke',
  production: 'https://api.safaricom.co.ke',
}

/**
 * Generate an OAuth access token from Daraja API.
 * @param {Object} settings - M-Pesa settings (consumerKey, consumerSecret, mode)
 */
export async function getMpesaAccessToken(settings) {
  const { consumerKey, consumerSecret, mode = 'sandbox' } = settings
  if (!consumerKey || !consumerSecret) {
    throw new Error('M-Pesa consumer key and secret are required')
  }

  const baseUrl = DARAJA_BASE_URL[mode] || DARAJA_BASE_URL.sandbox
  const auth = btoa(`${consumerKey}:${consumerSecret}`)

  const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Daraja auth failed (${response.status}): ${errorBody}`)
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Generate the password for STK Push: base64(shortcode + passkey + timestamp)
 */
function generatePassword(shortcode, passkey, timestamp) {
  return btoa(`${shortcode}${passkey}${timestamp}`)
}

/**
 * Generate a timestamp in YYYYMMDDHHmmss format
 */
function getTimestamp() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return (
    now.getFullYear() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  )
}

/**
 * Generate a unique checkout request ID
 */
function generateCheckoutRequestId() {
  return `ER${Date.now()}${Math.floor(Math.random() * 10000)}`
}

/**
 * Initiate an STK Push payment request to a user's phone.
 *
 * @param {Object} params
 * @param {Object} params.settings - M-Pesa gateway settings
 * @param {string} params.phoneNumber - Customer phone (format: 2547XXXXXXXX)
 * @param {number} params.amount - Amount to charge
 * @param {string} params.accountRef - Account reference (e.g., order/project ID)
 * @param {string} [params.transactionDesc] - Transaction description
 * @returns {Promise<Object>} Daraja STK Push response
 */
export async function initiateStkPush({ settings, phoneNumber, amount, accountRef, transactionDesc = 'Payment' }) {
  const {
    consumerKey,
    consumerSecret,
    shortcode,
    passkey,
    callbackUrl,
    mode = 'sandbox',
    accountType = 'paybill',
  } = settings

  // Validate required fields
  const missing = []
  if (!consumerKey) missing.push('consumerKey')
  if (!consumerSecret) missing.push('consumerSecret')
  if (!shortcode) missing.push('shortcode')
  if (!passkey) missing.push('passkey')
  if (!callbackUrl) missing.push('callbackUrl')
  if (missing.length > 0) {
    throw new Error(`M-Pesa settings incomplete. Missing: ${missing.join(', ')}`)
  }

  // Normalize phone number
  let phone = phoneNumber.replace(/\s+/g, '').replace(/^\+/, '')
  if (phone.startsWith('0')) {
    phone = '254' + phone.slice(1)
  } else if (phone.startsWith('254')) {
    // already correct
  } else {
    phone = '254' + phone
  }

  const timestamp = getTimestamp()
  const password = generatePassword(shortcode, passkey, timestamp)
  const accessToken = await getMpesaAccessToken(settings)
  const baseUrl = DARAJA_BASE_URL[mode] || DARAJA_BASE_URL.sandbox

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: accountType === 'till' ? 'CustomerBuyGoodsOnline' : 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: callbackUrl,
    AccountReference: accountRef,
    TransactionDesc: transactionDesc,
  }

  const response = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok || data.errorCode) {
    throw new Error(data.errorMessage || data.errorCode || `STK Push failed (${response.status})`)
  }

  return {
    checkoutRequestId: data.CheckoutRequestID || generateCheckoutRequestId(),
    merchantRequestId: data.MerchantRequestID,
    responseCode: data.ResponseCode,
    responseDescription: data.ResponseDescription,
    customerMessage: data.CustomerMessage,
  }
}

/**
 * Query the status of an STK Push transaction.
 *
 * @param {Object} params
 * @param {Object} params.settings - M-Pesa gateway settings
 * @param {string} params.checkoutRequestId - From initiateStkPush response
 * @returns {Promise<Object>} Transaction status
 */
export async function queryStkPushStatus({ settings, checkoutRequestId }) {
  const { consumerKey, consumerSecret, shortcode, passkey, mode = 'sandbox' } = settings

  const timestamp = getTimestamp()
  const password = generatePassword(shortcode, passkey, timestamp)
  const accessToken = await getMpesaAccessToken(settings)
  const baseUrl = DARAJA_BASE_URL[mode] || DARAJA_BASE_URL.sandbox

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  }

  const response = await fetch(`${baseUrl}/mpesa/stkpushquery/v1/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  return {
    resultCode: data.ResultCode,
    resultDesc: data.ResultDesc,
    isCompleted: data.ResultCode === '0',
    isPending: data.errorCode === '500.001.1001' || data.ResultCode === undefined,
    mpesaReceipt: data.MpesaReceiptNumber || null,
    amount: data.Amount || null,
    transactionDate: data.TransactionDate || null,
    phoneNumber: data.PhoneNumber || null,
  }
}

/**
 * Test the M-Pesa connection by generating an access token.
 * Used by the admin settings page "Test Connection" button.
 *
 * @param {Object} settings - M-Pesa gateway settings
 * @returns {Promise<Object>} { success, message }
 */
export async function testMpesaConnection(settings) {
  try {
    const token = await getMpesaAccessToken(settings)
    if (token) {
      return { success: true, message: 'M-Pesa connection successful. Access token generated.' }
    }
    return { success: false, message: 'No access token returned' }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

/**
 * Parse the callback payload from Safaricom after STK Push completes.
 * Extracts the transaction result for storage.
 *
 * @param {Object} callback - Raw callback body from Safaricom
 * @returns {Object} Parsed transaction result
 */
export function parseStkCallback(callback) {
  const stkCallback = callback?.Body?.stkCallback
  if (!stkCallback) {
    return { success: false, message: 'Invalid callback format' }
  }

  const metadata = stkCallback?.CallbackMetadata?.Item || []
  const getItem = (name) => metadata.find((item) => item.Name === name)?.Value

  return {
    merchantRequestId: stkCallback.MerchantRequestID,
    checkoutRequestId: stkCallback.CheckoutRequestID,
    resultCode: stkCallback.ResultCode,
    resultDesc: stkCallback.ResultDesc,
    success: stkCallback.ResultCode === 0,
    amount: getItem('Amount'),
    mpesaReceipt: getItem('MpesaReceiptNumber'),
    transactionDate: getItem('TransactionDate'),
    phoneNumber: getItem('PhoneNumber'),
  }
}
