import ImageText from './ImageText';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Gourmet Palaman &middot; Made in the Philippines</p>
          <h1 id="hero-title">
            <ImageText text="Fundy's Spread" src="/images/hero-title.png" webp="/images/hero-title.webp" width={1069} height={180} />
            <span className="hero-sub">Made with Imported Edam Cheese</span>
          </h1>
          <p className="lead">Fundy's turns imported Edam cheese into creamy, spreadable palaman in four flavors. Pimiento, Spicy Pimiento, Truffle and Basil Pesto, ready for your pandesal, crackers and pasta.</p>
          <div className="cta-row">
            <a className="btn" href="#products">See the Flavors</a>
            <a className="btn btn-ghost" href="#shop">Where to Buy</a>
          </div>
        </div>
        <div className="hero-media">
          <figure className="hero-figure">
            <picture>
              <source srcSet="/images/jars-tray.webp" type="image/webp" />
              <img src="/images/jars-tray.jpg" width="900" height="1202" alt="Four open jars of Fundy's Spread on a wooden tray with spreaders" fetchPriority="high" />
            </picture>
          </figure>
          <img className="hero-wheel" src="/images/cheese-wheel.webp" width="795" height="584" alt="" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
