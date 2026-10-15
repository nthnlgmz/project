'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Core from '../public/fundys-core.js';
import ProductCard from './ProductCard';
import { useLive } from './useLive';

// Scroll-snap slider with prev/next buttons and dots. Cards are rendered on the server too, so Google sees them.
export default function ProductSlider({ products: initial }) {
  const live = useLive('products', initial, 'sort_order', Core.productFromRow);
  const products = live.filter(Core.isVisible);
  const trackRef = useRef(null);
  const frame = useRef(0);
  const [pos, setPos] = useState({ index: 0, atStart: true, atEnd: false });
  const wasAtStart = useRef(true);
  const firstId = products.length ? products[0].id : null;

  const step = useCallback(() => {
    const t = trackRef.current;
    const first = t && t.children[0];
    if (!first) return 1;
    const gap = parseFloat(getComputedStyle(t).columnGap) || 20;
    return first.getBoundingClientRect().width + gap;
  }, []);

  const update = useCallback(() => {
    const t = trackRef.current;
    if (!t) return;
    const index = Math.min(t.children.length - 1, Math.max(0, Math.round(t.scrollLeft / step())));
    const atStart = t.scrollLeft <= 2;
    const atEnd = t.scrollLeft >= t.scrollWidth - t.clientWidth - 2;
    wasAtStart.current = atStart;
    setPos((prev) => (prev.index === index && prev.atStart === atStart && prev.atEnd === atEnd ? prev : { index, atStart, atEnd }));
  }, [step]);

  const onScroll = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(update);
  }, [update]);

  // When the first card is re-shown, the browser keeps the old first card in view (scroll anchoring + snap),
  // then smooth-scrolls back. Jump straight to the start before paint so the second card never flashes.
  useLayoutEffect(() => {
    const t = trackRef.current;
    if (t && wasAtStart.current && t.scrollLeft > 0) {
      t.scrollTo({ left: 0, behavior: 'instant' });
    }
  }, [firstId, products.length]);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      cancelAnimationFrame(frame.current);
    };
  }, [update, products]);

  const goTo = (i) => {
    const t = trackRef.current;
    if (t) t.scrollTo({ left: i * step(), behavior: 'smooth' });
  };
  const prev = () => goTo(Math.max(0, pos.index - 1));
  const next = () => goTo(Math.min(products.length - 1, pos.index + 1));
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  };

  return (
    <div className="slider" aria-roledescription="carousel" aria-label="Fundy's cheese spread products">
      <div className="slider-controls">
        <button className="slider-btn" type="button" onClick={prev} disabled={pos.atStart} aria-label="Previous product">&#8592;</button>
        <button className="slider-btn" type="button" onClick={next} disabled={pos.atEnd} aria-label="Next product">&#8594;</button>
      </div>
      <ul className="slider-track" ref={trackRef} style={{ overflowAnchor: 'none' }} onScroll={onScroll} onKeyDown={onKeyDown} tabIndex={0} aria-label="Product list, scroll horizontally">
        {products.map((p, i) => (
          <ProductCard key={p.id} p={p} index={i} total={products.length} />
        ))}
      </ul>
      <div className="slider-dots" role="tablist" aria-label="Choose product">
        {products.map((p, i) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-label={`Go to product ${i + 1}`}
            aria-selected={i === pos.index ? 'true' : 'false'}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
