import Core from '../../public/fundys-core.js';
import { getAllProducts } from '../../lib/data';

export const revalidate = 3600;

// /sitemap.xml: the homepage plus every product photo (for Google Images), rebuilt from the data files.
export async function GET() {
  const xml = Core.buildSitemap({ products: await getAllProducts() });
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
