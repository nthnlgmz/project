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
