import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Truck, RefreshCcw, ShieldCheck, Minus, Plus, Store } from 'lucide-react';
import { api, money, discountOf, FREE_SHIPPING_ABOVE } from '../api';
import { useApp } from '../AppContext';
import { ProductImage } from '../components/ProductCard';
import ProductCard from '../components/ProductCard';

export default function Product() {
  const { id } = useParams();
  const nav = useNavigate();
  const { addToCart, inWish, toggleWish } = useApp();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => { setData(null); setQty(1); setErr(''); api('/products/' + id).then(setData).catch((e) => setErr(e.message)); }, [id]);
  if (err) return <div className="center-msg"><h2>{err}</h2><Link to="/shop" className="btn btn-dark">Back to shop</Link></div>;
  if (!data) return <div className="center-msg">Loading…</div>;

  const p = data.product;
  const d = discountOf(p);
  return (
    <div className="container page">
      <div className="crumbs"><Link to="/">Home</Link> / <Link to={`/shop?category=${encodeURIComponent(p.category)}`}>{p.category}</Link> / {p.name}</div>
      <div className="pd card">
        <div className="pd-img"><ProductImage p={p} /></div>
        <div className="pd-info">
          <span className="tag">{p.category}</span>
          <h1>{p.name}</h1>
          <p className="muted">{p.subtitle}</p>
          {p.reviews > 0 && <div className="rating big"><Star size={16} fill="#E39B2D" stroke="#E39B2D" /> <b>{p.rating}</b> <span>({p.reviews.toLocaleString('en-IN')} reviews)</span></div>}
          <div className="price-row big"><span className="price">{money(p.price)}</span>{d > 0 && <><s className="mrp">{money(p.mrp)}</s><span className="off">{d}% OFF</span></>}</div>
          <p className="desc">{p.description}</p>
          <div className={'stock ' + (p.stock > 5 ? 'ok' : p.stock > 0 ? 'low' : 'out')}>{p.stock > 5 ? 'In stock' : p.stock > 0 ? `Only ${p.stock} left!` : 'Out of stock'}</div>
          <div className="qty-row">
            <div className="qty"><button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={15} /></button><span>{qty}</span><button onClick={() => setQty(Math.min(p.stock, qty + 1))}><Plus size={15} /></button></div>
            <button className="btn btn-dark" disabled={p.stock <= 0} onClick={() => addToCart(p, qty)}><ShoppingCart size={18} /> Add to Cart</button>
            <button className="btn btn-terra" disabled={p.stock <= 0} onClick={() => { addToCart(p, qty, true); nav('/checkout'); }}>Buy Now</button>
            <button className={'btn btn-outline icon-only' + (inWish(p.id) ? ' liked' : '')} onClick={() => toggleWish(p)} aria-label="Wishlist"><Heart size={18} fill={inWish(p.id) ? 'currentColor' : 'none'} /></button>
          </div>
          <div className="perks">
            <div><Truck size={18} /> {p.price >= FREE_SHIPPING_ABOVE ? 'Free delivery' : 'Free delivery above ₹499'}</div>
            <div><RefreshCcw size={18} /> 7-day easy returns</div>
            <div><ShieldCheck size={18} /> Secure payments</div>
            <div><Store size={18} /> Sold by {p.sellerName}</div>
          </div>
        </div>
      </div>
      {data.related.length > 0 && (
        <section className="section"><div className="section-head"><h2>You may also like</h2></div><div className="grid-4">{data.related.map((r) => <ProductCard key={r.id} p={r} />)}</div></section>
      )}
    </div>
  );
}
