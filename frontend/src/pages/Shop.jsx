import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const [cats, setCats] = useState([]);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState({ min: sp.get('min') || '', max: sp.get('max') || '' });
  const [filters, setFilters] = useState(false);

  const get = (k, d = '') => sp.get(k) || d;
  const set = (patch) => {
    const n = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v === '' || v == null ? n.delete(k) : n.set(k, v)));
    if (!('page' in patch)) n.delete('page');
    setSp(n);
  };

  useEffect(() => { api('/products/categories').then(setCats); }, []);
  useEffect(() => {
    setLoading(true);
    api('/products?' + sp.toString() + '&limit=12').then(setData).finally(() => setLoading(false));
  }, [sp]);

  const title = get('q') ? `Results for "${get('q')}"` : get('tab') === 'deals' ? 'Deals' : get('tab') === 'new' ? 'New Arrivals' : get('category') || 'All Products';

  return (
    <div className="container page">
      <div className="section-head">
        <div><h1 className="page-title">{title}</h1><span className="muted">{data.total} products</span></div>
        <div className="toolbar">
          <button className="btn btn-outline btn-sm filter-toggle" onClick={() => setFilters(!filters)}><SlidersHorizontal size={16} /> Filters</button>
          <select value={get('sort')} onChange={(e) => set({ sort: e.target.value })}>
            <option value="">Sort: Featured</option>
            <option value="popular">Popularity</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="discount">Biggest Discount</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="shop-layout">
        <aside className={'filters card' + (filters ? ' show' : '')}>
          <h4>Category</h4>
          <label className="radio"><input type="radio" checked={!get('category')} onChange={() => set({ category: '' })} /> All</label>
          {cats.map((c) => (
            <label className="radio" key={c.name}><input type="radio" checked={get('category') === c.name} onChange={() => set({ category: c.name })} /> {c.name} <small>({c.count})</small></label>
          ))}
          <h4>Price (₹)</h4>
          <div className="price-inputs">
            <input type="number" placeholder="Min" value={price.min} onChange={(e) => setPrice({ ...price, min: e.target.value })} />
            <input type="number" placeholder="Max" value={price.max} onChange={(e) => setPrice({ ...price, max: e.target.value })} />
          </div>
          <button className="btn btn-dark btn-sm full" onClick={() => set({ min: price.min, max: price.max })}>Apply</button>
          <h4>Rating</h4>
          {[['', 'Any'], ['4.5', '4.5★ & above'], ['4', '4★ & above'], ['3', '3★ & above']].map(([v, l]) => (
            <label className="radio" key={l}><input type="radio" checked={get('rating') === v} onChange={() => set({ rating: v })} /> {l}</label>
          ))}
          <label className="radio" style={{ marginTop: 14 }}><input type="checkbox" checked={get('tab') === 'deals'} onChange={(e) => set({ tab: e.target.checked ? 'deals' : '' })} /> Only deals</label>
          <button className="btn btn-outline btn-sm full" style={{ marginTop: 14 }} onClick={() => { setPrice({ min: '', max: '' }); setSp({}); }}>Clear all</button>
        </aside>

        <div>
          {loading ? <div className="center-msg">Loading products…</div> : data.items.length === 0 ? (
            <div className="empty card"><span>🔍</span><h3>No products found</h3><p>Try changing your filters or search term.</p></div>
          ) : <div className="grid-4">{data.items.map((p) => <ProductCard key={p.id} p={p} />)}</div>}
          {data.pages > 1 && (
            <div className="pager">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                <button key={n} className={'pill' + (data.page === n ? ' on' : '')} onClick={() => { set({ page: n }); window.scrollTo(0, 0); }}>{n}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
