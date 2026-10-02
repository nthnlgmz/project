# Fundy's website: before you publish

Static site (HTML/CSS/JS). Host it anywhere: Netlify, Cloudflare Pages, Vercel, GitHub Pages or any web host.

## Replace these placeholders (search for `REPLACE` and `fundys.ph`)
1. **Domain**: `https://www.fundys.ph` appears in `index.html` (canonical, Open Graph, JSON-LD), `sitemap.xml` and `robots.txt`. Swap in the real domain.
2. **Shop links**: every `shopee.ph/REPLACE-...` and `tiktok.com/@REPLACE-...` link. Use the direct product listing URL for each flavor.
3. **Prices**: shown prices are placeholders (250 / 250 / 280 / 250 PHP). Update them in two places per product: the visible card and the JSON-LD block near the top of `index.html`.
4. **Social links**: Facebook and Instagram (footer and JSON-LD `sameAs`).
5. **Logo**: the logo is a CSS pill. Replace `.logo` with the real logo file when available and point JSON-LD `logo` to it.
6. **Product photos**: slider images are crops from the booth photos. Swap in clean studio shots in `images/products/` (keep the filenames) when possible.

## After going live
- Add the site in Google Search Console, verify it and submit `sitemap.xml`. Do the same in Bing Webmaster Tools.
- Test pages with Google's Rich Results Test (Product, FAQ) and PageSpeed Insights.
- Create or claim a Google Business Profile if Fundy's has a physical pickup point or regular booth address.
- Link to this site from the Shopee shop description, TikTok bio, Facebook and Instagram. These backlinks help rankings.
- Keep prices and availability in sync with the shops, since search results can display them.
