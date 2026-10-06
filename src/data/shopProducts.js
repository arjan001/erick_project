/**
 * Shop seed data + shared helpers (currency: Kenyan Shillings).
 *
 * Products are stored in the `ShopProduct` entity (see shopService.js). These
 * records only seed the catalogue the first time the shop is opened before a
 * database is connected.
 *
 * Auctions ("Grab Discount") come in two flavours:
 *   - time  → runs for `auction_duration_hours` from `auction_end_time`'s start,
 *             then a random participant wins the discount price.
 *   - count → closes as soon as `auction_target_count` participants have
 *             joined, then a random participant wins the discount price.
 */

export const SHOP_CURRENCY = 'KES';

export const formatKES = (amount) =>
  `KES ${Math.round(Number(amount) || 0).toLocaleString('en-KE')}`;

const hoursFromNow = (h) => new Date(Date.now() + h * 3600 * 1000).toISOString();

export const shopCategories = [
  { id: 'Wardrobe', label: 'Wardrobe', icon: '🎭' },
  { id: 'Equipment', label: 'Equipment', icon: '🎬' },
  { id: 'Merchandise', label: 'Merchandise', icon: '👕' },
  { id: 'Collectibles', label: 'Collectibles', icon: '🏆' },
  { id: 'Experiences', label: 'Experiences', icon: '✨' },
];

const base = {
  status: 'active',
  featured: false,
  sold: 0,
  auction_enabled: false,
  auction_type: 'time',
  auction_duration_hours: 24,
  auction_end_time: null,
  auction_target_count: 0,
  auction_participants: 0,
  auction_status: 'open',
  fulfillment: 'physical',
};

export const buildSeedProducts = () => [
  {
    ...base,
    id: 'seed-1',
    name: "Selina's Iconic Dress",
    image: 'https://images.unsplash.com/photo-1539109236226-a51a09e5105f?w=600&h=600&fit=crop',
    price: 65000,
    discount_price: 6500,
    category: 'Wardrobe',
    sku: 'WD-001',
    stock: 1,
    featured: true,
    description:
      "The legendary dress worn by Selina in the hit series finale. A collector's dream — authenticated and preserved in pristine condition. Comes with a certificate of authenticity signed by the wardrobe department.",
    auction_enabled: true,
    auction_type: 'time',
    auction_duration_hours: 6,
    auction_end_time: hoursFromNow(6),
  },
  {
    ...base,
    id: 'seed-2',
    name: "Director's Clapperboard",
    image: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=600&fit=crop',
    price: 15500,
    discount_price: null,
    category: 'Equipment',
    sku: 'EQ-001',
    stock: 15,
    description:
      'Authentic wooden clapperboard used on major film sets. Perfect for display or as a gift for film enthusiasts.',
  },
  {
    ...base,
    id: 'seed-3',
    name: 'SmartGigs Branded Hoodie',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95109ea?w=600&h=600&fit=crop',
    price: 5800,
    discount_price: 3200,
    category: 'Merchandise',
    sku: 'MR-001',
    stock: 50,
    featured: true,
    description:
      'Premium cotton hoodie with embroidered SmartGigs Kenya logo. Unisex sizing. Available in black, navy, and grey.',
    auction_enabled: true,
    auction_type: 'count',
    auction_target_count: 1000,
    auction_participants: 412,
  },
  {
    ...base,
    id: 'seed-4',
    name: 'Vintage Film Camera Lens',
    image: 'https://images.unsplash.com/photo-1452780210645-1f9d8adf5a37?w=600&h=600&fit=crop',
    price: 103000,
    discount_price: null,
    category: 'Equipment',
    sku: 'EQ-002',
    stock: 3,
    description:
      'Rare 35mm vintage lens, fully functional. A piece of cinema history — perfect for collectors and working cinematographers alike.',
  },
  {
    ...base,
    id: 'seed-5',
    name: 'Premiere VIP Pass — Nairobi Film Fest',
    image: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=600&h=600&fit=crop',
    price: 19500,
    discount_price: 3900,
    category: 'Experiences',
    sku: 'EX-001',
    stock: 1,
    featured: true,
    fulfillment: 'digital',
    description:
      'Exclusive VIP access to the Nairobi Film Festival premiere night. Red carpet included, plus backstage meet-and-greet with the cast. Delivered as an e-ticket by email.',
    auction_enabled: true,
    auction_type: 'time',
    auction_duration_hours: 48,
    auction_end_time: hoursFromNow(48),
  },
  {
    ...base,
    id: 'seed-6',
    name: 'SmartGigs Cap — Limited Edition',
    image: 'https://images.unsplash.com/photo-1588850561407-9ae1f3c4e3e4?w=600&h=600&fit=crop',
    price: 3200,
    discount_price: null,
    category: 'Merchandise',
    sku: 'MR-002',
    stock: 100,
    description: 'Classic snapback cap with woven SmartGigs Kenya patch. One size fits most.',
  },
  {
    ...base,
    id: 'seed-7',
    name: 'Script — Signed by Cast',
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&h=600&fit=crop',
    price: 39000,
    discount_price: 6500,
    category: 'Collectibles',
    sku: 'CL-001',
    stock: 1,
    description:
      'Original shooting script autographed by the entire main cast. A one-of-a-kind piece for serious collectors.',
    auction_enabled: true,
    auction_type: 'count',
    auction_target_count: 500,
    auction_participants: 87,
  },
  {
    ...base,
    id: 'seed-8',
    name: 'Production Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d76e?w=600&h=600&fit=crop',
    price: 26000,
    discount_price: null,
    category: 'Equipment',
    sku: 'EQ-003',
    stock: 8,
    description:
      'Studio-grade monitoring headphones. Used on professional sets — pristine sound isolation and clarity.',
  },
  {
    ...base,
    id: 'seed-9',
    name: 'Film Festival Poster Bundle',
    image: 'https://images.unsplash.com/photo-1516969685866-cea9f79b9b8e?w=600&h=600&fit=crop',
    price: 8500,
    discount_price: 4200,
    category: 'Collectibles',
    sku: 'CL-002',
    stock: 25,
    description:
      'Set of 5 authentic festival posters from major African film events. Each poster is A2 size and printed on high-quality paper.',
    auction_enabled: true,
    auction_type: 'time',
    auction_duration_hours: 12,
    auction_end_time: hoursFromNow(12),
  },
  {
    ...base,
    id: 'seed-10',
    name: 'Behind the Scenes Photo Book',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=600&fit=crop',
    price: 12000,
    discount_price: null,
    category: 'Merchandise',
    sku: 'MR-003',
    stock: 40,
    description:
      'Hardcover photo book featuring exclusive behind-the-scenes shots from award-winning Kenyan productions. 120 pages of cinematic excellence.',
  },
];
