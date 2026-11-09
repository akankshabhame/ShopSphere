import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useApp } from '../AppContext';
import { money, FREE_SHIPPING_ABOVE, SHIPPING_FEE } from '../api';
import { ProductImage } from '../components/ProductCard';

export function Summary({ cart, total, children }) {
  const ship = total >= FREE_SHIPPING_ABOVE || total === 0 ? 0 : SHIPPING_FEE;
  const savings = cart.reduce((s, i) => s + (i.product.mrp - i.product.price) * i.qty, 0);
  return (
    <aside className="summary card">
      <h3>Order Summary</h3>
      <div className="row"><span>Subtotal</span><span>{money(total)}</span></div>
      {savings > 0 && <div className="row green"><span>You save</span><span>− {money(savings)}</span></div>}
      <div className="row"><span>Delivery</span><span>{ship ? money(ship) : 'FREE'}</span></div>
      {ship > 0 && <small className="muted">Add {money(FREE_SHIPPING_ABOVE - total)} more for free delivery</small>}
      <div className="row total"><span>Total</span><span>{money(total + ship)}</span></div>
      {children}
    </aside>
  );
}

export default function Cart() {
  const { cart, cartTotal, setQty, removeFromCart, user } = useApp();
  const nav = useNavigate();
  if (!cart.length) return (
    <div className="container page"><div className="empty card"><ShoppingBag size={48} strokeWidth={1.2} /><h3>Your cart is empty</h3><p>Looks like you haven't added anything yet.</p><Link to="/shop" className="btn btn-dark">Start shopping</Link></div></div>
  );
  return (
    <div className="container page">
      <h1 className="page-title">Shopping Cart <span className="muted">({cart.length} items)</span></h1>
      <div className="two-col">
        <div className="card list">
          {cart.map(({ product: p, qty }) => (
            <div className="line" key={p.id}>
              <Link to={`/product/${p.id}`} className="thumb"><ProductImage p={p} /></Link>
              <div className="line-info">
                <Link to={`/product/${p.id}`} className="pc-name">{p.name}</Link>
                <div className="pc-sub">{p.subtitle}</div>
                <div className="price-row"><span className="price">{money(p.price)}</span>{p.mrp > p.price && <s className="mrp">{money(p.mrp)}</s>}</div>
              </div>
              <div className="qty"><button onClick={() => setQty(p.id, qty - 1)}><Minus size={14} /></button><span>{qty}</span><button onClick={() => setQty(p.id, qty + 1)}><Plus size={14} /></button></div>
              <b className="line-total">{money(p.price * qty)}</b>
              <button className="ghost" onClick={() => removeFromCart(p.id)} aria-label="Remove"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
        <Summary cart={cart} total={cartTotal}>
          <button className="btn btn-dark full" onClick={() => nav(user ? '/checkout' : '/login', { state: { from: '/checkout' } })}>Proceed to Checkout</button>
          <Link to="/shop" className="btn btn-outline full">Continue shopping</Link>
        </Summary>
      </div>
    </div>
  );
}
