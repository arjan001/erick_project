import { PaymentSettings, MpesaTransaction, MakamescoTransaction } from '@/lib/supabaseEntities'

/**
 * Payment Settings API — SmartGigs Kenya
 *
 * Stores M-Pesa, Mollie, Nexus Pay (Makamesco), and general payment settings
 * as a single JSON record in the payment_settings Supabase table.
 * The admin page loads on mount and saves via these functions.
 */

/**
 * Get the single payment settings record (or null if not yet created).
 */
export const getPaymentSettings = async () => {
  try {
    const data = await PaymentSettings.list('-created_at', 1)
    return data?.[0] || null
  } catch (err) {
    throw err
  }
}

/**
 * Save M-Pesa settings. Creates the record if it doesn't exist, otherwise
 * merges into the existing record.
 */
export const saveMpesaSettings = async (mpesaSettings) => {
  try {
    const existing = await getPaymentSettings()
    if (existing) {
      const data = await PaymentSettings.update(existing.id, {
        mpesa_settings: mpesaSettings,
      })
      return data
    }
    const data = await PaymentSettings.create({
      mpesa_settings: mpesaSettings,
    })
    return data
  } catch (err) {
    throw err
  }
}

/**
 * Save Nexus Pay settings. Merges into the existing record.
 */
export const saveNexusPaySettings = async (nexusPaySettings) => {
  try {
    const existing = await getPaymentSettings()
    if (existing) {
      const data = await PaymentSettings.update(existing.id, {
        nexuspay_settings: nexusPaySettings,
      })
      return data
    }
    const data = await PaymentSettings.create({
      nexuspay_settings: nexusPaySettings,
    })
    return data
  } catch (err) {
    throw err
  }
}

/**
 * Save Mollie settings. Merges into the existing record.
 */
export const saveMollieSettings = async (mollieSettings) => {
  try {
    const existing = await getPaymentSettings()
    if (existing) {
      const data = await PaymentSettings.update(existing.id, {
        mollie_settings: mollieSettings,
      })
      return data
    }
    const data = await PaymentSettings.create({
      mollie_settings: mollieSettings,
    })
    return data
  } catch (err) {
    throw err
  }
}

/**
 * Save general payment settings. Merges into the existing record.
 */
export const saveGeneralPaymentSettings = async (paymentSettings) => {
  try {
    const existing = await getPaymentSettings()
    if (existing) {
      const data = await PaymentSettings.update(existing.id, {
        general_settings: paymentSettings,
      })
      return data
    }
    const data = await PaymentSettings.create({
      general_settings: paymentSettings,
    })
    return data
  } catch (err) {
    throw err
  }
}

/**
 * Record an M-Pesa transaction.
 */
export const recordMpesaTransaction = async (transaction) => {
  try {
    const data = await MpesaTransaction.create(transaction)
    return data
  } catch (err) {
    throw err
  }
}

/**
 * List M-Pesa transactions (optionally filtered).
 */
export const listMpesaTransactions = async (filters = {}) => {
  try {
    const data = await MpesaTransaction.filter(filters, '-created_at')
    return data || []
  } catch (err) {
    throw err
  }
}

/**
 * Update an M-Pesa transaction status (e.g., after callback).
 */
export const updateMpesaTransaction = async (id, updates) => {
  try {
    const data = await MpesaTransaction.update(id, updates)
    return data
  } catch (err) {
    throw err
  }
}

/**
 * Record a Makamesco transaction.
 */
export const recordMakamescoTransaction = async (transaction) => {
  try {
    const data = await MakamescoTransaction.create(transaction)
    return data
  } catch (err) {
    throw err
  }
}

/**
 * List Makamesco transactions (optionally filtered).
 */
export const listMakamescoTransactions = async (filters = {}) => {
  try {
    const data = await MakamescoTransaction.filter(filters, '-created_at')
    return data || []
  } catch (err) {
    throw err
  }
}

/**
 * Update a Makamesco transaction status (e.g., after callback).
 */
export const updateMakamescoTransaction = async (id, updates) => {
  try {
    const data = await MakamescoTransaction.update(id, updates)
    return data
  } catch (err) {
    throw err
  }
}
