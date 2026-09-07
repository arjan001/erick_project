/**
 * Nexus Pay (MakamescoPay) API Service — Eric Rabar
 *
 * Third-party payment gateway for M-Pesa STK Push, card payments,
 * and B2C disbursements via https://makamescopay.com
 *
 * Docs: https://makamescopay.com/docs
 * Base URL: https://makamescopay.com
 * API Version: v1
 */

const NEXUS_BASE_URL = 'https://makamescopay.com';

/**
 * Initiate an M-Pesa STK Push payment via Nexus Pay.
 *
 * @param {Object} params
 * @param {string} params.secretKey - Nexus Pay secret key (sk_...)
 * @param {string} params.phoneNumber - Customer phone (format: 254XXXXXXXXX)
 * @param {number} params.amount - Amount in KES (min 1)
 * @param {string} params.accountReference - Internal reference (e.g. invoice ID)
 * @param {string} params.transactionDesc - Description shown on STK prompt
 * @param {number} [params.settlementAccountId] - Settlement account ID
 * @param {string} [params.tenantCode] - SaaS tenant code
 * @returns {Promise<Object>} Nexus Pay STK Push response
 */
export async function nexusStkPush({ secretKey, phoneNumber, amount, accountReference, transactionDesc, settlementAccountId, tenantCode }) {
  if (!secretKey) throw new Error('Nexus Pay secret key is required');
  if (!phoneNumber) throw new Error('Phone number is required');
  if (!amount || amount < 1) throw new Error('Amount must be at least 1 KES');
  if (!accountReference) throw new Error('Account reference is required');
  if (!transactionDesc) throw new Error('Transaction description is required');

  // Normalize phone to 254XXXXXXXXX
  let phone = phoneNumber.replace(/\s+/g, '').replace(/^\+/, '');
  if (phone.startsWith('0')) phone = '254' + phone.slice(1);
  else if (!phone.startsWith('254')) phone = '254' + phone;

  const body = {
    phoneNumber: phone,
    amount: Math.round(amount),
    accountReference,
    transactionDesc,
  };
  if (settlementAccountId) body.settlementAccountId = settlementAccountId;
  if (tenantCode) body.tenantCode = tenantCode;

  const res = await fetch(`${NEXUS_BASE_URL}/api/payments/stkpush`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': secretKey,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || `Nexus Pay STK Push failed (${res.status})`);
  }

  return {
    checkoutRequestId: data.checkoutRequestId,
    merchantRequestId: data.merchantRequestId,
    responseCode: data.responseCode,
    responseDescription: data.responseDescription,
    customerMessage: data.customerMessage,
    transactionId: data.transactionId,
  };
}

/**
 * Check the status of a Nexus Pay STK Push transaction.
 * Poll every 3-5 seconds for up to 60 seconds.
 *
 * @param {Object} params
 * @param {string} params.secretKey - Nexus Pay secret key
 * @param {string} params.checkoutRequestId - From nexusStkPush response
 * @returns {Promise<Object>} Transaction status
 */
export async function nexusCheckStatus({ secretKey, checkoutRequestId }) {
  if (!secretKey) throw new Error('Nexus Pay secret key is required');
  if (!checkoutRequestId) throw new Error('Checkout request ID is required');

  const res = await fetch(`${NEXUS_BASE_URL}/api/payments/status/${checkoutRequestId}`, {
    method: 'GET',
    headers: {
      'X-API-Key': secretKey,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || `Status check failed (${res.status})`);
  }

  return {
    checkoutRequestId: data.checkoutRequestId,
    status: data.status, // pending | completed | failed | cancelled
    mpesaReceiptNumber: data.mpesaReceiptNumber,
    amount: data.amount,
    phoneNumber: data.phoneNumber,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    isCompleted: data.status === 'completed',
    isPending: data.status === 'pending',
    isFailed: data.status === 'failed',
    isCancelled: data.status === 'cancelled',
  };
}

/**
 * Poll Nexus Pay payment status until terminal state or timeout.
 *
 * @param {Object} params
 * @param {string} params.secretKey
 * @param {string} params.checkoutRequestId
 * @param {number} [params.interval=4000] - Poll interval in ms
 * @param {number} [params.timeout=60000] - Max wait in ms
 * @param {function} [params.onPoll] - Callback(status) on each poll
 * @returns {Promise<Object>} Final transaction status
 */
export async function nexusPollPaymentStatus({ secretKey, checkoutRequestId, interval = 4000, timeout = 60000, onPoll }) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const status = await nexusCheckStatus({ secretKey, checkoutRequestId });
    if (onPoll) onPoll(status);

    if (status.isCompleted || status.isFailed || status.isCancelled) {
      return status;
    }

    await new Promise((r) => setTimeout(r, interval));
  }

  // Timeout — return last known status or a timeout result
  return { status: 'timeout', isCompleted: false, isPending: false, isFailed: false, isCancelled: false };
}

/**
 * Test the Nexus Pay connection by making a simple API call.
 * Used by the admin settings page "Test Connection" button.
 *
 * @param {string} secretKey - Nexus Pay secret key
 * @returns {Promise<Object>} { success, message }
 */
export async function testNexusPayConnection(secretKey) {
  try {
    if (!secretKey) {
      return { success: false, message: 'Nexus Pay secret key is required' };
    }

    // Make a lightweight status check call to verify the key works
    const res = await fetch(`${NEXUS_BASE_URL}/api/payments/status/test-connection`, {
      method: 'GET',
      headers: {
        'X-API-Key': secretKey,
      },
    });

    // A 401/403 means the key is invalid; a 404 for the test ID means the key is valid
    if (res.status === 401 || res.status === 403) {
      return { success: false, message: 'Invalid API key — authentication failed' };
    }

    return { success: true, message: 'Nexus Pay connection successful. API key is valid.' };
  } catch (err) {
    return { success: false, message: err.message || 'Connection test failed' };
  }
}
