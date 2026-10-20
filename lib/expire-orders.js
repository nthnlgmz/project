// Expires unpaid PayMongo payment pages for orders that used a voucher, so a cancelled or abandoned checkout
// can't be paid later through the old link. Cancelling the order gives the voucher use back (database trigger).
import { HOLD_MINUTES } from './vouchers';

const PM = 'https://api.paymongo.com/v1/checkout_sessions/';
const auth = (key) => ({ Authorization: 'Basic ' + Buffer.from(key + ':').toString('base64') });

// Expires one order's payment page, then cancels the order. Returns true if the order was cancelled.
// If PayMongo refuses (for example the customer just paid), the order is left alone so the webhook can mark it paid.
export async function expireOrder(db, pmKey, order) {
  if (!order || !order.paymongo_session_id) return false;
  const id = encodeURIComponent(order.paymongo_session_id);
  let ok = false;
  try {
    const res = await fetch(PM + id + '/expire', { method: 'POST', headers: auth(pmKey) });
    ok = res.ok;
    if (!ok) { // maybe it already expired on PayMongo's side: confirm before cancelling
      const g = await fetch(PM + id, { headers: auth(pmKey) });
      const j = await g.json().catch(() => ({}));
      const a = (j && j.data && j.data.attributes) || {};
      ok = g.ok && a.status === 'expired' && !(a.payments && a.payments.length);
    }
  } catch (e) {
    console.error('PayMongo expire failed:', e && e.message ? e.message : e);
    return false;
  }
  if (!ok) return false;
  const { error } = await db.from('orders').update({ status: 'cancelled' }).eq('id', order.id).eq('status', 'pending');
  return !error;
}

// Expires voucher orders that have sat unpaid past the voucher hold time. Best effort, never throws.
export async function sweepVoucherOrders(db, pmKey, limit = 10) {
  try {
    const before = new Date(Date.now() - HOLD_MINUTES * 60 * 1000).toISOString();
    const { data } = await db.from('orders').select('id, paymongo_session_id')
      .eq('status', 'pending').not('voucher_id', 'is', null).not('paymongo_session_id', 'is', null)
      .lt('created_at', before).limit(limit);
    const results = await Promise.all((data || []).map((o) => expireOrder(db, pmKey, o)));
    return results.filter(Boolean).length;
  } catch (e) {
    console.error('voucher order sweep failed:', e && e.message ? e.message : e);
    return 0;
  }
}
