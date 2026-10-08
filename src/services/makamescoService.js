/**
 * Makamesco/Nexus Pay API Service — SmartGigs Kenya
 *
 * Official payment gateway wrapper for M-Pesa, Card, and B2C payments.
 * Documentation: https://makamescopay.com/docs
 *
 * Features:
 * - M-Pesa STK Push (C2B)
 * - Card & Airtel Money payments via PesaPal
 * - B2C disbursements
 * - Platform wallet & withdrawals
 * - Multi-currency support (East Africa)
 */

const MAKAMESCO_BASE_URL = 'https://makamescopay.com'
const API_VERSION = 'v1'

/**
 * Initiate an M-Pesa STK Push payment via Makamesco
 *
 * @param {Object} params
 * @param {string} params.secretKey - Makamesco Secret Key (sk_...)
 * @param {string} params.phoneNumber - Customer phone (format: 2547XXXXXXXXX)
 * @param {number} params.amount - Amount in KES (minimum 1)
 * @param {string} params.accountReference - Internal reference (invoice/order ID)
 * @param {string} params.transactionDesc - Description shown to customer
 * @param {number} [params.settlementAccountId] - Settlement account ID (optional)
 * @param {string} [params.tenantCode] - SaaS tenant code (optional)
 * @returns {Promise<Object>} Makamesco STK Push response
 */
export async function initiateMakamescoSTKPush({
  secretKey,
  phoneNumber,
  amount,
  accountReference,
  transactionDesc,
  settlementAccountId = null,
  tenantCode = null
}) {
  // Validate required fields
  if (!secretKey) throw new Error('Makamesco Secret Key is required')
  if (!phoneNumber) throw new Error('Phone number is required')
  if (!amount || amount < 1) throw new Error('Amount must be at least KES 1')
  if (!accountReference) throw new Error('Account reference is required')
  if (!transactionDesc) throw new Error('Transaction description is required')

  // Normalize phone number
  let phone = phoneNumber.replace(/\s+/g, '').replace(/^\+/, '')
  if (phone.startsWith('0')) {
    phone = '254' + phone.slice(1)
  } else if (!phone.startsWith('254')) {
    phone = '254' + phone
  }

  const payload = {
    phoneNumber: phone,
    amount: Math.round(amount),
    accountReference,
    transactionDesc
  }

  // Add optional parameters
  if (settlementAccountId) payload.settlementAccountId = settlementAccountId
  if (tenantCode) payload.tenantCode = tenantCode

  try {
    const response = await fetch(`${MAKAMESCO_BASE_URL}/api/payments/stkpush`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': secretKey
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || data.message || `STK Push failed (${response.status})`)
    }

    return {
      checkoutRequestId: data.checkoutRequestId,
      merchantRequestId: data.merchantRequestId,
      responseCode: data.responseCode,
      responseDescription: data.responseDescription,
      customerMessage: data.customerMessage,
      transactionId: data.transactionId,
      sandboxMode: data.sandboxMode || false,
      sandboxTransactionsRemaining: data.sandboxTransactionsRemaining || 0
    }
  } catch (error) {
    throw new Error(`Makamesco STK Push error: ${error.message}`)
  }
}

/**
 * Check the status of a Makamesco STK Push transaction
 *
 * @param {Object} params
 * @param {string} params.secretKey - Makamesco Secret Key
 * @param {string} params.checkoutRequestId - From initiateMakamescoSTKPush response
 * @returns {Promise<Object>} Transaction status
 */
