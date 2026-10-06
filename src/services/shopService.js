import { base44 } from '@/api/base44Client';
import { buildSeedProducts } from '@/data/shopProducts';

const productsEntity = base44.entities.products || {
  list: async () => [],
  filter: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
};

const seedProducts = buildSeedProducts();

/**
 * Check if a product is an auction product
 */
export function isAuctionProduct(product) {
  return product?.auction_enabled || product?.auction_type && product.auction_type !== 'none';
}

/**
 * Calculate discount percentage
 */
export function discountPercent(product) {
  if (!product.discount_price || !product.price) return 0;
  return Math.round(((product.price - product.discount_price) / product.price) * 100);
}

/**
 * List all products
 */
export async function listProducts() {
  try {
    const products = await productsEntity.list('created_at', 100);
    if (products && products.length > 0) return products;
    // Fallback to seed products if entity is empty
    return seedProducts;
  } catch (error) {
    console.error('Failed to list products:', error);
    return seedProducts;
  }
}

/**
 * Get a single product by ID
 */
export async function getProduct(id) {
  try {
    // Try entity first
    const product = await productsEntity.get(id);
    if (product) return product;

    // Fallback to seed products for development
    const seedProduct = seedProducts.find(p => String(p.id) === String(id));
    if (seedProduct) return seedProduct;

    return null;
  } catch (error) {
    console.error('Failed to get product:', error);
    // Fallback to seed products on error
    const seedProduct = seedProducts.find(p => String(p.id) === String(id));
    return seedProduct || null;
  }
}

/**
 * Create a new product
 */
