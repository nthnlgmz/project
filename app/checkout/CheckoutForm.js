'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart, peso } from '../../components/CartProvider';
import { validate } from '../../lib/orders';
import LocationFields from './LocationFields';

const EMPTY = { name: '', email: '', phone: '', line1: '', line2: '', barangay: '', city: '', province: '', postal: '', notes: '' };

export default function CheckoutForm() {
  const { items, total, ready, setQty } = useCart();
  const cancelled = useSearchParams().get('cancelled');
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [geo, setGeo] = useState({ mode: 'loading', barangays: 0 }); // how the location fields are currently shown
  const [voucher, setVoucher] = useState('');
  const [voucherMsg, setVoucherMsg] = useState('');
  const set = (k) => (e) => setF((cur) => ({ ...cur, [k]: e.target.value }));

  // Voucher codes: interface only for now. Nothing is sent to the server and the total never changes.
  function applyVoucher() {
    setVoucherMsg(voucher.trim() ? 'Voucher codes are not available yet.' : 'Enter a voucher code.');
  }

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    const errs = validate(f);
    if (!f.barangay.trim() && (geo.mode === 'text' ? false : geo.barangays > 0)) errs.barangay = 'Select your barangay.';
    setErrors(errs);
    if (Object.keys(errs).length) { setMsg('Please fix the highlighted fields.'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: { ...f, line2: [f.line2.trim(), f.barangay.trim() ? 'Brgy. ' + f.barangay.trim() : ''].filter(Boolean).join(', ') }, company: e.target.company.value, items: items.map((i) => ({ id: i.id, qty: i.qty })) }),
      });
      const j = await res.json().catch(() => ({}));
      if (j.ok && j.checkoutUrl) { window.location.href = j.checkoutUrl; return; }
      if (j.errors) setErrors(j.errors);
      setMsg(j.error || 'Something went wrong. Please try again.');
    } catch { setMsg('Network problem. Please check your connection and try again.'); }
    setBusy(false);
  }

  if (!ready) return <p className="co-note">Loading your cart…</p>;
  if (!items.length) {
    return (
      <div className="co-empty">
        <p>Your cart is empty.</p>
        <a className="btn" href="/#products">Browse the spreads</a>
      </div>
    );
  }

  const field = (k, label, props = {}) => (
    <div className={'co-field' + (errors[k] ? ' has-error' : '')}>
      <label htmlFor={'f-' + k}>{label}</label>
      <input id={'f-' + k} value={f[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? 'e-' + k : undefined} {...props} />
      {errors[k] ? <span className="co-err" id={'e-' + k}>{errors[k]}</span> : null}
    </div>
  );

  return (
    <form className="co-grid" onSubmit={submit} noValidate>
      <div className="co-card">
        <h2>Your details</h2>
        {cancelled ? <p className="co-banner">Payment was cancelled. Your cart is still here whenever you're ready.</p> : null}
        {field('name', 'Full name *', { autoComplete: 'name' })}
        <div className="co-two">
          {field('phone', 'Mobile number *', { type: 'tel', autoComplete: 'tel', inputMode: 'tel', placeholder: '0917 123 4567' })}
          {field('email', 'Email *', { type: 'email', autoComplete: 'email', inputMode: 'email' })}
        </div>
        {field('line1', 'Street address, house/unit no. *', { autoComplete: 'address-line1' })}
        {field('line2', 'Unit / building / subdivision (optional)', { autoComplete: 'address-line2' })}
        <LocationFields
          value={f}
          errors={errors}
          onChange={(patch) => setF((cur) => ({ ...cur, ...patch }))}
          onMode={(mode, info) => setGeo({ mode, barangays: info.barangays })}
          textField={field}
        />
        {field('postal', 'Postal code *', { autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 4 })}
        <div className="co-field">
          <label htmlFor="f-notes">Notes (optional)</label>
          <textarea id="f-notes" rows="3" value={f.notes} onChange={set('notes')} maxLength={500} />
        </div>
        <input type="text" name="company" tabIndex="-1" autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
      </div>

      <aside className="co-card co-summary">
        <h2>Order summary</h2>
        <ul>
          {items.map((i) => (
            <li key={i.id}>
              <span>{i.title} <em>&times; {i.qty}</em></span>
              <strong>{peso(i.price * i.qty)}</strong>
              <span className="qty" role="group" aria-label={`Quantity for ${i.title}`}>
                <button type="button" onClick={() => setQty(i.id, i.qty - 1)} aria-label="Decrease quantity">&minus;</button>
                <span>{i.qty}</span>
                <button type="button" onClick={() => setQty(i.id, i.qty + 1)} aria-label="Increase quantity">+</button>
              </span>
            </li>
          ))}
        </ul>
        <div className="co-voucher">
          <label htmlFor="f-voucher">Voucher code</label>
          <div className="co-voucher-row">
            <input
              id="f-voucher" value={voucher} autoComplete="off" autoCapitalize="characters" spellCheck="false" placeholder="Enter code"
              onChange={(e) => { setVoucher(e.target.value); setVoucherMsg(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyVoucher(); } }}
            />
            <button type="button" className="btn btn-ghost" onClick={applyVoucher}>Apply</button>
          </div>
          {voucherMsg ? <p className="co-note" role="status">{voucherMsg}</p> : null}
        </div>
        <p className="cart-total"><span>Total</span><strong>{peso(total)}</strong></p>
        <p className="co-note">Delivery is arranged by Fundy's after your payment. You'll pay on PayMongo's secure page with GCash, Maya or card.</p>
        {msg ? <p className="co-msg" role="alert">{msg}</p> : null}
        <button type="submit" className="btn co-pay" disabled={busy}>{busy ? 'Opening payment page…' : 'Pay ' + peso(total)}</button>
      </aside>
    </form>
  );
}
