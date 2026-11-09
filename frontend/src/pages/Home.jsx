import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Store, Truck, ShieldCheck, RefreshCcw, Headphones, Shirt, Laptop, Sofa, Sparkles, Dumbbell, BookOpen, Gamepad2, Leaf, Watch, Tag, Flame } from 'lucide-react';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

const CAT_ICONS = {
  Fashion: Shirt, Electronics: Laptop, 'Home & Living': Sofa, Beauty: Sparkles, 'Sports & Fitness': Dumbbell,
  Books: BookOpen, 'Toys & Games': Gamepad2, Lifestyle: Leaf, Accessories: Watch,
};
const TABS = [['trending', 'Trending', true], ['new', 'New Arrivals'], ['best', 'Best Sellers'], ['deals', 'Deals']];

export default function Home() {
  const [cats, setCats] = useState([]);
  const [tab, setTab] = useState('trending');
  const [items, setItems] = useState([]);

  useEffect(() => { api('/products/categories').then(setCats).catch(() => {}); }, []);
  useEffect(() => { api(`/products?tab=${tab}&limit=5`).then((r) => setItems(r.items)).catch(() => {}); }, [tab]);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="eyebrow">DISCOVER • SHOP • SELL</div>
            <h1>Everything You Love,<br />All in One Place</h1>
            <p>From everyday essentials to trending styles — Shop, sell, and grow with ShopSphere.</p>
            <div className="hero-btns">
              <Link to="/shop" className="btn btn-dark">Shop Now <ArrowRight size={18} /></Link>
              <Link to="/register?role=seller" className="btn btn-outline"><Store size={18} /> Become a Seller</Link>
            </div>
            <div className="dots"><i className="on" /><i /><i /></div>
          </div>
          <div className="hero-art"><img src="/img/hero.jpg" alt="Premium products" /></div>
        </div>
      </section>

      <div className="container">
        <section className="services">
          {[[Truck, 'Free Delivery', 'On orders above ₹499'], [ShieldCheck, 'Secure Payments', '100% safe & encrypted'], [RefreshCcw, 'Easy Returns', '7-day return policy'], [Headphones, '24/7 Support', "We're always here to help"]].map(([I, t, s]) => (
            <div className="service" key={t}><I size={34} strokeWidth={1.4} /><div><b>{t}</b><span>{s}</span></div></div>
          ))}
        </section>

        <section className="section">
          <div className="section-head"><h2>Shop by Category</h2><Link to="/shop" className="link">View All <ArrowRight size={16} /></Link></div>
          <div className="cat-grid">
            {cats.map((c) => { const I = CAT_ICONS[c.name] || Tag; return (
              <Link key={c.name} to={`/shop?category=${encodeURIComponent(c.name)}`} className="cat"><I size={34} strokeWidth={1.4} /><span>{c.name}</span></Link>
            ); })}
            <Link to="/shop?tab=deals" className="cat"><Tag size={34} strokeWidth={1.4} /><span>Deals</span></Link>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>{TABS.find((t) => t[0] === tab)[1]} Products</h2>
            <div className="pills">
              {TABS.map(([k, label]) => (
                <button key={k} className={'pill' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{k === 'trending' && <Flame size={14} />} {label}</button>
              ))}
            </div>
          </div>
          <div className="grid-5">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        </section>

        <section className="seller-cta">
          <div><h2>Have something to sell?</h2><p>Open your ShopSphere store in minutes — list products, manage orders and grow with our seller dashboard.</p></div>
          <Link to="/register?role=seller" className="btn btn-light">Start selling <ArrowRight size={18} /></Link>
        </section>
      </div>
    </>
  );
}
