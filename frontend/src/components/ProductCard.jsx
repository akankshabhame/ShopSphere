import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useApp } from '../AppContext';
import { money, discountOf } from '../api';

export function ProductImage({ p, className = '' }) {
  return p.image
    ? <img className={className} src={p.image} alt={p.name} loading="lazy" />
    : <div className={'emoji-art ' + className}><span>{p.emoji || '🛍️'}</span></div>;
}

export default function ProductCard({ p }) {
  const { inWish, toggleWish, addToCart } = useApp();
  const d = discountOf(p);
  const liked = inWish(p.id);
  return (
    <div className="card product-card">
      <div className="pc-img">
        <Link to={`/product/${p.id}`}><ProductImage p={p} /></Link>
        <button className={'heart' + (liked ? ' on' : '')} onClick={() => toggleWish(p)} aria-label="Wishlist"><Heart size={17} fill={liked ? 'currentColor' : 'none'} /></button>
        {p.stock <= 0 && <span className="oos">Out of stock</span>}
      </div>
      <div className="pc-body">
        <Link to={`/product/${p.id}`} className="pc-name">{p.name}</Link>
        <div className="pc-sub">{p.subtitle}</div>
        {p.reviews > 0 && <div className="rating"><Star size={13} fill="#E39B2D" stroke="#E39B2D" /> <b>{p.rating}</b> <span>({p.reviews >= 1000 ? (p.reviews / 1000).toFixed(1) + 'K' : p.reviews})</span></div>}
        <div className="pc-foot">
          <div className="price-row">
            <span className="price">{money(p.price)}</span>
            {d > 0 && <><s className="mrp">{money(p.mrp)}</s><span className="off">{d}% OFF</span></>}
          </div>
          <button className="cart-btn" onClick={() => addToCart(p)} disabled={p.stock <= 0} aria-label="Add to cart"><ShoppingCart size={17} /></button>
        </div>
      </div>
    </div>
  );
}
