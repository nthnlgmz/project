'use client';

import { useEffect, useState } from 'react';
import Core from '../public/fundys-core.js';
import { useLive } from './useLive';

// The booth timeline. Booths whose last day has passed are hidden automatically in the visitor's browser.
export default function BoothList({ booths: initial }) {
  const booths = useLive('booths', initial, 'start_date', Core.boothFromRow);
  const [finished, setFinished] = useState([]);

  useEffect(() => {
    setFinished(booths.filter((b) => Core.isPast(b)).map((b) => b.id));
  }, [booths]);

  const visible = booths.filter((b) => !finished.includes(b.id));

  if (!visible.length) {
    return (
      <div className="booth-empty">
        <h3>No booths lined up right now</h3>
        <p>We announce new bazaars and pop-ups on our Facebook page as soon as they are confirmed. Follow us to catch the next one.</p>
        <a className="btn btn-social btn-facebook" href="https://www.facebook.com/share/1P3eAZ63ca/" target="_blank" rel="noopener me">
          <svg className="icon" aria-hidden="true"><use href="#i-facebook" /></svg>
          <span className="btn-label">Follow on Facebook</span>
        </a>
      </div>
    );
  }

  return (
    <ol className="booth-timeline">
      {visible.map((b) => (
        <li className="booth-item" key={b.id}>
          <p className="booth-date"><time dateTime={b.start}>{Core.formatRange(b.start, b.end)}</time></p>
          <h4>{b.name}</h4>
          <p className="booth-city">{b.city}</p>
        </li>
      ))}
    </ol>
  );
}
