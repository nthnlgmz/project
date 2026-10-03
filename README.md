# Fundy's website: before you publish

Static site (HTML/CSS/JS). Host it anywhere: Netlify, Cloudflare Pages, Vercel, GitHub Pages or any web host.

## Still to replace
1. **Domain**: `https://www.fundys.ph` is a stand-in. It appears in `index.html` (canonical, Open Graph, JSON-LD), `sitemap.xml` and `robots.txt`. Swap in the real domain.
2. **Shopee**: all Shopee links are in. The reseller package is TikTok-only by design.
3. **Facebook link**: currently the `facebook.com/share/...` link. Replace with the page's direct URL (facebook.com/<pagename>) if available.
4. **Logo**: the logo is a CSS pill. Swap in the real logo file when available.
5. **Instagram**: none listed. Add a footer link and a `sameAs` entry in the JSON-LD if the brand has one.

## Prices
300 PHP for Pimiento, Truffle and Basil Pesto; 315 PHP for Spicy Pimiento. Update in two places per product: the visible card and the JSON-LD block at the top of `index.html`.

## After going live
- Add the site in Google Search Console, verify it and submit `sitemap.xml`. Do the same in Bing Webmaster Tools.
- Test with Google's Rich Results Test and PageSpeed Insights.
- Link to the site from the Shopee shop, TikTok bio and Facebook page.
- Keep prices in sync with the shops, since search results can display them.

## Upcoming booths
Booth cards are in the `#booths` section of `index.html`, and matching `Event` entries are in the JSON-LD block. Past events hide automatically on the page, but update both places when new dates are announced (the JSON-LD does not auto-hide).

## Honest review video
Removed for now. The section, CSS and JS are saved in `video-section-snippet.html` with steps to add it back.