export async function checkMakamescoStatus({ secretKey, checkoutRequestId }) {
  if (!secretKey) throw new Error('Makamesco Secret Key is required')
  if (!checkoutRequestId) throw new Error('Checkout Request ID is required')

  try {
    const response = await fetch(
      `${MAKAMESCO_BASE_URL}/api/payments/status/${checkoutRequestId}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': secretKey
        }
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || data.message || `Status check failed (${response.status})`)
    }

    return {
      checkoutRequestId: data.checkoutRequestId,
      status: data.status, // pending | completed | failed | cancelled
      mpesaReceiptNumber: data.mpesaReceiptNumber || null,
      amount: data.amount,
      phoneNumber: data.phoneNumber,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    }
  } catch (error) {
    throw new Error(`Makamesco status check error: ${error.message}`)
  }
}

/**
 * Send B2C disbursement via Makamesco
 *
 * @param {Object} params
 * @param {string} params.secretKey - Makamesco Secret Key
 * @param {string} params.phoneNumber - Recipient phone (format: 2547XXXXXXXXX)
 * @param {number} params.amount - Amount in KES (minimum 10)
 * @param {string} params.remarks - Description
 * @param {string} [params.commandId] - BusinessPayment | SalaryPayment | PromotionPayment
 * @param {string} [params.occasion] - Optional reference label
 * @returns {Promise<Object>} B2C initiation response
 */
export async function initiateMakamescoB2C({
  secretKey,
  phoneNumber,
  amount,
  remarks,
  commandId = 'BusinessPayment',
  occasion = null
}) {
  if (!secretKey) throw new Error('Makamesco Secret Key is required')
  if (!phoneNumber) throw new Error('Phone number is required')
  if (!amount || amount < 10) throw new Error('Amount must be at least KES 10')
  if (!remarks) throw new Error('Remarks are required')

  // Normalize phone number
  let phone = phoneNumber.replace(/\s+/g, '').replace(/^\+/, '')
  if (phone.startsWith('0')) {
    phone = '254' + phone.slice(1)
  } else if (!phone.startsWith('254')) {
    phone = '254' + phone
  }

  const payload = {
    phoneNumber: phone,
    amount: Math.round(amount),
    remarks,
    commandId
  }

  if (occasion) payload.occasion = occasion

  try {
    const response = await fetch(`${MAKAMESCO_BASE_URL}/api/payments/b2c`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': secretKey
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || data.message || `B2C initiation failed (${response.status})`)
    }

    return {
      conversationId: data.conversationId,
      responseCode: data.responseCode,
      responseDescription: data.responseDescription,
      feeAmount: data.feeAmount,
      totalDeducted: data.totalDeducted,
      transactionId: data.transactionId
    }
  } catch (error) {
    throw new Error(`Makamesco B2C error: ${error.message}`)
  }
}

/**
 * Check B2C disbursement status
 *
 * @param {Object} params
 * @param {string} params.secretKey - Makamesco Secret Key
 * @param {string} params.conversationId - From initiateMakamescoB2C response
 * @returns {Promise<Object>} B2C status
 */
export async function checkMakamescoB2CStatus({ secretKey, conversationId }) {
  if (!secretKey) throw new Error('Makamesco Secret Key is required')
  if (!conversationId) throw new Error('Conversation ID is required')

  try {
    const response = await fetch(
      `${MAKAMESCO_BASE_URL}/api/payments/b2c/status/${conversationId}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': secretKey
        }
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || data.message || `B2C status check failed (${response.status})`)
    }

    return {
      conversationId: data.conversationId,
      status: data.status,
      amount: data.amount,
      phoneNumber: data.phoneNumber,
      mpesaReceiptNumber: data.mpesaReceiptNumber,
      receiverPartyPublicName: data.receiverPartyPublicName,
      commandId: data.commandId,
      remarks: data.remarks,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    }
  } catch (error) {
    throw new Error(`Makamesco B2C status check error: ${error.message}`)
  }
}

/**
 * Test Makamesco connection by initiating a small STK Push
 * Used by admin settings page "Test Connection" button
 *
 * @param {Object} params
 * @param {string} params.secretKey - Makamesco Secret Key
 * @param {string} params.phoneNumber - Test phone number
 * @returns {Promise<Object>} { success, message }
 */
export async function testMakamescoConnection({ secretKey, phoneNumber }) {
  try {
    const result = await initiateMakamescoSTKPush({
      secretKey,
      phoneNumber: phoneNumber || '254700000000', // Default test number
      amount: 1, // Minimum amount for testing
      accountReference: 'TEST_CONNECTION',
      transactionDesc: 'Connection Test'
    })

    if (result.responseCode === '0') {
      return {
        success: true,
        message: 'Makamesco connection successful. STK Push initiated.',
        checkoutRequestId: result.checkoutRequestId,
        sandboxMode: result.sandboxMode,
        sandboxTransactionsRemaining: result.sandboxTransactionsRemaining
      }
    } else {
      return {
        success: false,
        message: result.responseDescription || 'Connection test failed'
      }
    }
  } catch (err) {
    return {
      success: false,
      message: err.message
    }
  }
}

/**
 * Parse Makamesco callback payload
 * Extracts transaction result for storage
 *
 * @param {Object} callback - Raw callback body from Makamesco
 * @returns {Object} Parsed transaction result
 */
export function parseMakamescoCallback(callback) {
  const stkCallback = callback?.Body?.stkCallback
  if (!stkCallback) {
    return { success: false, message: 'Invalid callback format' }
  }

  const metadata = stkCallback?.CallbackMetadata?.Item || []
  const getItem = (name) => metadata.find((item) => item.Name === name)?.Value

  const resultCode = stkCallback.ResultCode
  let status = 'failed'
  if (resultCode === 0) status = 'completed'
  else if (resultCode === 1032) status = 'cancelled'
  else if (resultCode === 1037) status = 'failed' // timeout

  return {
    merchantRequestId: stkCallback.MerchantRequestID,
    checkoutRequestId: stkCallback.CheckoutRequestID,
    resultCode: resultCode,
    resultDesc: stkCallback.ResultDesc,
    success: resultCode === 0,
    status,
    amount: getItem('Amount'),
    mpesaReceipt: getItem('MpesaReceiptNumber'),
    transactionDate: getItem('TransactionDate'),
    phoneNumber: getItem('PhoneNumber')
  }
}

/**
 * Get M-Pesa Result Code description
 *
 * @param {number} resultCode - M-Pesa ResultCode
 * @returns {string} Description
 */
export function getMpesaResultCodeDescription(resultCode) {
  const codes = {
    0: 'Success - payment completed',
    1: 'Insufficient funds in the M-Pesa account',
    1032: 'Request cancelled by user',
    1037: 'DS timeout - user didn\'t respond in time',
    2001: 'Wrong PIN entered',
    2002: 'Till/Paybill number mismatch',
    17: 'Transaction limit reached for the day',
    1019: 'Transaction expired'
  }
  return codes[resultCode] || 'Unknown error'
}
