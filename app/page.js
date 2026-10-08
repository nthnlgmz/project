import Hero from '../components/Hero';
import ProductsSection from '../components/ProductsSection';
import WhySection from '../components/WhySection';
import EnjoySection from '../components/EnjoySection';
import StorySection from '../components/StorySection';
import NutritionSection from '../components/NutritionSection';
import ShopSection from '../components/ShopSection';
import BoothsSection from '../components/BoothsSection';
import FaqSection from '../components/FaqSection';
import BoothBanner from '../components/BoothBanner';
import ContactSection from '../components/ContactSection';
import { getProducts, getBooths } from '../lib/data';
import { buildSchema, toJsonLd } from '../lib/schema';

// Vercel rebuilds this page in the background at most every 5 minutes, so Google's structured data
// (products, upcoming booths) follows the database automatically. No manual rebuild needed.
export const revalidate = 300;

export default async function Home() {
  const products = await getProducts();
  const booths = await getBooths();
  // Product, ItemList and Event structured data are generated from the data files, so adding a product or
  // booth in /admin.html updates Google's metadata automatically on the next build.
  const schema = buildSchema(products, booths);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(schema) }} />
      <main id="main">
        <Hero />
        <ProductsSection products={products} />
        <NutritionSection />
        <WhySection />
        <StorySection />
        <EnjoySection />
        <ShopSection />
        <BoothsSection booths={booths} />
        <FaqSection />
        <ContactSection />
      </main>
      <BoothBanner booths={booths} />
    </>
  );
}
