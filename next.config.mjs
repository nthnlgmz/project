/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },                         // browsers must not guess file types
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },                             // other sites cannot put this site in a frame (clickjacking)
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, noimageindex' },  // client has unpublished the site: keep it out of search (remove to go live)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },             // always use https once visited
];

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
