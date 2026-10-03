import { DESCRIPTION } from '../lib/seo';

export const dynamic = 'force-static';

export default function manifest() {
  return {
    name: "Fundy's Spread",
    short_name: "Fundy's",
    description: DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#fbf4e6',
    theme_color: '#1f4a38',
    icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
