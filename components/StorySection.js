export default function StorySection() {
  return (
    <section id="our-story" className="story" aria-labelledby="story-title">
      <div className="container">
        <div className="story-card">
          <figure className="story-tree">
            <picture>
              <source srcSet="/images/story-tree.webp" type="image/webp" />
              <img src="/images/story-tree.png" width="282" height="801" loading="lazy" alt="A Christmas tree with red ribbons and gold ornaments beside red and cream stripes" />
            </picture>
          </figure>
          <div className="story-body">
            <p className="eyebrow">Our Story</p>
            <h2 id="story-title">Born from a Home Kitchen</h2>
            <p>Fundy's Spreads is a small business born from a home kitchen in Quezon Province.</p>
            <p>Our goal is simple: to extend the feeling of Christmas beyond the holidays. For many Filipinos, queso de bola is more than just cheese. It's part of the Christmas we grew up with. The red wax on the holiday table, family gathered around, and that familiar feeling of knowing it's finally Christmas.</p>
            <p>We wanted to bring that childhood feeling into something you can enjoy anytime. We reimagined queso de bola into approachable, familiar flavors made for the Filipino palate, bringing a little taste of those Christmas memories into every spread.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
