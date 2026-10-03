import BoothList from './BoothList';

export default function BoothsSection({ booths }) {
  return (
    <section id="booths" className="booths" aria-labelledby="booths-title">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow">Find Us</p>
          <h2 id="booths-title">Upcoming Fundy's Booths</h2>
          <p>Visit our booth to see the jars up close and take home your favorites. Dates and venues are subject to change, so check our Facebook page for the latest updates.</p>
        </header>
        <div className="booths-layout">
          <figure className="booths-figure">
            <picture>
              <source srcSet="/images/owner-at-booth.webp" type="image/webp" />
              <img src="/images/owner-at-booth.jpg" width="800" height="1067" loading="lazy" alt="Fundy's owner smiling behind the booth counter, with a grilled cheese sign and a free taste sign" />
            </picture>
            <figcaption>Come say hi at our next booth.</figcaption>
          </figure>
          <BoothList booths={booths} />
        </div>
      </div>
    </section>
  );
}
