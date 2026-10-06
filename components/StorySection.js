export default function StorySection() {
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
      </div>
    </section>
  );
}
