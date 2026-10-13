// Location lists for the checkout dropdowns, from the official PSA PSGC API.
// The PSA token stays on the server (env var PSGC_TOKEN); the browser only talks to this route.
//   GET /api/psgc?level=regions
//   GET /api/psgc?level=provinces&parent=<region psgc_code>
//   GET /api/psgc?level=municipalities&parent=<province or region psgc_code>
//   GET /api/psgc?level=barangays&parent=<city/municipality psgc_code>
export const runtime = 'nodejs';

const BASE = 'https://classification.psa.gov.ph/psgc';
const PAGE = 1000;       // PSA maximum per page
const MAX_PAGES = 40;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': status === 200 ? 'public, s-maxage=86400, stale-while-revalidate=604800' : 'no-store' },
  });

// The PSA responses wrap the rows differently in places, so accept every shape documented.
function rowsOf(b) {
  if (Array.isArray(b)) return b;
  const r = b && (b.results !== undefined ? b.results : b.data);
  if (Array.isArray(r)) return r;
  if (r && Array.isArray(r.psgc_data)) return r.psgc_data;
  if (b && Array.isArray(b.psgc_data)) return b.psgc_data;
  return [];
}

export async function GET(request) {
  const token = process.env.PSGC_TOKEN;
  if (!token) return json({ ok: false, error: 'not configured' }, 503);

  const u = new URL(request.url);
  const level = u.searchParams.get('level');
  const parent = u.searchParams.get('parent') || '';
  if (!['regions', 'provinces', 'municipalities', 'barangays'].includes(level)) return json({ ok: false, error: 'bad level' }, 400);
  if (parent && !/^\d{10}$/.test(parent)) return json({ ok: false, error: 'bad parent' }, 400);
  if (level !== 'regions' && !parent) return json({ ok: false, error: 'parent required' }, 400);

  // PSGC code = RR PPP MM BBB (region, province, municipality, barangay). Derive the API filters and the exact prefix from the parent.
  const reg = parent ? Number(parent.slice(0, 2)) : null;
  const prv = parent ? Number(parent.slice(2, 5)) : 0;
  const mun = parent ? Number(parent.slice(5, 7)) : 0;
  const filters = {};
  let prefix = '';
  if (level === 'provinces') { filters.reg = reg; prefix = parent.slice(0, 2); }
  if (level === 'municipalities') {
    filters.reg = reg; prefix = parent.slice(0, 2);
    if (prv) { filters.prv = prv; prefix = parent.slice(0, 5); }
  }
  if (level === 'barangays') { filters.reg = reg; if (prv) filters.prv = prv; filters.mun = mun; prefix = parent.slice(0, 7); }

  const version = process.env.PSGC_VERSION || 'Q2_2024';
  const seen = new Map();
  for (let page = 1; page <= MAX_PAGES; page++) {
    const q = new URLSearchParams({ token, page_size: String(PAGE), page: String(page) });
    Object.keys(filters).forEach((k) => q.set(k, String(filters[k])));
    let res;
    try { res = await fetch(`${BASE}/${version}/${level}?${q}`, { headers: { Accept: 'application/json' }, next: { revalidate: 86400 } }); }
    catch (e) { if (page === 1) return json({ ok: false, error: 'unreachable' }, 502); break; }
    if (!res.ok) { if (page === 1) return json({ ok: false, error: 'upstream ' + res.status }, 502); break; }
    const body = await res.json().catch(() => null);
    const chunk = rowsOf(body);
    let added = 0;
    for (const r of chunk) {
      const code = String(r.psgc_code || '');
      if (!code || seen.has(code)) continue;
      if (prefix && !code.startsWith(prefix)) continue; // never trust the upstream filter alone
      if (level === 'regions' && r.geographic_level && r.geographic_level !== 'Reg') continue;
      seen.set(code, { code, name: String(r.area_name || '').trim() });
      added++;
    }
    if (!chunk.length || added === 0) break; // keep paging until a page adds nothing new
  }
  const items = [...seen.values()].filter((x) => x.name).sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
  return json({ ok: true, items });
}
