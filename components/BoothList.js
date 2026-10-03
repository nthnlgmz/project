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
      <p className="booth-empty">No booth dates are announced right now. Follow us on Facebook to catch the next one.</p>
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
