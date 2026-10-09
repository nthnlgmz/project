'use client';
import { useEffect, useRef, useState } from 'react';

// Counts a value like "84 kcal" or "2.1 g" up from 0 the first time it scrolls into view.
// Server render and no-JS show the final value; reduced-motion users never see the animation.
export default function CountUp({ value, duration = 1500 }) {
  const text = String(value);
  const m = text.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const ref = useRef(null);
  const [shown, setShown] = useState(m ? m[1] : null);

  useEffect(() => {
    if (!m || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const target = parseFloat(m[1]);
    const decimals = (m[1].split('.')[1] || '').length;
    let raf;

    setShown((0).toFixed(decimals)); // start at zero once we know we can animate

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3); // fast start, gentle landing
        setShown((target * eased).toFixed(decimals));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });

    io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, duration]);

  if (!m) return <>{text}</>;
  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {shown}{m[2]}
    </span>
  );
}
