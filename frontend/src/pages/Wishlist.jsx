import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useApp } from '../AppContext';
import { api } from '../api';
import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { wishlist } = useApp();
  const [fresh, setFresh] = useState({});

  
  useEffect(() => {
    Promise.all(wishlist.map((w) => api('/products/' + w.id).then((r) => r.product).catch(() => null)))
      .then((list) => setFresh(Object.fromEntries(list.filter(Boolean).map((p) => [p.id, p]))));
  }, [wishlist.length]);

  if (!wishlist.length) return (
    <div className="container page"><div className="empty card"><Heart size={48} strokeWidth={1.2} /><h3>Your wishlist is empty</h3><p>Tap the heart on any product to save it here.</p><Link to="/shop" className="btn btn-dark">Browse products</Link></div></div>
  );
  return (
    <div className="container page">
      <h1 className="page-title">My Wishlist <span className="muted">({wishlist.length})</span></h1>
      <div className="grid-4">{wishlist.map((w) => <ProductCard key={w.id} p={{ rating: 0, reviews: 0, ...w, ...(fresh[w.id] || {}) }} />)}</div>
    </div>
  );
}
