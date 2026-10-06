import ProductSlider from './ProductSlider';
import ImageHeading from './ImageHeading';

export default function ProductsSection({ products }) {
  return (
    <section id="products" className="products" aria-labelledby="products-title">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow">The Spreads</p>
          <ImageHeading id="products-title" text="Our Cheese Spread Flavors" src="/images/heading-flavors.png" webp="/images/heading-flavors.webp" width={1020} height={136} />
          <p>Every 200g jar is made with imported Edam cheese. Pick a flavor and order from our Shopee or TikTok Shop store. Prices shown may change or be lower in the shops.</p>
        </header>
        <ProductSlider products={products} />
      </div>
    </section>
  );
}
