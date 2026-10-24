import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'
import { type PostSummary, postsQuery } from '../lib/queries'
import { sanityQuery } from '../lib/sanity'
import { siteConfig } from '../site.config'

export const GET: APIRoute = async ({ site }) => {
  const posts = await sanityQuery<PostSummary[]>(postsQuery)

  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: site ?? siteConfig.url,
    trailingSlash: false,
    customData: `<language>${siteConfig.language}</language>`,
    items: posts.map((post) => ({
      title: post.title,
      description: post.excerpt ?? undefined,
      pubDate: new Date(post.publishedAt),
      author: post.author ?? siteConfig.name,
      link: `/blog/${post.slug}`
    }))
  })
}
