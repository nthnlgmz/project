export default function WhySection() {
  return (
    <section id="why-fundys" className="why" aria-labelledby="why-title">
      <div className="container why-grid">
        <figure className="why-figure">
          <picture>
            <source srcSet="/images/shelf-display.webp" type="image/webp" />
            <img src="/images/shelf-display.jpg" width="800" height="1199" loading="lazy" alt="Wooden three-tier display of Fundy's Spread jars labeled Truffle, Basil Pesto and Pimiento" />
          </picture>
        </figure>
        <div>
          <p className="eyebrow">Why Fundy's</p>
          <h2 id="why-title">Palaman with a Gourmet Twist</h2>
          <p>Fundy's is a Filipino-made cheese spread built on one idea: start with good cheese. Every jar is made with imported Edam cheese, the same style of cheese behind the beloved <em>quezo de bola</em>, then blended into spreads you can use every day.</p>
          <ul className="feature-list">
            <li><strong>Imported Edam cheese.</strong> The base of every flavor.</li>
            <li><strong>Four distinct flavors.</strong> From pimiento to truffle.</li>
            <li><strong>Ready to spread.</strong> No slicing, no grating, no fuss.</li>
            <li><strong>Gift-friendly 200g jars.</strong> Perfect for handaan, regalo and picnics.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
