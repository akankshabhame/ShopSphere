const router = require('express').Router();
const store = require('../db');

const CATEGORIES = ['Fashion', 'Electronics', 'Home & Living', 'Beauty', 'Sports & Fitness', 'Books', 'Toys & Games', 'Lifestyle', 'Accessories'];
const disc = (p) => (p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0);
const view = (p) => ({ ...p, discount: disc(p) });

router.get('/categories', (req, res) => {
  const active = store.db.products.filter((p) => p.active !== false);
  res.json(CATEGORIES.map((name) => ({ name, count: active.filter((p) => p.category === name).length })));
});

router.get('/', (req, res) => {
  let list = store.db.products.filter((p) => p.active !== false);
  const { q, category, min, max, rating, sort, tab } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(48, parseInt(req.query.limit) || 12);

  if (category) list = list.filter((p) => p.category === category);
  if (q) {
    const s = String(q).toLowerCase();
    list = list.filter((p) => `${p.name} ${p.subtitle} ${p.category} ${(p.tags || []).join(' ')}`.toLowerCase().includes(s));
  }
  if (min) list = list.filter((p) => p.price >= Number(min));
  if (max) list = list.filter((p) => p.price <= Number(max));
  if (rating) list = list.filter((p) => p.rating >= Number(rating));
  if (tab === 'deals') list = list.filter((p) => disc(p) > 0);

  const sorters = {
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    discount: (a, b) => disc(b) - disc(a),
    popular: (a, b) => b.sales - a.sales,
    curated: (a, b) => a.id - b.id,
  };
  const tabSort = { trending: 'curated', new: 'newest', best: 'rating', deals: 'discount' }[tab];
  const key = sort || tabSort;
  if (sorters[key]) list = [...list].sort(sorters[key]);

  const total = list.length;
  res.json({ items: list.slice((page - 1) * limit, page * limit).map(view), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

router.get('/:id', (req, res) => {
  const p = store.db.products.find((x) => x.id === Number(req.params.id) && x.active !== false);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  const related = store.db.products.filter((x) => x.category === p.category && x.id !== p.id && x.active !== false).slice(0, 4).map(view);
  res.json({ product: view(p), related });
});

module.exports = router;
module.exports.CATEGORIES = CATEGORIES;
