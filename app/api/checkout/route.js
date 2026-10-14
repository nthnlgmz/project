// Creates the order in Supabase, then a PayMongo Checkout Session, and returns the PayMongo payment page link.
// Prices are read from the products table here, so a customer can never change what they pay from the browser.
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { validate } from '../../../lib/orders';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const pmKey = process.env.PAYMONGO_SECRET_KEY;
  if (!url || !service || !pmKey) return json({ ok: false, error: 'Checkout is not set up yet. Please try again later.' }, 503);

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'Bad request.' }, 400); }
  if (body.company) return json({ ok: true, checkoutUrl: '/' }); // honeypot: bots fill this hidden field

  const f = body.customer || {};
  const errors = validate(f);
  if (Object.keys(errors).length) return json({ ok: false, errors }, 422);

  const cart = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
  const wanted = new Map();
  for (const i of cart) {
    const qty = Math.floor(Number(i && i.qty));
    if (i && typeof i.id === 'string' && qty >= 1 && qty <= 50) wanted.set(i.id, (wanted.get(i.id) || 0) + qty);
  }
  if (!wanted.size) return json({ ok: false, error: 'Your cart is empty.' }, 400);

  const db = createClient(url, service, { auth: { persistSession: false } });

  // Signed-in shopper? Verify the Google session token the browser sent. A guest simply has none.
  let userId = null;
  const bearer = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (bearer) {
    const { data: who, error: whoErr } = await db.auth.getUser(bearer);
    if (!whoErr && who && who.user) userId = who.user.id;
  }
  const { data: products, error: pErr } = await db.from('products').select('*').in('id', [...wanted.keys()]);
  if (pErr) return json({ ok: false, error: 'Could not load products.' }, 500);

  const lines = [];
  const images = {}; // product photo per id, shown on the PayMongo payment page
  for (const [id, qty] of wanted) {
    const p = (products || []).find((x) => x.id === id);
    if (!p || p.visible === false || p.in_stock === false) {
      return json({ ok: false, error: 'One of the items is no longer available. Please review your cart.' }, 409);
    }
    lines.push({ id, title: p.title, price: Number(p.price), qty });
    images[id] = p.image ? (/^https?:\/\//i.test(p.image) ? p.image : '/' + String(p.image).replace(/^\/+/, '')) : '';
  }
  const total = lines.reduce((n, l) => n + l.price * l.qty, 0);
  if (!(total > 0)) return json({ ok: false, error: 'Invalid order total.' }, 400);

  const t = (k) => String(f[k] || '').trim();
  const line2 = [t('line2'), t('barangay') ? 'Brgy. ' + t('barangay') : ''].filter(Boolean).join(', '); // unit/subdivision + barangay
  const orderNo = 'FND-' + randomBytes(3).toString('hex').toUpperCase();
  const orderRow = {
    order_no: orderNo, status: 'pending',
    customer_name: t('name'), customer_email: t('email'), customer_phone: t('phone'),
    address_line1: t('line1'), address_line2: line2 || null, city: t('city'), province: t('province'), postal_code: t('postal'),
    notes: t('notes').slice(0, 500) || null, items: lines, total,
  };
  let ins = await db.from('orders').insert(userId ? { ...orderRow, user_id: userId } : orderRow).select('id').single();
  if (ins.error && userId) ins = await db.from('orders').insert(orderRow).select('id').single(); // user_id column not added yet: still take the order
  const order = ins.data, oErr = ins.error;
  if (oErr || !order) return json({ ok: false, error: 'Could not save your order. Please try again.' }, 500);

  const site = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
  const methods = (process.env.PAYMONGO_METHODS || 'gcash,paymaya,card,grab_pay').split(',').map((m) => m.trim()).filter(Boolean);

  const res = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + Buffer.from(pmKey + ':').toString('base64') },
    body: JSON.stringify({ data: { attributes: {
      billing: { name: t('name'), email: t('email'), phone: t('phone'),
        address: { line1: t('line1'), line2: line2 || undefined, city: t('city'), state: t('province'), postal_code: t('postal'), country: 'PH' } },
      line_items: lines.map((l) => {
        const src = images[l.id];
        const url = src ? (src.startsWith('/') ? site + src : src) : '';
        return { currency: 'PHP', amount: Math.round(l.price * 100), name: "Fundy's " + l.title, quantity: l.qty, ...(url ? { images: [url] } : {}) };
      }),
      payment_method_types: methods,
      description: 'Fundy\'s order ' + orderNo,
      reference_number: orderNo,
      send_email_receipt: true, show_description: true, show_line_items: true,
      metadata: { order_id: order.id, order_no: orderNo },
      success_url: site + '/order/success?o=' + orderNo,
      cancel_url: site + '/checkout?cancelled=1',
    } } }),
  });
  const pm = await res.json().catch(() => ({}));
  const attrs = pm && pm.data && pm.data.attributes;
  if (!res.ok || !attrs || !attrs.checkout_url) {
    await db.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
    console.error('PayMongo error', res.status, JSON.stringify(pm).slice(0, 500));
    return json({ ok: false, error: 'Payment page could not be created. Please try again.' }, 502);
  }

  await db.from('orders').update({ paymongo_session_id: pm.data.id }).eq('id', order.id);

  // "Save my details for next time": only for a verified, signed-in customer who ticked the box.
  if (userId && body.saveDetails === true) {
    const code = (v) => (typeof v === 'string' && /^\d{10}$/.test(v) ? v : null);
    const c = body.codes || {};
    const saved = await db.from('customer_profiles').upsert({
      user_id: userId, name: t('name'), phone: t('phone'), email: t('email'),
      line1: t('line1'), line2: t('line2') || null, barangay: t('barangay'), city: t('city'), province: t('province'), postal: t('postal'),
      region_code: code(c.region), province_code: code(c.province), city_code: code(c.city), barangay_code: code(c.barangay),
      updated_at: new Date().toISOString(),
    });
    if (saved.error) console.error('Could not save customer profile (has supabase/customers.sql been run?)', saved.error.message);
  }
  return json({ ok: true, checkoutUrl: attrs.checkout_url, orderNo });
}
