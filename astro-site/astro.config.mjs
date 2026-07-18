import { defineConfig } from 'astro/config';

// Каталог занимает корень GitHub Pages; демо и бриф остаются отдельным Astro-приложением.
export default defineConfig({
  site: 'https://iman-almasbek-uulu.github.io',
  base: '/invitation-sites/invitations',
});
