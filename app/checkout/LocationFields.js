'use client';
import { useEffect, useRef, useState } from 'react';

// Region > Province > City/Municipality > Barangay dropdowns, fed by /api/psgc (official PSA PSGC data).
// If the lists cannot be loaded (no token yet, PSA down...), plain text boxes are shown instead so checkout never breaks.
const memo = new Map();
async function fetchItems(level, parent) {
  const key = level + ':' + (parent || '');
  if (memo.has(key)) return memo.get(key);
  const qs = new URLSearchParams({ level });
  if (parent) qs.set('parent', parent);
  const res = await fetch('/api/psgc?' + qs.toString());
  const j = await res.json();
  if (!res.ok || !j.ok) throw new Error('psgc');
  memo.set(key, j.items);
  return j.items;
}

function Select({ id, label, value, onChange, items, loading, disabled, placeholder, error }) {
  return (
    <div className={'co-field' + (error ? ' has-error' : '')}>
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={onChange} disabled={disabled || loading} aria-invalid={!!error} aria-describedby={error ? 'e-' + id : undefined}>
        <option value="">{loading ? 'Loading…' : placeholder}</option>
        {items.map((i) => <option key={i.code} value={i.code}>{i.name}</option>)}
      </select>
      {error ? <span className="co-err" id={'e-' + id}>{error}</span> : null}
    </div>
  );
}

export default function LocationFields({ value, errors, onChange, onMode, onCodes, preset, textField }) {
  const [mode, setMode] = useState('loading'); // loading | select | text
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [sel, setSel] = useState({ region: '', province: '', city: '', barangay: '' });
  const [busy, setBusy] = useState('');       // which list is loading
  const [noProvince, setNoProvince] = useState(false); // e.g. Metro Manila has no provinces
  const alive = useRef(true);

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => { if (onMode) onMode(mode, { barangays: barangays.length }); }, [mode, barangays.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (onCodes) onCodes(sel); }, [sel]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-select saved dropdown choices (region > province > city > barangay) from their PSGC codes.
  useEffect(() => {
    if (!preset || !preset.nonce || mode !== 'select' || !preset.regionCode) return;
    (async () => {
      setSel({ region: preset.regionCode, province: '', city: '', barangay: '' });
      setProvinces([]); setCities([]); setBarangays([]);
      const provs = await load('provinces', preset.regionCode, setProvinces);
      let parent = preset.regionCode;
      if (!provs.length) setNoProvince(true);
      else {
        setNoProvince(false);
        if (!preset.provinceCode || !provs.some((p) => p.code === preset.provinceCode)) return;
        setSel((s) => ({ ...s, province: preset.provinceCode }));
        parent = preset.provinceCode;
      }
      const cs = await load('municipalities', parent, setCities);
      if (!preset.cityCode || !cs.some((c) => c.code === preset.cityCode)) return;
      setSel((s) => ({ ...s, city: preset.cityCode }));
      const bs = await load('barangays', preset.cityCode, setBarangays);
      if (preset.barangayCode && bs.some((b) => b.code === preset.barangayCode)) setSel((s) => ({ ...s, barangay: preset.barangayCode }));
    })();
  }, [preset && preset.nonce, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchItems('regions')
      .then((items) => { if (!alive.current) return; if (items.length) { setRegions(items); setMode('select'); } else setMode('text'); })
      .catch(() => { if (alive.current) setMode('text'); });
  }, []);

  const name = (list, code) => (list.find((x) => x.code === code) || {}).name || '';

  async function load(level, parent, setter) {
    setBusy(level);
    try { const items = await fetchItems(level, parent); if (alive.current) setter(items); return items; }
    catch { if (alive.current) setter([]); return []; }
    finally { if (alive.current) setBusy(''); }
  }

  async function pickRegion(e) {
    const code = e.target.value;
    setSel({ region: code, province: '', city: '', barangay: '' });
    setProvinces([]); setCities([]); setBarangays([]); setNoProvince(false);
    onChange({ province: '', city: '', barangay: '' });
    if (!code) return;
    const provs = await load('provinces', code, setProvinces);
    if (!provs.length) {            // no provinces: go straight to cities, and use the region name as the "province"
      setNoProvince(true);
      onChange({ province: name(regions, code), city: '', barangay: '' });
      await load('municipalities', code, setCities);
    }
  }

  async function pickProvince(e) {
    const code = e.target.value;
    setSel((s) => ({ ...s, province: code, city: '', barangay: '' }));
    setCities([]); setBarangays([]);
    onChange({ province: name(provinces, code), city: '', barangay: '' });
    if (code) await load('municipalities', code, setCities);
  }

  async function pickCity(e) {
    const code = e.target.value;
    setSel((s) => ({ ...s, city: code, barangay: '' }));
    setBarangays([]);
    onChange({ city: name(cities, code), barangay: '' });
    if (code) await load('barangays', code, setBarangays);
  }

  function pickBarangay(e) {
    const code = e.target.value;
    setSel((s) => ({ ...s, barangay: code }));
    onChange({ barangay: name(barangays, code) });
  }

  if (mode === 'loading') return <p className="co-note">Loading locations…</p>;

  if (mode === 'text') {
    return (
      <>
        <div className="co-two">
          {textField('city', 'City / Municipality *', { autoComplete: 'address-level2' })}
          {textField('province', 'Province *', { autoComplete: 'address-level1' })}
        </div>
        {textField('barangay', 'Barangay *')}
      </>
    );
  }

  return (
    <>
      <Select id="f-region" label="Region *" value={sel.region} onChange={pickRegion} items={regions} loading={false}
        placeholder="Select region" error={(!sel.region || noProvince) ? (errors.province || errors.city) : ''} />
      {sel.region && !noProvince ? (
        <Select id="f-province" label="Province *" value={sel.province} onChange={pickProvince} items={provinces}
          loading={busy === 'provinces'} placeholder="Select province" error={errors.province} />
      ) : null}
      {sel.region && (sel.province || noProvince) ? (
        <Select id="f-city" label="City / Municipality *" value={sel.city} onChange={pickCity} items={cities}
          loading={busy === 'municipalities'} placeholder="Select city or municipality" error={errors.city} />
      ) : null}
      {sel.city ? (
        barangays.length || busy === 'barangays' ? (
          <Select id="f-barangay" label="Barangay *" value={sel.barangay} onChange={pickBarangay} items={barangays}
            loading={busy === 'barangays'} placeholder="Select barangay" error={errors.barangay} />
        ) : textField('barangay', 'Barangay *')
      ) : null}
    </>
  );
}
