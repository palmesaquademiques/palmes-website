// @ts-check
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://www.lespalmesaquademiques.fr',
  trailingSlash: 'never',
  build: { format: 'file' },
  prefetch: { prefetchAll: true },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
})
