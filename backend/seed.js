// Populates the database with demo users + products. Run: npm run seed  (resets all data!)
const bcrypt = require('bcryptjs');
const store = require('./db');

function buildSeed() {
  const now = Date.now();
  const hash = (p) => bcrypt.hashSync(p, 10);
  const base = { phone: '', address: null, cart: [], wishlist: [], createdAt: new Date(now).toISOString() };
  const users = [
    { id: 1, name: 'Admin', email: 'admin@shopsphere.com', password: hash('admin123'), role: 'admin', ...base },
    { id: 2, name: 'Aarav Mehta', email: 'seller@shopsphere.com', password: hash('seller123'), role: 'seller', storeName: 'Aarav Mehta Store', ...base },
    { id: 3, name: 'Riya Sharma', email: 'user@shopsphere.com', password: hash('user123'), role: 'customer', ...base,
      phone: '9876543210', address: { name: 'Riya Sharma', phone: '9876543210', line1: '12, Lake View Apartments', city: 'Pune', state: 'Maharashtra', pincode: '411001' } },
  ];
  // [name, subtitle, category, price, mrp, rating, reviews, emoji, image, sales, description]
  const rows = [
    ['SoundMax Pro', 'Wireless Headphones', 'Electronics', 4999, 7999, 4.8, 2300, '🎧', '/img/soundmax.jpg', 940, 'Over-ear wireless headphones with active noise cancellation, 40-hour battery life and plush memory-foam cushions for all-day comfort.'],
    ['FitPulse Smartwatch', 'Health & Fitness', 'Electronics', 3299, 4999, 4.6, 1800, '⌚', '/img/fitpulse.jpg', 870, 'AMOLED smartwatch with heart-rate and sleep tracking, 100+ sport modes, GPS and 7-day battery life.'],
    ['UrbanStride Sneakers', 'Everyday Comfort', 'Fashion', 2499, 3999, 4.7, 1100, '👟', '/img/urbanstride.jpg', 760, 'Minimal low-top sneakers with a cushioned insole and breathable upper. Pairs with everything.'],
    ['Vera Tote Bag', 'Premium Leather Finish', 'Accessories', 3999, 5999, 4.8, 890, '👜', '/img/veratote.jpg', 520, 'Structured tote with a premium vegan-leather finish, magnetic closure, zip pocket and laptop-friendly interior.'],
    ['Aura Table Lamp', 'Modern Home Decor', 'Home & Living', 1299, 1999, 4.9, 560, '💡', '/img/auralamp.jpg', 430, 'Warm-glow dome table lamp with brass-finish base and touch dimmer. Instant ambience for any room.'],
    ['Linen Classic Shirt', 'Breathable Summer Wear', 'Fashion', 1499, 2499, 4.5, 640, '👔', null, 410, 'Relaxed-fit pure linen shirt that stays cool and gets softer with every wash.'],
    ['Heritage Silk Scarf', 'Hand-printed Pattern', 'Accessories', 999, 1799, 4.4, 210, '🧣', null, 150, 'Lightweight silk-blend scarf with a hand-printed terracotta motif.'],
    ['Aviator Sunglasses', 'UV400 Polarised', 'Accessories', 1199, 1999, 4.3, 530, '🕶️', null, 320, 'Classic metal-frame aviators with polarised UV400 lenses.'],
    ['Leather Bifold Wallet', 'Handcrafted Genuine Leather', 'Accessories', 799, 1399, 4.6, 980, '👛', null, 600, 'Slim bifold wallet with 6 card slots, coin pocket and RFID protection.'],
    ['BoomBox Mini Speaker', 'Portable Bluetooth 5.3', 'Electronics', 1999, 2999, 4.5, 1500, '🔊', null, 690, 'Pocket-sized waterproof speaker with deep bass and 12-hour playtime.'],
    ['TypeCraft Keyboard', 'Wireless Mechanical', 'Electronics', 3499, 4999, 4.7, 740, '⌨️', null, 280, 'Compact hot-swappable mechanical keyboard with tactile switches and warm-white backlight.'],
    ['Terra Ceramic Vase', 'Handmade Stoneware', 'Home & Living', 899, 1499, 4.6, 190, '🏺', null, 120, 'Hand-thrown stoneware vase with a matte terracotta glaze.'],
    ['Cloud Cotton Bedsheet Set', '400 Thread Count', 'Home & Living', 1899, 3299, 4.4, 820, '🛏️', null, 390, 'Double bedsheet with 2 pillow covers in sateen-weave pure cotton.'],
    ['Glow Vitamin C Serum', 'Brightening Face Care', 'Beauty', 599, 999, 4.5, 2100, '🧴', null, 1100, '15% vitamin C serum with hyaluronic acid for visibly brighter, hydrated skin.'],
    ['Velvet Matte Lip Set', 'Set of 4 Nude Shades', 'Beauty', 749, 1299, 4.3, 1320, '💄', null, 750, 'Four long-wear matte lipsticks in warm nude and terracotta shades.'],
    ['ZenFlex Yoga Mat', '6mm Anti-skid', 'Sports & Fitness', 899, 1599, 4.6, 1700, '🧘', null, 830, 'Extra-grip eco-friendly yoga mat with alignment lines and carry strap.'],
    ['IronCore Dumbbell Set', 'Adjustable 2-20 kg', 'Sports & Fitness', 4499, 6999, 4.7, 450, '🏋️', null, 210, 'Space-saving adjustable dumbbells with quick-lock dial.'],
    ['SprintLite Running Shorts', 'Quick-dry Fabric', 'Sports & Fitness', 599, 999, 4.2, 380, '🩳', null, 260, 'Featherweight running shorts with zip pocket and moisture-wicking liner.'],
    ['The Quiet Entrepreneur', 'Business & Self-growth', 'Books', 349, 499, 4.7, 3200, '📘', null, 1500, 'A practical guide to building a calm, profitable business without burnout.'],
    ['Monsoon Letters', 'A Novel', 'Books', 299, 450, 4.5, 870, '📖', null, 640, 'A tender, atmospheric novel about two strangers who write letters through one rainy season.'],
    ['Cuddle Buddy Teddy', '40 cm Super Soft Plush', 'Toys & Games', 799, 1299, 4.8, 640, '🧸', null, 480, 'Huggable ultra-soft teddy bear, safe for toddlers and washable.'],
    ['Strategy Quest Board Game', '2-5 Players', 'Toys & Games', 1299, 1999, 4.6, 410, '🎲', null, 190, 'Family strategy board game: build, trade and out-think your friends in 45 minutes.'],
    ['Monstera Plant with Pot', 'Indoor Air-purifying', 'Lifestyle', 649, 999, 4.5, 360, '🪴', null, 340, 'Healthy live monstera in a ceramic pot. Low-maintenance and loves indirect light.'],
    ['Amber Soy Candle Trio', 'Hand-poured Scented', 'Lifestyle', 699, 1199, 4.7, 520, '🕯️', null, 400, 'Set of three hand-poured soy candles: amber, vanilla and sandalwood.'],
  ];
  const products = rows.map((r, i) => ({
    id: i + 1, name: r[0], subtitle: r[1], category: r[2], price: r[3], mrp: r[4], rating: r[5], reviews: r[6],
    emoji: r[7], image: r[8], sales: r[9], description: r[10], stock: 20 + ((i * 7) % 40), tags: [], active: true,
    sellerId: 2, sellerName: 'Aarav Mehta Store', createdAt: new Date(now - (rows.length - i) * 86400000).toISOString(),
  }));
  return { users, products, orders: [], counters: { users: 3, products: products.length, orders: 0 } };
}

function seed() { store.reset(buildSeed()); console.log('Database seeded.'); }
module.exports = { seed };
if (require.main === module) seed();
