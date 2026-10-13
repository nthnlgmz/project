import ProductSlider from './ProductSlider';

export default function ProductsSection({ products }) {
  return (
    <section id="products" className="products" aria-labelledby="products-title">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow">The Spreads</p>
          <h2 id="products-title">Our Cheese Spread Flavors</h2>
          <p>Every 200g jar is made with imported Edam cheese. Pick a flavor, add it to your cart and pay securely with GCash, Maya or card.</p>
        </header>
        <ProductSlider products={products} />
      </div>
    </section>
  );
}
