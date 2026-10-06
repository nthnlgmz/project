import { DESCRIPTION } from '../lib/seo';

export const dynamic = 'force-static';

export default function manifest() {
  return {
    name: "Fundy's Spread",
    short_name: "Fundy's",
    description: DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#fff6ea',
    theme_color: '#9b1313',
    icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
