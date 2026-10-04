'use client';

import { Fragment, useEffect, useState } from 'react';
import Core from '../public/fundys-core.js';
import { useLive } from './useLive';
import { BEFORE, DURING, describeNextBooth } from '../lib/booth-banner';

const STORAGE_KEY = 'fundys-booth-banner-dismissed';

// Replaces {placeholders} with the booth's details, in bold
function Phrase({ template, values }) {
  return template.split(/(\{\w+\})/g).map((part, i) => {
    const m = part.match(/^\{(\w+)\}$/);
    return m ? <strong key={i}>{values[m[1]]}</strong> : <Fragment key={i}>{part}</Fragment>;
  });
}

// Small card pinned to the bottom of the screen that promotes the next booth.
// Closing it hides it until a different booth becomes the next one (for example when a new booth is announced).
export default function BoothBanner({ booths: initial }) {
  const booths = useLive('booths', initial, 'start_date', Core.boothFromRow);
  const [seed, setSeed] = useState(null);        // random number picked once per page load
  const [dismissedId, setDismissedId] = useState(null);

  useEffect(() => {
    setSeed(Math.random());
    try {
      setDismissedId(window.localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      /* storage unavailable: the banner just comes back on the next visit */
    }
  }, []);

  if (seed === null) return null; // wait for the browser so the random line never causes a mismatch

  const info = describeNextBooth(booths);
  if (!info || info.booth.id === dismissedId) return null;

  const lines = info.phase === 'during' ? DURING : BEFORE;
  const template = lines[Math.floor(seed * lines.length)];

  const close = () => {
    setDismissedId(info.booth.id);
    try {
      window.localStorage.setItem(STORAGE_KEY, info.booth.id);
    } catch (e) {
      /* ignore */
    }
  };

  return (
    <aside className="booth-banner" role="region" aria-label="Upcoming booth">
      <div className="booth-banner-head">
        <img
          className="booth-banner-icon"
          src="/icon.svg"
          width="44"
          height="44"
          alt=""
          onError={(e) => {
            const img = e.currentTarget;
            if (!img.dataset.fallback) {
              img.dataset.fallback = '1';
              img.src = '/favicon.svg';
            }
          }}
        />
        <span className="booth-banner-name">Fundy's</span>
      </div>
      <p className="booth-banner-text">
        <Phrase template={template} values={info.values} />
      </p>
      <div className="booth-banner-actions">
        <a className="btn" href="#booths">See booth details</a>
        <button type="button" className="btn btn-ghost" onClick={close}>Close</button>
      </div>
    </aside>
  );
}
