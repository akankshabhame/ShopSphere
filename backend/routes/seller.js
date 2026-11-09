const router = require('express').Router();
const store = require('../db');
const { auth } = require('../middleware/auth');
const { CATEGORIES } = require('./products');
const { STATUSES } = require('./orders');

router.use(auth('seller', 'admin'));

const mineOrders = (u) => store.db.orders.filter((o) => o.items.some((i) => i.sellerId === u.id));

router.get('/stats', (req, res) => {
  const products = store.db.products.filter((p) => p.sellerId === req.user.id && p.active !== false);
  const orders = mineOrders(req.user);
  const sold = orders.filter((o) => o.status !== 'Cancelled').flatMap((o) => o.items.filter((i) => i.sellerId === req.user.id));
  res.json({
    products: products.length,
    orders: orders.length,
    unitsSold: sold.reduce((s, i) => s + i.qty, 0),
    revenue: sold.reduce((s, i) => s + i.qty * i.price, 0),
    lowStock: products.filter((p) => p.stock <= 5).length,
    byStatus: [...STATUSES, 'Cancelled'].map((s) => ({ status: s, count: orders.filter((o) => o.status === s).length })),
  });
});

router.get('/products', (req, res) => res.json({ products: store.db.products.filter((p) => p.sellerId === req.user.id && p.active !== false) }));

function clean(b) {
  const out = {
    name: String(b.name || '').trim(), subtitle: String(b.subtitle || '').trim(),
    category: CATEGORIES.includes(b.category) ? b.category : null,
    price: Number(b.price), mrp: Number(b.mrp) || Number(b.price), stock: parseInt(b.stock),
    emoji: b.emoji || '🛍️', image: b.image ? String(b.image).trim() : null, description: String(b.description || '').trim(),
  };
  if (!out.name || !out.category || !(out.price > 0) || !(out.stock >= 0)) return null;
  if (out.mrp < out.price) out.mrp = out.price;
  return out;
}

router.post('/products', (req, res) => {
  const d = clean(req.body || {});
  if (!d) return res.status(400).json({ error: 'Name, category, a valid price and stock are required' });
  const p = { id: store.nextId('products'), ...d, rating: 0, reviews: 0, sales: 0, tags: [], active: true,
    sellerId: req.user.id, sellerName: req.user.storeName || req.user.name, createdAt: new Date().toISOString() };
  store.db.products.push(p); store.save();
  res.status(201).json({ product: p });
});

router.put('/products/:id', (req, res) => {
  const p = store.db.products.find((x) => x.id === Number(req.params.id) && (x.sellerId === req.user.id || req.user.role === 'admin'));
  if (!p) return res.status(404).json({ error: 'Product not found' });
  const d = clean({ ...p, ...req.body });
  if (!d) return res.status(400).json({ error: 'Invalid product details' });
  Object.assign(p, d); store.save();
  res.json({ product: p });
});

router.delete('/products/:id', (req, res) => {
  const p = store.db.products.find((x) => x.id === Number(req.params.id) && (x.sellerId === req.user.id || req.user.role === 'admin'));
  if (!p) return res.status(404).json({ error: 'Product not found' });
  p.active = false; store.save();
  res.json({ ok: true });
});

router.get('/orders', (req, res) => {
  const orders = mineOrders(req.user).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ orders: orders.map((o) => ({ ...o, items: o.items.filter((i) => i.sellerId === req.user.id) })) });
});

router.put('/orders/:id/status', (req, res) => {
  const o = mineOrders(req.user).find((x) => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: 'Order not found' });
  if (!STATUSES.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });
  if (o.status === 'Cancelled') return res.status(400).json({ error: 'Order was cancelled' });
  o.status = req.body.status;
  if (!o.timeline.some((t) => t.status === o.status)) o.timeline.push({ status: o.status, at: new Date().toISOString() });
  store.save();
  res.json({ order: o });
});

module.exports = router;
