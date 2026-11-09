import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Banknote, Smartphone, CreditCard } from 'lucide-react';
import { useApp } from '../AppContext';
import { api, money } from '../api';
import { Summary } from './Cart';
import { ProductImage } from '../components/ProductCard';

const PAY = [['COD', 'Cash on Delivery', Banknote], ['UPI', 'UPI', Smartphone], ['Card', 'Credit / Debit Card', CreditCard]];

export default function Checkout() {
  const { user, cart, cartTotal, clearCart, notify } = useApp();
  const nav = useNavigate();
  const [a, setA] = useState(user.address || { name: user.name, phone: user.phone || '', line1: '', city: '', state: '', pincode: '' });
  const [pay, setPay] = useState('COD');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const f = (k) => ({ value: a[k] || '', onChange: (e) => setA({ ...a, [k]: e.target.value }) });

  if (!cart.length) return <div className="container page"><div className="empty card"><h3>Nothing to checkout</h3><Link to="/shop" className="btn btn-dark">Shop now</Link></div></div>;

  const place = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      if (!/^\d{6}$/.test(a.pincode)) throw new Error('Enter a valid 6-digit pincode');
      const { order } = await api('/orders', { method: 'POST', body: { items: cart.map((i) => ({ id: i.product.id, qty: i.qty })), address: a, payment: pay } });
      if (!user.address) await api('/auth/profile', { method: 'PUT', body: { address: a, phone: a.phone } }).catch(() => {});
      clearCart(); notify('Order placed successfully 🎉');
      nav('/orders/' + order.id, { state: { placed: true } });
    } catch (ex) { setErr(ex.message); } finally { setBusy(false); }
  };

  return (
    <div className="container page">
      <h1 className="page-title">Checkout</h1>
      <form className="two-col" onSubmit={place}>
        <div>
          <div className="card pad">
            <h3>Delivery Address</h3>
            <div className="form-grid">
              <label>Full name<input required {...f('name')} /></label>
              <label>Phone<input required {...f('phone')} /></label>
              <label className="span2">Address<input required placeholder="House no, street, area" {...f('line1')} /></label>
              <label>City<input required {...f('city')} /></label>
              <label>State<input required {...f('state')} /></label>
              <label>Pincode<input required maxLength={6} {...f('pincode')} /></label>
            </div>
          </div>
          <div className="card pad" style={{ marginTop: 20 }}>
            <h3>Payment Method</h3>
            <div className="pay-grid">
              {PAY.map(([k, label, I]) => <label key={k} className={'pay' + (pay === k ? ' on' : '')}><input type="radio" name="pay" checked={pay === k} onChange={() => setPay(k)} /><I size={20} /> {label}</label>)}
            </div>
            {pay !== 'COD' && <p className="muted small">This is a demo store — no real payment is taken. Plug in Razorpay / Stripe in <code>backend/routes/orders.js</code> to go live.</p>}
          </div>
        </div>
        <Summary cart={cart} total={cartTotal}>
          <div className="mini-items">{cart.map((i) => <div key={i.product.id}><div className="thumb sm"><ProductImage p={i.product} /></div><span>{i.product.name} × {i.qty}</span><b>{money(i.product.price * i.qty)}</b></div>)}</div>
          {err && <div className="alert">{err}</div>}
          <button className="btn btn-dark full" disabled={busy}>{busy ? 'Placing order…' : 'Place Order'}</button>
        </Summary>
      </form>
    </div>
  );
}
