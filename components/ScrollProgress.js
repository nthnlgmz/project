'use client';
import { useEffect, useRef } from 'react';

// Thin bar fixed at the very top of the screen: its width is how far down the page you are (0% at the top, 100% at the bottom).
export default function ScrollProgress() {
  const bar = useRef(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      if (bar.current) bar.current.style.width = pct.toFixed(2) + '%';
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // the page grows when images, products or the cart load, so recalculate when its height changes
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    if (ro) ro.observe(document.body);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (ro) ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <div className="scroll-progress" aria-hidden="true"><span ref={bar} /></div>;
}
