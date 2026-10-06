'use client';

import { useEffect, useRef, useState } from 'react';

// Text drawn as an image (like the hero title). The real text stays in the page for Google and screen readers,
// and it is shown as normal text if the image is missing or fails to load.
export default function ImageText({ text, src, webp, width, height }) {
  const ref = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ok | error

  // the image may already be loaded before React attaches onLoad (cached or server-rendered)
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete) setStatus(el.naturalWidth > 0 ? 'ok' : 'error');
  }, []);

  const ok = status === 'ok';
  return (
    <span className="image-text">
      <span className={ok ? 'sr-only' : ''}>{text}</span>
      {status !== 'error' ? (
        <picture>
          {webp ? <source srcSet={webp} type="image/webp" /> : null}
          <img
            ref={ref}
            className={ok ? 'image-text-img' : 'image-text-img image-text-wait'}
            src={src}
            width={width}
            height={height}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            onLoad={() => setStatus('ok')}
            onError={() => setStatus('error')}
          />
        </picture>
      ) : null}
    </span>
  );
}
