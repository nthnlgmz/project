'use client';

import { useEffect, useRef } from 'react';

const VIDEO_SRC = 'https://pxeijseknjnqehrotjqq.supabase.co/storage/v1/object/public/videos/Fundys-Spread.mp4';

export default function StorySection() {
  const videoRef = useRef(null);

  // pause the video when it scrolls out of view
  useEffect(() => {
    const v = videoRef.current;
    if (!v || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !v.paused) v.pause();
      },
      { threshold: 0.2 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <section id="about-us" className="story" aria-labelledby="about-title">
      <div className="container">
        <header className="section-head" style={{ marginBottom: 0 }}>
          <p className="eyebrow">Our Story</p>
          <h2 id="about-title" className="sr-only">About Us</h2>
        </header>

        {/* Team photo with a large faded "ABOUT US" behind them (text-behind-subject effect) */}
        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '6%',
              left: 0,
              right: 0,
              textAlign: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3.4rem, 17vw, 9rem)',
              lineHeight: 1,
              letterSpacing: '.04em',
              whiteSpace: 'nowrap',
              color: 'var(--red)',
              opacity: 0.14,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            ABOUT US
          </div>
          <img
            src="/images/story-team.webp"
            width="1400"
            height="1072"
            alt="The Fundy's team holding a Fundy's gift box and jars of cheese spread"
            style={{
              position: 'relative',
              display: 'block',
              width: '100%',
              height: 'auto',
              // fade the cut-off bottom edge into the background so it doesn't sit hard against the text below
              WebkitMaskImage: 'linear-gradient(to bottom, #000 72%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, #000 72%, transparent 100%)',
            }}
          />
        </div>

        <style>{`
          .story-split{display:grid;grid-template-columns:1fr;gap:2rem;margin-top:.5rem;align-items:center}
          .story-text{max-width:38rem;margin:0 auto;text-align:center}
          .story-video{width:100%;max-width:340px;margin:0 auto}
          @media (min-width:900px){
            .story-split{grid-template-columns:1.2fr 1fr;gap:3.5rem;max-width:1000px;margin-left:auto;margin-right:auto}
            .story-text{max-width:none;margin:0;text-align:left}
            .story-video{margin:0 auto}
          }
        `}</style>

        <div className="story-split">
        <div className="story-text">
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--red)' }}>
            Fundy&rsquo;s Spreads is a small business born from a home kitchen in Quezon Province.
          </p>
          <p>
            Our goal is simple &mdash; to extend the feeling of Christmas beyond the holidays. For many Filipinos, queso de bola is more than just cheese. It&rsquo;s part of the Christmas we grew up with. The red wax on the holiday table, family gathered around, and that familiar feeling of knowing it&rsquo;s finally Christmas.
          </p>
          <p>
            We wanted to bring that childhood feeling into something you can enjoy anytime. We reimagined queso de bola into approachable, familiar flavors made for the Filipino palate, bringing a little taste of those Christmas memories into every spread.
          </p>
        </div>

        {/* Video: loads only after the visitor taps play (poster is og-image). Native controls (timeline seeking); long-press / right-click also lets visitors save it. */}
        <div
          className="story-video"
          style={{
            position: 'relative',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: 'var(--shadow)',
            background: '#000',
            lineHeight: 0,
          }}
        >
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            poster="/images/og-image.jpg"
            preload="none"
            playsInline
            controls
            controlsList="nodownload"
            aria-label="Fundy's Spread video"
            style={{ width: '100%', height: 'auto', aspectRatio: '3 / 4', objectFit: 'cover', display: 'block', background: '#000' }}
          />
        </div>
        </div>
      </div>
    </section>
  );
}
