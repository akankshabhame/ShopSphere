import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Check, Package, CheckCircle2, Truck, Home as HomeIcon, ClipboardCheck, XCircle } from 'lucide-react';
import { api, money, fdate } from '../api';
import { useApp } from '../AppContext';
import { ProductImage } from '../components/ProductCard';

export const STEPS = [['Placed', 'Order placed', ClipboardCheck], ['Confirmed', 'Confirmed', CheckCircle2], ['Shipped', 'Shipped', Package], ['Out for Delivery', 'Out for delivery', Truck], ['Delivered', 'Delivered', HomeIcon]];
export const StatusBadge = ({ s }) => <span className={'status s-' + s.replace(/\s/g, '').toLowerCase()}>{s}</span>;

export function Orders() {
  const [orders, setOrders] = useState(null);
  useEffect(() => { api('/orders').then((r) => setOrders(r.orders)); }, []);
  if (!orders) return <div className="center-msg">Loading…</div>;
  if (!orders.length) return <div className="container page"><div className="empty card"><Package size={48} strokeWidth={1.2} /><h3>No orders yet</h3><p>When you place an order it will show up here.</p><Link to="/shop" className="btn btn-dark">Start shopping</Link></div></div>;
  return (
    <div className="container page">
      <h1 className="page-title">My Orders</h1>
      <div className="stack">
        {orders.map((o) => (
          <Link to={'/orders/' + o.id} key={o.id} className="card order-row">
            <div className="thumbs">{o.items.slice(0, 3).map((i) => <div className="thumb sm" key={i.productId}><ProductImage p={i} /></div>)}</div>
            <div className="grow"><b>#{o.id}</b><div className="muted small">{fdate(o.createdAt)} · {o.items.reduce((s, i) => s + i.qty, 0)} item(s)</div></div>
            <b>{money(o.total)}</b><StatusBadge s={o.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function OrderTracking() {
  const { id } = useParams();
  const { state } = useLocation();
  const { notify } = useApp();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api('/orders/' + id).then((r) => setOrder(r.order)).catch((e) => setErr(e.message)); }, [id]);
  if (err) return <div className="center-msg"><h2>{err}</h2><Link to="/orders" className="btn btn-dark">My orders</Link></div>;
  if (!order) return <div className="center-msg">Loading…</div>;

  const cancelled = order.status === 'Cancelled';
  const idx = STEPS.findIndex((s) => s[0] === order.status);
  const at = (s) => order.timeline.find((t) => t.status === s)?.at;
  const cancel = async () => {
    if (!confirm('Cancel this order?')) return;
    try { const r = await api(`/orders/${order.id}/cancel`, { method: 'PUT' }); setOrder(r.order); notify('Order cancelled'); } catch (e) { notify(e.message); }
  };
  const a = order.address;

  return (
    <div className="container page">
      {state?.placed && <div className="success-banner"><CheckCircle2 size={28} /><div><b>Thank you! Your order has been placed.</b><div>We've sent it to the seller. You can track it below.</div></div></div>}
      <div className="section-head"><div><h1 className="page-title">Order #{order.id}</h1><span className="muted">Placed on {fdate(order.createdAt)}</span></div><StatusBadge s={order.status} /></div>

      <div className="card pad">
        {cancelled ? <div className="cancelled"><XCircle size={28} /> This order was cancelled.</div> : (
          <div className="tracker">
            {STEPS.map(([k, label, I], i) => (
              <div key={k} className={'step' + (i <= idx ? ' done' : '') + (i === idx ? ' current' : '')}>
                <div className="dot">{i < idx ? <Check size={18} /> : <I size={18} />}</div>
                <b>{label}</b><small>{at(k) ? fdate(at(k)) : 'Pending'}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="two-col" style={{ marginTop: 20 }}>
        <div className="card list">
          {order.items.map((i) => (
            <div className="line" key={i.productId}>
              <Link to={'/product/' + i.productId} className="thumb"><ProductImage p={i} /></Link>
              <div className="line-info"><Link to={'/product/' + i.productId} className="pc-name">{i.name}</Link><div className="muted small">Qty {i.qty} × {money(i.price)}</div></div>
              <b>{money(i.price * i.qty)}</b>
            </div>
          ))}
        </div>
        <aside className="summary card">
          <h3>Details</h3>
          <div className="row"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
          <div className="row"><span>Delivery</span><span>{order.shipping ? money(order.shipping) : 'FREE'}</span></div>
          <div className="row total"><span>Total</span><span>{money(order.total)}</span></div>
          <div className="muted small">Payment: {order.payment}</div>
          <h4>Delivery address</h4>
          <p className="small">{a.name}<br />{a.line1}<br />{a.city}, {a.state} – {a.pincode}<br />📞 {a.phone}</p>
          {['Placed', 'Confirmed'].includes(order.status) && <button className="btn btn-outline full" onClick={cancel}>Cancel order</button>}
        </aside>
      </div>
    </div>
  );
}
