import { base44 } from '@/api/base44Client';

/**
 * Payment Settings API — Eric Rabar
 *
 * Stores M-Pesa, Mollie, and general payment settings as a single JSON
 * record in the payment_settings Base44 entity. The admin page loads on
 * mount and saves via these functions.
 */

const ENTITY = 'payment_settings';

/**
 * Get the single payment settings record (or null if not yet created).
 */
export const getPaymentSettings = async () => {
  try {
    const { data, error } = await base44.entities[ENTITY].list();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error fetching payment settings:', err);
    throw err;
  }
};

/**
 * Save M-Pesa settings. Creates the record if it doesn't exist, otherwise
 * merges into the existing record.
 */
export const saveMpesaSettings = async (mpesaSettings) => {
  try {
    const existing = await getPaymentSettings();
    if (existing) {
      const { data, error } = await base44.entities[ENTITY].update(existing.id, {
        mpesa_settings: mpesaSettings,
      });
      if (error) throw error;
      return data;
    }
    const { data, error } = await base44.entities[ENTITY].create({
      mpesa_settings: mpesaSettings,
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error saving M-Pesa settings:', err);
    throw err;
  }
};

/**
 * Save Nexus Pay settings. Merges into the existing record.
 */
export const saveNexusPaySettings = async (nexusPaySettings) => {
  try {
    const existing = await getPaymentSettings();
    if (existing) {
      const { data, error } = await base44.entities[ENTITY].update(existing.id, {
        nexuspay_settings: nexusPaySettings,
      });
      if (error) throw error;
      return data;
    }
    const { data, error } = await base44.entities[ENTITY].create({
      nexuspay_settings: nexusPaySettings,
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error saving Nexus Pay settings:', err);
    throw err;
  }
};

/**
 * Save Mollie settings. Merges into the existing record.
 */
export const saveMollieSettings = async (mollieSettings) => {
  try {
    const existing = await getPaymentSettings();
    if (existing) {
      const { data, error } = await base44.entities[ENTITY].update(existing.id, {
        mollie_settings: mollieSettings,
      });
      if (error) throw error;
      return data;
    }
    const { data, error } = await base44.entities[ENTITY].create({
      mollie_settings: mollieSettings,
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error saving Mollie settings:', err);
    throw err;
  }
};

/**
 * Save general payment settings. Merges into the existing record.
 */
export const saveGeneralPaymentSettings = async (paymentSettings) => {
  try {
    const existing = await getPaymentSettings();
    if (existing) {
      const { data, error } = await base44.entities[ENTITY].update(existing.id, {
        general_settings: paymentSettings,
      });
      if (error) throw error;
      return data;
    }
    const { data, error } = await base44.entities[ENTITY].create({
      general_settings: paymentSettings,
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error saving general payment settings:', err);
    throw err;
  }
};

/**
 * Record an M-Pesa transaction.
 */
export const recordMpesaTransaction = async (transaction) => {
  try {
    const { data, error } = await base44.entities.mpesa_transactions.create(transaction);
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error recording M-Pesa transaction:', err);
    throw err;
  }
};

/**
 * List M-Pesa transactions (optionally filtered).
 */
export const listMpesaTransactions = async (filters = {}) => {
  try {
    const { data, error } = await base44.entities.mpesa_transactions.filter(filters, '-created_date');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error listing M-Pesa transactions:', err);
    throw err;
  }
};

/**
 * Update an M-Pesa transaction status (e.g., after callback).
 */
export const updateMpesaTransaction = async (id, updates) => {
  try {
    const { data, error } = await base44.entities.mpesa_transactions.update(id, updates);
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating M-Pesa transaction:', err);
    throw err;
  }
};
