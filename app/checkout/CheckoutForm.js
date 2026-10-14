'use client';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart, peso } from '../../components/CartProvider';
import { useAuth, displayName } from '../../components/AuthProvider';
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

  // ---- Google sign-in: fill in saved details, optionally save new ones ----
  const { user, token, client, ready: authReady, available: authAvailable, signIn, signOut } = useAuth();
  const [saveMe, setSaveMe] = useState(false);
  const [profile, setProfile] = useState(undefined); // undefined = not loaded yet, null = none saved
  const [preset, setPreset] = useState(null);        // saved dropdown choices to re-select
  const [geoCodes, setGeoCodes] = useState({});
  const appliedFor = useRef('');

  useEffect(() => {
    if (!user || !client) { setProfile(undefined); appliedFor.current = ''; return undefined; }
    let alive = true;
    client.from('customer_profiles').select('*').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => { if (alive) setProfile(data || null); });
    return () => { alive = false; };
  }, [user, client]);

  // Once the profile and the location fields are both ready, fill the form (never overwriting what they already typed).
  useEffect(() => {
    if (!user || profile === undefined || geo.mode === 'loading' || appliedFor.current === user.id) return;
    appliedFor.current = user.id;
    const p = profile || {};
    const dropdown = geo.mode === 'select';
    const canPlace = dropdown ? !!p.region_code : true; // a place saved in text mode can't re-select dropdowns
    setF((cur) => ({
      ...cur,
      name: cur.name || p.name || displayName(user),
      phone: cur.phone || p.phone || '',
      email: cur.email || p.email || user.email || '',
      line1: cur.line1 || p.line1 || '',
      line2: cur.line2 || p.line2 || '',
      postal: cur.postal || p.postal || '',
      ...(canPlace && !cur.province && !cur.city ? { province: p.province || '', city: p.city || '', barangay: p.barangay || '' } : {}),
    }));
    if (dropdown && p.region_code) {
      setPreset({ regionCode: p.region_code, provinceCode: p.province_code || '', cityCode: p.city_code || '', barangayCode: p.barangay_code || '', nonce: Date.now() });
    }
    if (profile) setSaveMe(true);
  }, [user, profile, geo.mode]); // eslint-disable-line react-hooks/exhaustive-deps

  async function deleteSaved() {
    if (!client || !user) return;
    const { error } = await client.from('customer_profiles').delete().eq('user_id', user.id);
    if (error) { setMsg('Could not delete your saved details. Please try again.'); return; }
    setProfile(null); setSaveMe(false);
  }

  // Voucher codes: interface only for now. Nothing is sent to the server and the total never changes.
  function applyVoucher() {
    setVoucherMsg(voucher.trim() ? 'Voucher codes are not available yet.' : 'Enter a voucher code.');
  }

  // Scroll to (and focus) the first field that has an error, in the order they appear on the page.
  function focusFirstError(errs) {
    const order = ['name', 'phone', 'email', 'line1', 'province', 'city', 'barangay', 'postal'];
    for (const k of order) {
      if (!errs[k]) continue;
      const el = document.getElementById('f-' + k) || (k === 'province' || k === 'city' ? document.getElementById('f-region') : null);
      if (!el) continue;
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      el.focus({ preventScroll: true });
      return;
    }
  }

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    const errs = validate(f);
    if (errs.barangay && geo.mode === 'select' && geo.barangays > 0) errs.barangay = 'Select your barangay.';
    setErrors(errs);
    if (Object.keys(errs).length) { focusFirstError(errs); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        body: JSON.stringify({ customer: f, saveDetails: !!(token && saveMe), codes: { region: geoCodes.region, province: geoCodes.province, city: geoCodes.city, barangay: geoCodes.barangay }, company: e.target.company.value, items: items.map((i) => ({ id: i.id, qty: i.qty })) }),
      });
      const j = await res.json().catch(() => ({}));
      if (j.ok && j.checkoutUrl) { window.location.href = j.checkoutUrl; return; }
      if (j.errors) { setErrors(j.errors); focusFirstError(j.errors); }
      else setMsg(j.error || 'Something went wrong. Please try again.');
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
        {authAvailable && authReady ? (
          user ? (
            <div className="co-account">
              <p><strong>Signed in</strong> as {user.email}</p>
              <p className="co-note">{profile ? 'We filled in your saved details.' : 'Tick the box at the bottom to save your details for next time.'}</p>
              <div className="co-account-actions">
                <button type="button" className="co-link" onClick={() => signOut()}>Sign out</button>
                {profile ? <button type="button" className="co-link" onClick={deleteSaved}>Delete saved details</button> : null}
              </div>
            </div>
          ) : (
            <div className="co-account">
              <p>Have a Google account? Sign in to fill in your details faster.</p>
              <button type="button" className="btn btn-ghost co-google" onClick={() => signIn('/checkout')}>
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#4285F4" d="M23 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.17a5.28 5.28 0 0 1-2.29 3.46v2.87h3.7C21.75 18.8 23 15.8 23 12.27z"/><path fill="#34A853" d="M12 23.5c3.1 0 5.7-1.03 7.58-2.79l-3.7-2.87c-1.03.69-2.34 1.1-3.88 1.1-2.98 0-5.5-2.01-6.4-4.72H1.78v2.96A11.5 11.5 0 0 0 12 23.5z"/><path fill="#FBBC05" d="M5.6 14.22a6.9 6.9 0 0 1 0-4.44V6.82H1.78a11.5 11.5 0 0 0 0 10.36l3.82-2.96z"/><path fill="#EA4335" d="M12 5.06c1.69 0 3.2.58 4.39 1.72l3.28-3.28C17.7 1.65 15.1.5 12 .5A11.5 11.5 0 0 0 1.78 6.82L5.6 9.78C6.5 7.07 9.02 5.06 12 5.06z"/></svg>
                Continue with Google
              </button>
            </div>
          )
        ) : null}
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
          onCodes={setGeoCodes}
          preset={preset}
          textField={field}
        />
        {field('postal', 'Postal code *', { autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 4 })}
        <div className="co-field">
          <label htmlFor="f-notes">Notes (optional)</label>
          <textarea id="f-notes" rows="3" value={f.notes} onChange={set('notes')} maxLength={500} />
        </div>
        {user ? (
          <label className="co-check">
            <input type="checkbox" checked={saveMe} onChange={(e) => setSaveMe(e.target.checked)} />
            <span>Save my details for next time. <em>We only use them to fill in your next order. You can delete them here any time.</em></span>
          </label>
        ) : null}
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