export async function createProduct(data) {
  try {
    return await productsEntity.create({
      ...data,
      created_at: new Date().toISOString(),
      status: data.status || 'active',
    });
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
}

/**
 * Update a product
 */
export async function updateProduct(id, data) {
  try {
    return await productsEntity.update(id, {
      ...data,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to update product:', error);
    throw error;
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(id) {
  try {
    await productsEntity.delete(id);
    return true;
  } catch (error) {
    console.error('Failed to delete product:', error);
    throw error;
  }
}

/**
 * Filter products by category or auction status
 */
export async function filterProducts(filters) {
  try {
    return await productsEntity.filter(filters, 'created_at', 100);
  } catch (error) {
    console.error('Failed to filter products:', error);
    return [];
  }
}

/**
 * Check if an auction is still active
 */
export function isAuctionActive(product) {
  if (!isAuctionProduct(product)) return false;

  const now = new Date();
  const endTime = product.auction_end_time ? new Date(product.auction_end_time) : null;

  if (product.auction_type === 'time' || product.auction_type === 'time_based') {
    return endTime && now < endTime;
  }

  if (product.auction_type === 'count' || product.auction_type === 'count_based') {
    const target = product.auction_target_count || 1000;
    const current = product.auction_participants || 0;
    return current < target;
  }

  return false;
}

/**
 * Get auction info for display
 */
export function getAuctionInfo(product, now = Date.now()) {
  if (!isAuctionProduct(product)) {
    return { type: null, open: false, progress: 0, participants: 0, target: 0, timeLeft: 0, settled: false, due: false };
  }

  const type = product.auction_type === 'count' || product.auction_type === 'count_based' ? 'count' : 'time';
  const endTime = product.auction_end_time ? new Date(product.auction_end_time).getTime() : 0;
  const target = product.auction_target_count || 1000;
  const participants = product.auction_participants || 0;
  const progress = type === 'count' ? Math.min((participants / target) * 100, 100) : 0;
  const timeLeft = type === 'time' ? Math.max(0, endTime - now) : 0;
  const open = isAuctionActive(product);
  const settled = product.auction_status === 'completed';
  const due = type === 'time' && timeLeft <= 0;

  return { type, open, progress, participants, target, timeLeft, settled, due };
}

/**
 * Check if user has joined auction
 */
export async function hasJoinedAuction(productId, userEmail) {
  try {
    const product = await getProduct(productId);
    if (!product) return false;
    const participants = product.auction_participants || [];
    return participants.includes(userEmail);
  } catch (error) {
    console.error('Failed to check auction participation:', error);
    return false;
  }
}

/**
 * Join an auction (time-based or count-based)
 */
export async function joinAuction(product, user) {
  try {
    if (!isAuctionActive(product)) {
      throw new Error('Auction is not active');
    }

    const userEmail = user.email;
    const participants = product.auction_participants || [];

    if (participants.includes(userEmail)) {
      return { product, already: true };
    }

    const updatedProduct = await updateProduct(product.id, {
      auction_participants: [...participants, userEmail],
    });

    // Check if auction should end for count-based
    if (product.auction_type === 'count' || product.auction_type === 'count_based') {
      const newCount = participants.length + 1;
      const target = product.auction_target_count || 1000;

      if (newCount >= target) {
        // Select random winner
        const winnerIndex = Math.floor(Math.random() * newCount);
        const winnerEmail = [...participants, userEmail][winnerIndex];

        await updateProduct(product.id, {
          auction_winner_email: winnerEmail,
          auction_status: 'completed',
          auction_end_time: new Date().toISOString(),
        });
      }
    }

    return { product: updatedProduct, already: false };
  } catch (error) {
    console.error('Failed to join auction:', error);
    throw error;
  }
}

/**
 * Select a random winner for time-based auction
 */
export async function selectAuctionWinner(productId) {
  try {
    const product = await getProduct(productId);
    if (!product || (product.auction_type !== 'time' && product.auction_type !== 'time_based')) {
      throw new Error('Invalid auction');
    }

    const participants = product.auction_participants || [];
    if (participants.length === 0) {
      throw new Error('No participants');
    }

    const winnerIndex = Math.floor(Math.random() * participants.length);
    const winnerEmail = participants[winnerIndex];

    await updateProduct(productId, {
      auction_winner_email: winnerEmail,
      auction_status: 'completed',
      auction_end_time: new Date().toISOString(),
    });

    return winnerEmail;
  } catch (error) {
    console.error('Failed to select winner:', error);
    throw error;
  }
}

// ============================================================================
// SHOP SETTINGS
// ============================================================================

export const DEFAULT_SHOP_SETTINGS = {
  enableMpesa: true,
  enableCard: false,
  shippingThreshold: 5000,
  shippingCost: 500,
  autoConfirmOrders: true,
};

export async function getShopSettings() {
  try {
    const settingsEntity = base44.entities.shop_settings || {
      get: async () => null,
    };
    const settings = await settingsEntity.get('default');
    return settings || DEFAULT_SHOP_SETTINGS;
  } catch {
    return DEFAULT_SHOP_SETTINGS;
  }
}

// ============================================================================
// CART & CHECKOUT
// ============================================================================

const cartStorageKey = 'smartgigs_cart';

export function getCart() {
  try {
    const raw = localStorage.getItem(cartStorageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCart(items) {
  localStorage.setItem(cartStorageKey, JSON.stringify(items));
}

export function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.product_id === product.id);

  if (existing) {
    existing.quantity = Number(existing.quantity) + quantity;
  } else {
    cart.push({
      id: Date.now().toString(),
      product_id: product.id,
      product_name: product.name,
      image: product.image || product.images?.[0],
      unit_price: product.discount_price || product.price,
      quantity,
      is_auction_claim: false,
    });
  }

  setCart(cart);
  return cart;
}

export function removeFromCart(itemId) {
  const cart = getCart().filter(item => item.id !== itemId);
  setCart(cart);
  return cart;
}

export function updateCartQuantity(itemId, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.id === itemId);
  if (item) {
    item.quantity = Math.max(1, Number(quantity));
    setCart(cart);
  }
  return cart;
}

export function clearCart() {
  localStorage.removeItem(cartStorageKey);
}

export function calcTotals(cart, settings) {
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.unit_price) * Number(item.quantity)), 0);
  const needsShipping = cart.some(item => !item.is_auction_claim);
  const shipping = needsShipping && subtotal < (settings.shippingThreshold || 5000) ? (settings.shippingCost || 500) : 0;
  const total = subtotal + shipping;
  return { subtotal, shipping, total, needsShipping };
}

// ============================================================================
// ORDERS
// ============================================================================

const OrderStore = {
  async list() {
    try {
      const entity = base44.entities.shop_orders || { list: async () => [] };
      return await entity.list('-created_at', 100);
    } catch {
      return [];
    }
  },

  async create(data) {
    try {
      const entity = base44.entities.shop_orders || { create: async () => null };
      return await entity.create({
        ...data,
        created_at: new Date().toISOString(),
      });
    } catch {
      return null;
    }
  },

  async update(id, data) {
    try {
      const entity = base44.entities.shop_orders || { update: async () => null };
      return await entity.update(id, {
        ...data,
        updated_at: new Date().toISOString(),
      });
    } catch {
      return null;
    }
  },

  async delete(id) {
    try {
      const entity = base44.entities.shop_orders || { delete: async () => null };
      await entity.delete(id);
    } catch {
      // ignore
    }
  },
};

export async function createOrder({ user, items, customer, totals, paymentMethod }) {
  const orderNumber = 'ORD-' + Date.now().toString().slice(-10);

  const order = await OrderStore.create({
    order_number: orderNumber,
    user_id: user?.id,
    customer_name: customer.name,
    customer_email: customer.email,
    customer_phone: customer.phone,
    delivery_address: customer.address,
    city: customer.city,
    county: customer.county,
    delivery_notes: customer.notes,
    subtotal: totals.subtotal,
    shipping_cost: totals.shipping,
    total: totals.total,
    currency: 'KES',
    payment_method: paymentMethod,
    payment_status: 'pending',
    order_status: 'pending',
  });

  // Create order items
  const orderItemsEntity = base44.entities.shop_order_items || { create: async () => null };
  for (const item of items) {
    await orderItemsEntity.create({
      order_id: order?.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.image,
      unit_price: item.unit_price,
      quantity: item.quantity,
      is_auction_claim: item.is_auction_claim,
    });
  }

  return order;
}

export async function applyOrderToInventory(order) {
  if (order.order_status === 'confirmed') {
    const items = await base44.entities.shop_order_items?.filter({ order_id: order.id }) || [];
    for (const item of items) {
      const product = await getProduct(item.product_id);
      if (product && product.stock !== null) {
        await updateProduct(item.product_id, {
          stock: Math.max(0, product.stock - item.quantity),
          sold: (product.sold || 0) + item.quantity,
        });
      }
    }
  }
}

export async function sendOrderConfirmation(order, settings) {
  console.log('Order confirmation email would be sent to:', order.customer_email);
  return true;
}

export function generateOrderNumber() {
  return 'ORD-' + Date.now().toString().slice(-10);
}

// ============================================================================
// CARD PAYMENTS (for testing only - never store full card details)
// ============================================================================

const cardPaymentsStorageKey = 'smartgigs_card_payments';

const CardPaymentStore = {
  async list() {
    try {
      const raw = localStorage.getItem(cardPaymentsStorageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async create(data) {
    const list = await this.list();
    const newItem = {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      created_date: new Date().toISOString(),
    };
    list.push(newItem);
    localStorage.setItem(cardPaymentsStorageKey, JSON.stringify(list));
    return newItem;
  },

  async update(id, data) {
    const list = await this.list();
    const index = list.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');
    list[index] = { ...list[index], ...data, updated_at: new Date().toISOString() };
    localStorage.setItem(cardPaymentsStorageKey, JSON.stringify(list));
    return list[index];
  },

  async delete(id) {
    const list = await this.list();
    const filtered = list.filter(item => item.id !== id);
    localStorage.setItem(cardPaymentsStorageKey, JSON.stringify(filtered));
  },
};

export async function listCardPayments() {
  return await CardPaymentStore.list();
}

export async function recordCardAttempt({ user, customer, card, items, totals, reference }) {
  const itemsSummary = items.map(i => `${i.product_name} x${i.quantity}`).join(', ');

  // For localhost testing, capture full card details
  return await CardPaymentStore.create({
    order_id: null,
    user_id: user?.id,
    cardholder_name: card.name,
    card_brand: card.brand,
    card_number: card.number, // Full number for testing
    card_last4: card.last4,
    card_cvv: card.cvv, // CVV for testing
    exp_month: card.expMonth,
    exp_year: card.expYear,
    amount: totals.total,
    currency: 'KES',
    status: 'not_processed',
    reference,
    customer_name: customer.name,
    customer_email: customer.email,
    customer_phone: customer.phone,
    items_summary: itemsSummary,
  });
}

// ============================================================================
// M-PESA (placeholder - actual implementation in mpesaService.js)
// ============================================================================

export async function resolveMpesaGateway(settings) {
  return {
    shortcode: settings.mpesa_shortcode || '174379',
    consumerKey: settings.mpesa_consumer_key || '',
    consumerSecret: settings.mpesa_consumer_secret || '',
    environment: settings.mpesa_environment || 'sandbox',
  };
}

export async function startMpesaPayment({ gateway, phone, amount, reference, description }) {
  return {
    checkoutRequestId: 'ws_CO_' + Date.now(),
    merchantRequestId: 'MRS_' + Date.now(),
  };
}

export async function waitForMpesaPayment({ gateway, checkoutRequestId }) {
  return {
    status: 'success',
    receipt: 'MGF' + Date.now().toString().slice(-8),
  };
}

export async function logMpesaTransaction(data) {
  console.log('M-Pesa transaction logged:', data);
}

export { CardPaymentStore, OrderStore };
