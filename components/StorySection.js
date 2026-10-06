'use client';

import { useRef, useState } from 'react';

const VIDEO_SRC = 'https://pxeijseknjnqehrotjqq.supabase.co/storage/v1/object/public/videos/Fundys-Spread.mp4';

export default function StorySection() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  // preload="none": nothing is downloaded until the visitor presses play
  const play = () => {
    const v = videoRef.current;
    if (v) v.play();
  };

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  return (
    <section id="about-us" className="story" aria-labelledby="about-title">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow">Our Story</p>
          <h2 id="about-title">About Us</h2>
        </header>
        <figure className="story-figure">
          {/* Tap or click opens the full-size card, so the handwriting is easy to read on phones */}
          <a href="/images/our-story.jpg" target="_blank" rel="noopener" aria-label="Open the Fundy's story card full size">
            <picture>
              <source srcSet="/images/our-story.webp" type="image/webp" />
              <img src="/images/our-story.jpg" width="1110" height="808" loading="lazy" alt="Fundy's story card: Fundy's Spreads is a small business born from a home kitchen in Quezon Province. Our goal is to extend the feeling of Christmas beyond the holidays." />
            </picture>
          </a>
          <div className="sr-only">
            <p>Fundy's Spreads is a small business born from a home kitchen in Quezon Province.</p>
            <p>Our goal is simple: to extend the feeling of Christmas beyond the holidays. For many Filipinos, queso de bola is more than just cheese. It's part of the Christmas we grew up with. The red wax on the holiday table, family gathered around, and that familiar feeling of knowing it's finally Christmas.</p>
            <p>We wanted to bring that childhood feeling into something you can enjoy anytime. We reimagined queso de bola into approachable, familiar flavors made for the Filipino palate, bringing a little taste of those Christmas memories into every spread.</p>
          </div>
          <figcaption>Tap the card to see it full size.</figcaption>
        </figure>

        {/* Video: loads only after the visitor taps play. No controls, so right-click / long-press "Save video as" is the way to download. */}
        <div
          style={{
            position: 'relative',
            margin: '2rem auto 0',
            maxWidth: 420,
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
            preload="none"
            playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onClick={toggle}
            aria-label="Fundy's Spread video"
            style={{ width: '100%', height: 'auto', aspectRatio: '9 / 16', objectFit: 'cover', display: 'block', cursor: 'pointer', background: '#000' }}
          />
          {!playing && (
            <button
              type="button"
              onClick={play}
              aria-label="Play video"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 76,
                height: 76,
                borderRadius: '50%',
                border: '3px solid #fff',
                background: 'var(--red, #9b1c1c)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true" style={{ fill: '#fff', marginLeft: 4 }}>
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
