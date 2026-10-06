'use client';

import { useEffect, useState } from 'react';
import Core from '../public/fundys-core.js';
import { useLive } from './useLive';

// The booth timeline. Booths whose last day has passed are hidden automatically in the visitor's browser.
export default function BoothList({ booths: initial }) {
  const booths = useLive('booths', initial, 'start_date', Core.boothFromRow);
  const [finished, setFinished] = useState([]);
  const [ongoing, setOngoing] = useState([]);

  // Worked out in the visitor's browser (Philippine date), so it is always current and never mismatches the built page.
  useEffect(() => {
    const today = Core.todayDate();
    setFinished(booths.filter((b) => Core.isPast(b, today)).map((b) => b.id));
    setOngoing(
      booths
        .filter((b) => {
          const s = Core.parseDate(b.start);
          const e = Core.parseDate(b.end || b.start);
          return !!s && !!e && s <= today && today <= e;
        })
        .map((b) => b.id)
    );
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
    <div className="booth-list-wrap">
      <ol className="booth-timeline">
        {visible.map((b) => (
          <li className={'booth-item' + (ongoing.includes(b.id) ? ' is-ongoing' : '')} key={b.id}>
            <p className="booth-date"><time dateTime={b.start}>{Core.formatRange(b.start, b.end)}</time></p>
            <h4>{b.name}</h4>
            <p className="booth-city">{b.city}</p>
            {ongoing.includes(b.id) && (
              <p className="booth-ongoing">
                <span className="booth-ongoing-dot" aria-hidden="true">●</span> Ongoing now, come say hi!{' '}
                <span className="booth-ongoing-emoji" aria-hidden="true">🧀</span>
              </p>
            )}
          </li>
        ))}
      </ol>
      <p className="booth-note">
        <strong>Heads up:</strong> dates and venues can change. Please check our{' '}
        <a href="https://www.facebook.com/share/1P3eAZ63ca/" target="_blank" rel="noopener me">Facebook page</a>{' '}
        for the latest updates before you visit.
      </p>
    </div>
  );
}
