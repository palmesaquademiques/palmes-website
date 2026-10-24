import type { APIRoute } from 'astro'
import { siteConfig } from '../site.config'

const isProduction = process.env.VERCEL_ENV === 'production'

export const GET: APIRoute = () =>
  new Response(
    [
      'User-agent: *',
      isProduction ? 'Allow: /' : 'Disallow: /',
      '',
      `Sitemap: ${siteConfig.url}/sitemap-index.xml`,
      ''
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  )
