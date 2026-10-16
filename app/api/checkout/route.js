// Creates the order in Supabase, then a PayMongo Checkout Session, and returns the PayMongo payment page link.
// Everything that matters (prices, email of a signed-in customer) is decided here, never by the browser.
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { validate, sanitizeCustomer } from '../../../lib/orders';
import { json, sameOrigin } from '../../../lib/security';
import { parseCart, priceCart } from '../../../lib/cart-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Any unexpected crash still answers with readable JSON (and the real error goes to the Vercel logs: Project > Logs > /api/checkout).
export async function POST(request) {
  try {
    return await handle(request);
  } catch (e) {
    console.error('checkout crashed:', e && e.stack ? e.stack : e);
    return json({ ok: false, error: 'Something went wrong on our side. Please try again in a moment.' }, 500);
  }
}

async function handle(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const pmKey = process.env.PAYMONGO_SECRET_KEY;
  if (!url || !service || !pmKey) return json({ ok: false, error: 'Checkout is not set up yet. Please try again later.' }, 503);

  // ---- basic request checks (cross-site posts, oversized or malformed bodies, bots) ----
  if (!sameOrigin(request)) return json({ ok: false, error: 'Request blocked.' }, 403);
  const raw = await request.text();
  if (raw.length > 20000) return json({ ok: false, error: 'Request too large.' }, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ ok: false, error: 'Bad request.' }, 400); }
  if (!body || typeof body !== 'object') return json({ ok: false, error: 'Bad request.' }, 400);
  if (body.company) return json({ ok: true, checkoutUrl: '/' }); // honeypot: bots fill this hidden field, people never see it
  if (!(Number(body.elapsedMs) >= 1500)) return json({ ok: false, error: 'Please reload the page and try again.' }, 400); // submitted faster than a person can

  const db = createClient(url, service, { auth: { persistSession: false } });

  // ---- signed-in customer? verify the Google session token the browser sent. A guest simply has none. ----
  let userId = null;
  let accountEmail = '';
  const bearer = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (bearer) {
    const { data: who, error: whoErr } = await db.auth.getUser(bearer);
    if (!whoErr && who && who.user) { userId = who.user.id; accountEmail = String(who.user.email || '').toLowerCase(); }
  }

  // ---- clean and validate the form ----
  const s = sanitizeCustomer(body.customer);
  if (accountEmail) s.email = accountEmail; // a signed-in customer's receipt email is always their account email
  const errors = validate(s);
  if (Object.keys(errors).length) return json({ ok: false, errors }, 422);

  // ---- rate limit: no more than 4 unpaid checkouts per email or phone in 10 minutes (works across all server instances) ----
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const recent = (col, val) => db.from('orders').select('id', { count: 'exact', head: true }).eq(col, val).eq('status', 'pending').gte('created_at', since);
  const [byEmail, byPhone] = await Promise.all([recent('customer_email', s.email), recent('customer_phone', s.phone)]);
  if ((byEmail.count || 0) >= 4 || (byPhone.count || 0) >= 4) {
    return json({ ok: false, error: 'Too many attempts. Please wait a few minutes and try again.' }, 429);
  }

  // ---- trusted prices ----
  const priced = await priceCart(db, parseCart(body.items));
  if (priced.error) return json({ ok: false, error: priced.error }, priced.status);
  const { lines, images } = priced;

  // ---- prices in centavos, from the trusted lines ----
  const unitCents = lines.map((l) => Math.round(l.price * 100));
  const totalCents = lines.reduce((n, l, i) => n + unitCents[i] * l.qty, 0);

  const total = totalCents / 100;
  const line2 = [s.line2, s.barangay ? 'Brgy. ' + s.barangay : ''].filter(Boolean).join(', '); // unit/subdivision + barangay
  const orderNo = 'FND-' + randomBytes(3).toString('hex').toUpperCase();
  const orderRow = {
    order_no: orderNo, status: 'pending',
    customer_name: s.name, customer_email: s.email, customer_phone: s.phone,
    address_line1: s.line1, address_line2: line2 || null, city: s.city, province: s.province, postal_code: s.postal,
    notes: s.notes || null, items: lines, total,
  };
  let ins = await db.from('orders').insert(userId ? { ...orderRow, user_id: userId } : orderRow).select('id').single();
  if (ins.error && userId) ins = await db.from('orders').insert(orderRow).select('id').single(); // user_id column not added yet: still take the order
  const order = ins.data;
  if (ins.error || !order) {
    return json({ ok: false, error: 'Could not save your order. Please try again.' }, 500);
  }

  // ---- PayMongo payment page ----
  const site = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
  const methods = (process.env.PAYMONGO_METHODS || 'gcash,paymaya,card,grab_pay,qrph').split(',').map((m) => m.trim()).filter(Boolean);
  let res = null;
  let pm = {};
  try {
    res = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + Buffer.from(pmKey + ':').toString('base64') },
    body: JSON.stringify({ data: { attributes: {
      billing: { name: s.name, email: s.email, phone: s.phone,
        address: { line1: s.line1, line2: line2 || undefined, city: s.city, state: s.province, postal_code: s.postal, country: 'PH' } },
      line_items: lines.map((l, i) => {
        const src = images[l.id];
        const img = src ? (src.startsWith('/') ? site + src : src) : '';
        return { currency: 'PHP', amount: unitCents[i], name: "Fundy's " + l.title, quantity: l.qty, ...(img ? { images: [img] } : {}) };
      }),
      payment_method_types: methods,
      description: "Fundy's order " + orderNo,
      reference_number: orderNo,
      send_email_receipt: true, show_description: true, show_line_items: true,
      metadata: { order_id: order.id, order_no: orderNo },
      success_url: site + '/order/success?o=' + orderNo,
      cancel_url: site + '/checkout?cancelled=1',
    } } }),
    });
    pm = await res.json().catch(() => ({}));
  } catch (e) {
    console.error('PayMongo request failed:', e && e.message ? e.message : e);
  }
  const attrs = pm && pm.data && pm.data.attributes;
  if (!res || !res.ok || !attrs || !attrs.checkout_url) {
    await db.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
    console.error('PayMongo error', res ? res.status : 'no response', JSON.stringify(pm).slice(0, 500));
    return json({ ok: false, error: 'Payment page could not be created. Please try again.' }, 502);
  }
  await db.from('orders').update({ paymongo_session_id: pm.data.id }).eq('id', order.id);
  // Keep the payment link so "My orders" can show a Pay button while it is still valid (needs supabase/orders-checkout-url.sql).
  const linkSaved = await db.from('orders').update({ checkout_url: attrs.checkout_url }).eq('id', order.id);
  if (linkSaved.error) console.error('Could not save checkout_url (has supabase/orders-checkout-url.sql been run?)', linkSaved.error.message);

  // ---- "Save my details for next time": only for a verified, signed-in customer who ticked the box ----
  if (userId && body.saveDetails === true) {
    const code = (v) => (typeof v === 'string' && /^\d{10}$/.test(v) ? v : null);
    const c = body.codes && typeof body.codes === 'object' ? body.codes : {};
    const saved = await db.from('customer_profiles').upsert({
      user_id: userId, name: s.name, phone: s.phone, email: s.email,
      line1: s.line1, line2: s.line2 || null, barangay: s.barangay, city: s.city, province: s.province, postal: s.postal,
      region_code: code(c.region), province_code: code(c.province), city_code: code(c.city), barangay_code: code(c.barangay),
      updated_at: new Date().toISOString(),
    });
    if (saved.error) console.error('Could not save customer profile (has supabase/customers.sql been run?)', saved.error.message);
  }

  return json({ ok: true, checkoutUrl: attrs.checkout_url, orderNo });
}
