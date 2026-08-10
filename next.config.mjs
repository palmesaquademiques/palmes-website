// import path from 'node:path'
// import { fileURLToPath } from 'node:url'

export default {
  staticPageGenerationTimeout: 300,
  experimental: {
    cpus: 1,
    workerThreads: false,
    staticGenerationMaxConcurrency: 1,
    staticGenerationRetryCount: 3
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.notion.so' },
      { protocol: 'https', hostname: 'notion.so' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'abs.twimg.com' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      { protocol: 'https', hostname: 's3.us-west-2.amazonaws.com' }
    ],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  redirects: async () => {
    return [
      // redirect all wordpress url for SEO
      {
        source: '/index.php/les-activites/:slug*',
        destination: '/les-activites',
        permanent: true
      },
      {
        source: '/index.php/la-plongee/:slug*',
        destination: '/les-activites',
        permanent: true
      },
      {
        source: '/index.php/mnuclubenpratique/:slug*',
        destination: '/les-activites',
        permanent: true
      },
      {
        source: '/index.php/component/ohanah/:slug*',
        destination: '/les-sorties',
        permanent: true
      },
      {
        source: '/index.php/contact',
        destination: '/contact',
        permanent: true
      },
      {
        source: '/index.php/:slug*',
        destination: '/',
        permanent: true
      }
    ]
  },
}
