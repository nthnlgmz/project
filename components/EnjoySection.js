export default function EnjoySection() {
  return (
    <section id="ways-to-enjoy" className="enjoy" aria-labelledby="enjoy-title">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow">Serving Ideas</p>
          <h2 id="enjoy-title">Ways to Enjoy Fundy's Cheese Spread</h2>
        </header>
        <ol className="enjoy-grid">
          <li><h3>On Warm Pandesal</h3><p>Split it, spread it, done. The classic Filipino merienda.</p></li>
          <li><h3>Toast &amp; Crackers</h3><p>Pair truffle or pimiento with crackers for easy party bites.</p></li>
          <li><h3>Sandwiches</h3><p>Use as palaman for loaf bread, ensaymada or sliders.</p></li>
          <li><h3>Hot Pasta</h3><p>Stir a spoonful of basil pesto through warm pasta for a quick creamy sauce.</p></li>
          <li><h3>Cheese Boards</h3><p>Add a jar to your charcuterie or Noche Buena spread.</p></li>
          <li><h3>Gifts</h3><p>A four-jar set makes an easy, tasty regalo.</p></li>
        </ol>
        <aside className="storage" aria-labelledby="storage-title">
          <div className="storage-head">
            <h3 id="storage-title">Storage Guide</h3>
            <img src="/images/logo-pill.webp" width="839" height="339" alt="" aria-hidden="true" loading="lazy" />
          </div>
          <h4>Storage</h4>
          <p>The Best Before date is imprinted on the label. Store in a cool, dry place away from direct sunlight. Once opened, refrigerate immediately and keep the lid tightly closed.</p>
          <h4>Serving Suggestions</h4>
          <p>Fundy's spreads are best enjoyed paired with bread, especially when the bread is lightly toasted to bring out the flavor. It can also be served with crackers or chips as a quick snack or dip.</p>
        </aside>
      </div>
    </section>
  );
}
