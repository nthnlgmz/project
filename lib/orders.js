// Shared checks for the checkout form. The server runs these again, never trust the browser.
export const FIELDS = ['name', 'email', 'phone', 'line1', 'line2', 'city', 'province', 'postal', 'notes'];

export function validate(f) {
  const e = {};
  const t = (k) => String(f[k] || '').trim();
  if (t('name').length < 2) e.name = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t('email'))) e.email = 'Enter a valid email.';
  const digits = t('phone').replace(/[^\d+]/g, '');
  if (!/^(\+?63|0)9\d{9}$/.test(digits)) e.phone = 'Enter a valid mobile number.';
  if (t('line1').length < 5) e.line1 = 'Enter your street address.';
  if (t('city').length < 2) e.city = 'Enter your city.';
  if (t('barangay').length < 2) e.barangay = 'Enter your barangay.';
  if (t('province').length < 2) e.province = 'Enter your province.';
  if (!/^\d{4}$/.test(t('postal'))) e.postal = 'Use a 4-digit postal code.';
  return e;
}

// ---- Sanitising (server side, and safe to reuse in the browser) ----
// Output is always escaped when shown (React does it on the site, esc() in the admin page) and the database is only ever
// called through parameterised Supabase queries, so these rules are defence in depth: strip control and invisible
// characters, drop angle brackets (no HTML in a name or address), collapse whitespace and cap every length.
const LIMITS = { name: 80, email: 254, phone: 20, line1: 120, line2: 120, barangay: 80, city: 80, province: 80, postal: 4, notes: 500 };
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

export function clean(value, max, multiline) {
  let t = String(value == null ? '' : value).normalize('NFKC').replace(CONTROL, '').replace(/[<>]/g, '');
  t = multiline ? t.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n') : t.replace(/[\s\u0000-\u001F]+/g, ' ');
  return t.trim().slice(0, max);
}

export function sanitizeCustomer(f) {
  const src = f && typeof f === 'object' ? f : {};
  const out = {};
  Object.keys(LIMITS).forEach((k) => { out[k] = clean(src[k], LIMITS[k], k === 'notes'); });
  out.email = out.email.toLowerCase();
  out.phone = out.phone.replace(/[^\d+\s-]/g, '');
  out.postal = out.postal.replace(/\D/g, '').slice(0, 4);
  return out;
}
