/* Fundy's shared logic: used by the website (script.js) and the admin page (admin.html).
   Turns booths + products data into page HTML and into SEO structured data (JSON-LD). */
(function (root, factory) {
  // Works as a plain <script> (admin.html -> window.FundysCore) and as a module (Next.js build -> require/import).
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FundysCore = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  // Public address of the site. Next.js fills in NEXT_PUBLIC_SITE_URL at build time; the admin page doesn't need it.
  var ENV_SITE;
  try { ENV_SITE = process.env.NEXT_PUBLIC_SITE_URL; } catch (e) { ENV_SITE = undefined; }
  var SITE = String(ENV_SITE || 'https://fundys-spread.vercel.app').replace(/\/+$/, '') + '/';
  var ORG_ID = SITE + '#organization';
  var LIST_ID = SITE + '#flavors';
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var STATIC_IMAGES = ['images/jars-tray.jpg', 'images/booth.jpg', 'images/shelf-display.jpg', 'images/owner-at-booth.jpg'];
  var DASH = '\u2013';
  var DOT = '\u00b7';

  /* ---------- helpers ---------- */
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function slugify(s) {
    return String(s || '').toLowerCase().replace(/['\u2019]/g, '').replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function safeUrl(u) {
    u = String(u || '').trim();
    return /^https?:\/\//i.test(u) ? u : '';
  }
  function parseDate(iso) {
    var p = String(iso || '').split('-');
    if (p.length !== 3) return null;
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d.getTime()) ? null : d;
  }
  function todayDate() {
    var n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }
  function isPast(b, today) {
    var e = parseDate(b.end || b.start);
    return !!e && e < (today || todayDate());
  }
  function sortBooths(list) {
    return (list || []).slice().sort(function (a, b) {
      var x = a.start || '', y = b.start || '';
      return x < y ? -1 : x > y ? 1 : 0;
    });
  }
  function formatRange(start, end) {
    var a = parseDate(start), b = parseDate(end || start);
    if (!a) return '';
    if (!b) b = a;
    var sm = MONTHS[a.getMonth()], em = MONTHS[b.getMonth()];
    if (a.getTime() === b.getTime()) return sm + ' ' + a.getDate();
    if (a.getFullYear() !== b.getFullYear()) {
      return sm + ' ' + a.getDate() + ', ' + a.getFullYear() + ' ' + DASH + ' ' + em + ' ' + b.getDate() + ', ' + b.getFullYear();
    }
    if (a.getMonth() === b.getMonth()) return sm + ' ' + a.getDate() + DASH + b.getDate();
    return sm + ' ' + a.getDate() + ' ' + DASH + ' ' + em + ' ' + b.getDate();
  }
  function formatPrice(n) {
    n = Number(n) || 0;
    var dec = Math.round(n) !== n;
    return '\u20b1' + n.toLocaleString('en-US', { minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: 2 });
  }
  function isVisible(p) { return p && p.visible !== false; }

  /* ---------- product defaults (used when optional fields are left blank) ---------- */
  function productDefaults(p) {
    var title = p.title || '';
    var spread = /spread/i.test(title) ? '' : ' Spread';
    var size = p.grams ? p.grams + 'g' : (p.jars ? p.jars + ' jars' : '');
    var base = "Fundy's " + title + spread;
    return {
      sizeLine: size ? size + ' ' + DOT + " Fundy's Spread" : '',
      seoName: base + (size ? ' (' + size + ')' : ''),
      seoDescription: base + ' is a gourmet cheese palaman made with imported Edam cheese.' + (p.description ? ' ' + p.description : ''),
      alt: 'Jar of ' + base + (p.grams ? ', ' + p.grams + 'g gourmet cheese palaman' : ''),
      image: 'images/products/' + (p.id || slugify(title)) + '.jpg'
    };
  }


  /* ---------- images: a local path (images/products/x.jpg) or a full URL (Supabase Storage) ---------- */
  function isAbsolute(u) { return /^https?:\/\//i.test(String(u || '')); }
  function imageSrc(img) {            // value for <img src>
    img = String(img || '');
    return isAbsolute(img) ? img : '/' + img.replace(/^\/+/, '');
  }
  function imageUrl(img) {            // absolute URL for structured data and the sitemap
    img = String(img || '');
    return isAbsolute(img) ? img : SITE + img.replace(/^\/+/, '');
  }

  /* ---------- database rows (Supabase, snake_case) <-> objects used on the page (camelCase) ---------- */
  // Repairs text that was saved with a wrong encoding, e.g. "200g \u00c2\u00b7 Fundy's Spread" -> "200g \u00b7 Fundy's Spread"
  function fixText(v) {
    return typeof v === 'string' ? v.replace(/\u00c2(?=[\u00a0-\u00bf])/g, '') : v;
  }

  function productFromRow(r) {
    return {
      id: r.id, title: fixText(r.title), sizeLine: fixText(r.size_line) || '', grams: r.grams, jars: r.jars,
      description: fixText(r.description), price: Number(r.price),
      shopeeUrl: r.shopee_url || '', tiktokUrl: r.tiktok_url || '', badge: fixText(r.badge) || '',
      photo: !!r.photo, inStock: r.in_stock !== false, visible: r.visible !== false,
      image: r.image, webp: !!r.webp, imageAlt: fixText(r.image_alt) || '',
      seoName: fixText(r.seo_name) || '', seoDescription: fixText(r.seo_description) || '', sortOrder: r.sort_order
    };
  }
  function productToRow(p) {
    var row = {
      id: p.id, title: p.title, size_line: p.sizeLine || null, grams: p.grams || null, jars: p.jars || null,
      description: p.description, price: p.price,
      shopee_url: p.shopeeUrl || null, tiktok_url: p.tiktokUrl || null, badge: p.badge || null,
      photo: !!p.photo, in_stock: p.inStock !== false, visible: p.visible !== false,
      image: p.image, webp: !!p.webp, image_alt: p.imageAlt || null,
      seo_name: p.seoName || null, seo_description: p.seoDescription || null
    };
    if (p.sortOrder != null) row.sort_order = p.sortOrder;
    return row;
  }
  function boothFromRow(r) {
    return { id: r.id, name: fixText(r.name), city: fixText(r.city), region: fixText(r.region) || '', address: r.address || '', start: r.start_date, end: r.end_date || r.start_date };
  }
  function boothToRow(b) {
    return { id: b.id, name: b.name, city: b.city, region: b.region || '', address: b.address || null, start_date: b.start, end_date: b.end || b.start };
  }

  /* ---------- HTML rendering ---------- */
  function boothHtml(b) {
    return '<li class="booth-item" data-end="' + esc(b.end || b.start) + '">' +
      '<p class="booth-date"><time datetime="' + esc(b.start) + '">' + esc(formatRange(b.start, b.end)) + '</time></p>' +
      '<h4>' + esc(b.name) + '</h4>' +
      '<p class="booth-city">' + esc(b.city) + '</p></li>';
  }

  function productHtml(p, i, n) {
    var d = productDefaults(p);
    var title = esc(p.title);
    var img = p.image || d.image;
    var alt = p.imageAlt || d.alt;
    var webp = p.webp && /\.(jpe?g|png)$/i.test(img) ? imageSrc(img).replace(/\.(jpe?g|png)$/i, '.webp') : '';
    var shopee = safeUrl(p.shopeeUrl), tiktok = safeUrl(p.tiktokUrl);
    var badge = p.badge || (p.inStock === false ? 'Sold out' : '');
    var badgeCls = p.badge ? 'badge' : 'badge badge--soldout';
    var buy = '';
    if (shopee || tiktok) {
      buy = '<div class="buy-row' + (shopee && tiktok ? '' : ' buy-row--single') + '">' +
        (shopee ? '<a class="btn btn-shopee" href="' + esc(shopee) + '" target="_blank" rel="noopener" aria-label="Buy Fundy\'s ' + title + ' on Shopee">Shopee</a>' : '') +
        (tiktok ? '<a class="btn btn-tiktok" href="' + esc(tiktok) + '" target="_blank" rel="noopener" aria-label="Buy Fundy\'s ' + title + ' on TikTok Shop">TikTok Shop</a>' : '') +
        '</div>';
    }
    return '<li class="product-card" id="' + esc(p.id) + '" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + n + '"><article>' +
      '<div class="product-img' + (p.photo ? ' product-img--photo' : '') + '"><picture>' +
      (webp ? '<source srcset="' + esc(webp) + '" type="image/webp">' : '') +
      '<img src="' + esc(imageSrc(img)) + '" width="700" height="700" loading="lazy" alt="' + esc(alt) + '"></picture></div>' +
      '<h3>' + title + '</h3>' +
      '<p class="product-size">' + esc(p.sizeLine || d.sizeLine) + '</p>' +
      (badge ? '<p class="' + badgeCls + '">' + esc(badge) + '</p>' : '') +
      '<p class="product-desc">' + esc(p.description) + '</p>' +
      '<p class="price"><span class="price-amount">' + esc(formatPrice(p.price)) + '</span></p>' +
      '<p class="price-note">Price may change or be lower in the shop.</p>' +
      buy + '</article></li>';
  }

  /* ---------- SEO structured data ---------- */
  function buildEvent(b) {
    var addr = { '@type': 'PostalAddress' };
    if (b.address) addr.streetAddress = b.address;
    addr.addressLocality = b.city;
    if (b.region) addr.addressRegion = b.region;
    addr.addressCountry = 'PH';
    return {
      '@type': 'Event',
      name: "Fundy's Booth at " + b.name,
      startDate: b.start,
      endDate: b.end || b.start,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      description: "Visit the Fundy's booth to see, try and take home Fundy's Spread, a gourmet cheese palaman made with imported Edam cheese.",
      image: SITE + 'images/booth.jpg',
      location: { '@type': 'Place', name: b.name, address: addr },
      organizer: { '@id': ORG_ID },
      url: SITE + '#booths'
    };
  }

  function buildProduct(p) {
    var d = productDefaults(p);
    var url = SITE + '#' + p.id;
    var prod = {
      '@type': 'Product',
      '@id': url,
      url: url,
      name: p.seoName || d.seoName,
      description: p.seoDescription || d.seoDescription,
      image: [imageUrl(p.image || d.image)],
      brand: { '@type': 'Brand', name: "Fundy's" },
      manufacturer: { '@id': ORG_ID },
      category: 'Cheese Spreads',
      countryOfOrigin: { '@type': 'Country', name: 'Philippines' }
    };
    if (p.grams) prod.weight = { '@type': 'QuantitativeValue', value: Number(p.grams), unitCode: 'GRM' };
    else if (p.jars) prod.additionalProperty = { '@type': 'PropertyValue', name: 'Jars per pack', value: Number(p.jars) };
    prod.offers = {
      '@type': 'Offer',
      priceCurrency: 'PHP',
      price: (Number(p.price) || 0).toFixed(2),
      availability: p.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: safeUrl(p.tiktokUrl) || safeUrl(p.shopeeUrl) || url,
      seller: { '@id': ORG_ID }
    };
    return prod;
  }

  /* Replace the Event / Product / ItemList nodes of a JSON-LD @graph using fresh data.
     data = { booths: [...], products: [...] }; a missing key leaves that part untouched. */
  function applyToGraph(graph, data, opts) {
    opts = opts || {};
    var today = opts.today || todayDate();
    var out = (graph || []).slice();

    if (data.products) {
      var prods = data.products.filter(isVisible).map(buildProduct);
      out = out.filter(function (n) { return n['@type'] !== 'Product'; });
      var list = {
        '@type': 'ItemList', '@id': LIST_ID, name: "Fundy's Spread flavors and packs",
        itemListElement: prods.map(function (p, i) { return { '@type': 'ListItem', position: i + 1, url: p.url }; })
      };
      var at = -1;
      out.forEach(function (n, i) { if (n['@type'] === 'ItemList') at = i; });
      if (at < 0) { out.push(list); at = out.length - 1; } else { out[at] = list; }
      out.splice.apply(out, [at + 1, 0].concat(prods));
    }

    if (data.booths) {
      out = out.filter(function (n) { return n['@type'] !== 'Event'; });
      sortBooths(data.booths).filter(function (b) { return !isPast(b, today); })
        .forEach(function (b) { out.push(buildEvent(b)); });
    }
    return out;
  }

  function buildSitemap(data) {
    var imgs = STATIC_IMAGES.slice();
    (data.products || []).filter(isVisible).forEach(function (p) {
      var img = p.image || productDefaults(p).image;
      if (imgs.indexOf(img) < 0) imgs.push(img);
    });
    var x = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
      '  <url>\n    <loc>' + SITE + '</loc>\n    <lastmod>' + new Date().toISOString().slice(0, 10) + '</lastmod>\n' +
      '    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n';
    imgs.forEach(function (i) { x += '    <image:image><image:loc>' + esc(imageUrl(i)) + '</image:loc></image:image>\n'; });
    return x + '  </url>\n</urlset>\n';
  }

  return {
    SITE: SITE, esc: esc, slugify: slugify, safeUrl: safeUrl, parseDate: parseDate, todayDate: todayDate,
    isPast: isPast, sortBooths: sortBooths, formatRange: formatRange, formatPrice: formatPrice,
    imageSrc: imageSrc, imageUrl: imageUrl, productFromRow: productFromRow, productToRow: productToRow,
    boothFromRow: boothFromRow, boothToRow: boothToRow,
    isVisible: isVisible, productDefaults: productDefaults, boothHtml: boothHtml, productHtml: productHtml,
    buildEvent: buildEvent, buildProduct: buildProduct, applyToGraph: applyToGraph, buildSitemap: buildSitemap
  };
});
