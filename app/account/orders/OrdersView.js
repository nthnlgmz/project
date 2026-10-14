'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../components/AuthProvider';
import { useCart, peso } from '../../../components/CartProvider';

const PAY = { gcash: 'GCash', paymaya: 'Maya', card: 'Card', grab_pay: 'GrabPay' };
const STATUS = {
  paid: { label: 'Paid, preparing your order', cls: 'paid' },
  shipped: { label: 'Shipped', cls: 'shipped' },
  pending: { label: 'Awaiting payment', cls: 'pending' },
};

const when = (iso) => new Date(iso).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', year: 'numeric', month: 'short', day: 'numeric' });

export default function OrdersView() {
  const { user, client, ready, available, signIn } = useAuth();
  const { add } = useCart();
  const router = useRouter();
  const [orders, setOrders] = useState(undefined); // undefined = loading
  const [error, setError] = useState('');
  const [showUnpaid, setShowUnpaid] = useState(false);
  const [note, setNote] = useState('');
  const [busyId, setBusyId] = useState('');

  useEffect(() => {
    if (!user || !client) { setOrders(undefined); return undefined; }
    let alive = true;
    client.from('orders')
      .select('id,order_no,status,total,items,created_at,payment_method,customer_name,customer_phone,address_line1,address_line2,city,province,postal_code')
      .order('created_at', { ascending: false }).limit(50)
      .then(({ data, error: err }) => {
        if (!alive) return;
        if (err) { setError('We could not load your orders right now. Please try again later.'); setOrders([]); return; }
        setOrders(data || []);
      });
    return () => { alive = false; };
  }, [user, client]);

  // Put the same items back in the cart at today's prices, then go to checkout.
  async function orderAgain(o) {
    setBusyId(o.id); setNote('');
    const ids = (o.items || []).map((i) => i.id);
    const { data } = await client.from('products').select('id,title,price,image,in_stock,visible').in('id', ids);
    const live = new Map((data || []).map((p) => [p.id, p]));
    const missing = [];
    let added = 0;
    (o.items || []).forEach((i) => {
      const p = live.get(i.id);
      if (p && p.visible !== false && p.in_stock !== false) { add({ id: p.id, title: p.title, price: p.price, image: p.image || '' }, i.qty); added++; }
      else missing.push(i.title);
    });
    setBusyId('');
    if (!added) { setNote('Sorry, none of the items in this order are available right now.'); return; }
    if (missing.length) { setNote('Added to your cart. Not available right now: ' + missing.join(', ') + '.'); }
    router.push('/checkout');
  }

  if (!ready) return <p className="co-note">Loading…</p>;
  if (!available) return <p className="co-note">Sign-in is not available right now. Please try again later.</p>;

  if (!user) {
    return (
      <div className="legal-card mo-center">
        <p>Sign in with Google to see your orders.</p>
        <button type="button" className="btn" onClick={() => signIn('/account/orders')}>Continue with Google</button>
      </div>
    );
  }

  if (orders === undefined) return <p className="co-note mo-center">Loading your orders…</p>;

  const shown = orders.filter((o) => (showUnpaid ? o.status !== 'cancelled' : o.status === 'paid' || o.status === 'shipped'));
  const unpaidCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="mo-wrap">
      {error ? <p className="co-msg" role="alert">{error}</p> : null}
      {note ? <p className="co-banner" role="status">{note}</p> : null}
      {unpaidCount > 0 ? (
        <label className="mo-toggle"><input type="checkbox" checked={showUnpaid} onChange={(e) => setShowUnpaid(e.target.checked)} /> Show unpaid checkouts ({unpaidCount})</label>
      ) : null}

      {shown.length === 0 && !error ? (
        <div className="legal-card mo-center">
          <p>You have no orders yet.</p>
          <a className="btn" href="/#products">Browse the spreads</a>
        </div>
      ) : (
        <ul className="mo-list">
          {shown.map((o) => {
            const st = STATUS[o.status] || { label: o.status, cls: 'pending' };
            const addr = [o.address_line1, o.address_line2, o.city, o.province, o.postal_code].filter(Boolean).join(', ');
            return (
              <li key={o.id} className="mo-card">
                <div className="mo-head">
                  <div><strong className="mo-no">{o.order_no}</strong><span className="mo-date">{when(o.created_at)}</span></div>
                  <span className={'mo-chip ' + st.cls}>{st.label}</span>
                </div>
                <ul className="mo-items">
                  {(o.items || []).map((i, idx) => (
                    <li key={idx}><span>{i.title} <em>&times; {i.qty}</em></span><span>{peso(Number(i.price) * Number(i.qty))}</span></li>
                  ))}
                </ul>
                <p className="mo-total"><span>Total{o.payment_method ? ' · ' + (PAY[o.payment_method] || o.payment_method) : ''}</span><strong>{peso(o.total)}</strong></p>
                <p className="mo-addr"><b>{o.customer_name}</b> · {o.customer_phone}<br />{addr}</p>
                <button type="button" className="btn btn-ghost" disabled={busyId === o.id} onClick={() => orderAgain(o)}>
                  {busyId === o.id ? 'Adding…' : 'Order again'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
