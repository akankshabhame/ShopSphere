const router = require('express').Router();
const store = require('../db');
const { auth } = require('../middleware/auth');

const STATUSES = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
const FREE_SHIPPING_ABOVE = 499;
const SHIPPING_FEE = 49;

router.post('/', auth(), (req, res) => {
  const { items, address, payment } = req.body || {};
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'Your cart is empty' });
  const a = address || {};
  if (!a.name || !a.phone || !a.line1 || !a.city || !a.state || !a.pincode) return res.status(400).json({ error: 'Please complete the delivery address' });

  const lines = [];
  for (const it of items) {
    const p = store.db.products.find((x) => x.id === Number(it.id) && x.active !== false);
    const qty = Math.max(1, parseInt(it.qty) || 1);
    if (!p) return res.status(400).json({ error: 'A product in your cart is no longer available' });
    if (p.stock < qty) return res.status(400).json({ error: `Only ${p.stock} left of ${p.name}` });
    lines.push({ p, qty });
  }
  lines.forEach(({ p, qty }) => { p.stock -= qty; p.sales += qty; });
  const subtotal = lines.reduce((s, { p, qty }) => s + p.price * qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  const now = new Date().toISOString();
  const order = {
    id: 'SS' + (1000 + store.nextId('orders')),
    userId: req.user.id, customerName: req.user.name,
    items: lines.map(({ p, qty }) => ({ productId: p.id, name: p.name, price: p.price, qty, image: p.image, emoji: p.emoji, sellerId: p.sellerId })),
    subtotal, shipping, total: subtotal + shipping,
    address: a, payment: ['COD', 'UPI', 'Card'].includes(payment) ? payment : 'COD',
    status: 'Placed', timeline: [{ status: 'Placed', at: now }], createdAt: now,
  };
  store.db.orders.push(order);
  req.user.cart = [];
  store.save();
  res.status(201).json({ order });
});

router.get('/', auth(), (req, res) => {
  res.json({ orders: store.db.orders.filter((o) => o.userId === req.user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
});

router.get('/:id', auth(), (req, res) => {
  const o = store.db.orders.find((x) => x.id === req.params.id);
  const mine = o && (o.userId === req.user.id || req.user.role === 'admin' || o.items.some((i) => i.sellerId === req.user.id));
  if (!mine) return res.status(404).json({ error: 'Order not found' });
  res.json({ order: o });
});

router.put('/:id/cancel', auth(), (req, res) => {
  const o = store.db.orders.find((x) => x.id === req.params.id && x.userId === req.user.id);
  if (!o) return res.status(404).json({ error: 'Order not found' });
  if (!['Placed', 'Confirmed'].includes(o.status)) return res.status(400).json({ error: 'This order can no longer be cancelled' });
  o.items.forEach((i) => { const p = store.db.products.find((x) => x.id === i.productId); if (p) { p.stock += i.qty; p.sales = Math.max(0, p.sales - i.qty); } });
  o.status = 'Cancelled'; o.timeline.push({ status: 'Cancelled', at: new Date().toISOString() });
  store.save();
  res.json({ order: o });
});

module.exports = router;
module.exports.STATUSES = STATUSES;
