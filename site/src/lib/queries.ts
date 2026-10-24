import type { TypedObject } from '@portabletext/types'

export type SanityImage = {
  _type: string
  alt?: string | null
  caption?: string | null
  crop?: { top: number; bottom: number; left: number; right: number }
  hotspot?: { x: number; y: number; width: number; height: number }
  asset: {
    _id: string
    metadata: {
      lqip?: string
      dimensions: { width: number; height: number; aspectRatio: number }
    }
  }
}

export type RichText = TypedObject[]

export type TripStatus = 'to-confirm' | 'confirmed' | 'registration-open' | 'full' | 'cancelled'

export type TripSummary = {
  _id: string
  title: string
  slug: string
  startDate: string
  endDate: string | null
  status: TripStatus
  helloAssoUrl: string | null
  summary: string | null
  coverImage: SanityImage | null
}

export type Trip = TripSummary & { body: RichText | null }

export type PostSummary = {
  _id: string
  title: string
  slug: string
  publishedAt: string
  author: string | null
  excerpt: string | null
  coverImage: SanityImage | null
}

export type Post = PostSummary & { body: RichText | null }

export type Chapter = {
  _key: string
  kicker: string | null
  title: string
  text: string | null
  image: SanityImage | null
  linkLabel: string | null
  linkUrl: string | null
}

export type HomePage = {
  heroTitle: string
  heroTagline: string | null
  heroImage: SanityImage
  introTitle: string | null
  intro: RichText | null
  keyFigures: { _key: string; value: string; label: string }[] | null
  chapters: Chapter[] | null
  closingTitle: string | null
  closingText: string | null
}

export type ActivitiesPage = {
  intro: string | null
  sections: { _key: string; title: string; image: SanityImage | null; body: RichText | null }[]
}

export type GalleryPage = { intro: string | null; photos: SanityImage[] | null }

export type InstructorLevel = 'E1' | 'E2' | 'N4' | 'MF1' | 'MF2'

export type Emblem =
  | 'crown'
  | 'coins'
  | 'seal'
  | 'dolphin'
  | 'tentacleCoin'
  | 'tentacleQuill'
  | 'tentacleInkwell'
  | 'certificates'
  | 'loanTag'
  | 'champagne'
  | 'compass'
  | 'seahorse'

export type Member = {
  _id: string
  name: string
  nickname: string | null
  team: 'board' | 'committee' | 'none'
  role: string | null
  title: string | null
  emblem: Emblem | null
  secretTitle: string | null
  instructorLevel: InstructorLevel | null
  instructorTitle: string | null
  landPhoto: SanityImage
  diverPhoto: SanityImage | null
}

export type ContactPage = {
  intro: RichText | null
  address: string | null
  schedule: string | null
  mapUrl: string | null
  membershipUrl: string | null
  membershipText: RichText | null
  faq: { _key: string; category: string | null; question: string; answer: RichText | null }[] | null
  documents: { _key: string; title: string; url: string; size: number }[] | null
}

const asset = '"asset": asset->{ _id, metadata { lqip, dimensions } }'

const image = `{ ..., ${asset} }`

const richText = `[]{
  ...,
  _type == "image" => { ${asset} },
  _type == "photoGrid" => { "images": images[]${image} }
}`

const tripFields = `
  _id, title, "slug": slug.current, startDate, endDate, status, helloAssoUrl, summary,
  "coverImage": coverImage${image}
`

const postFields = `
  _id, title, "slug": slug.current, publishedAt, author, excerpt,
  "coverImage": coverImage${image}
`

const tripEnd = 'coalesce(endDate, startDate)'

export const homeQuery = `{
  "page": *[_id == "homePage"][0]{
    heroTitle, heroTagline, "heroImage": heroImage${image},
    introTitle, "intro": intro${richText}, keyFigures,
    "chapters": chapters[]{ _key, kicker, title, text, "image": image${image}, linkLabel, linkUrl },
    closingTitle, closingText
  },
  "upcomingTrips": *[_type == "trip" && defined(slug.current) && ${tripEnd} >= $today && status != "cancelled"]
    | order(startDate asc)[0...8]{ ${tripFields} },
  "recentTrips": *[_type == "trip" && defined(slug.current) && ${tripEnd} < $today]
    | order(startDate desc)[0...6]{ ${tripFields} },
  "latestPosts": *[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0...3]{ ${postFields} }
}`

export const tripsPageQuery = `{
  "intro": *[_id == "tripsPage"][0].intro,
  "trips": *[_type == "trip" && defined(slug.current)] | order(startDate asc){ ${tripFields} }
}`

export const tripsWithBodyQuery = `*[_type == "trip" && defined(slug.current)] | order(startDate asc){
  ${tripFields}, "body": body${richText}
}`

export const postsQuery = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc){
  ${postFields}
}`

export const postsWithBodyQuery = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc){
  ${postFields}, "body": body${richText}
}`

export const activitiesPageQuery = `*[_id == "activitiesPage"][0]{
  intro, "sections": coalesce(sections[]{ _key, title, "image": image${image}, "body": body${richText} }, [])
}`

export const galleryPageQuery = `*[_id == "galleryPage"][0]{ intro, "photos": photos[]${image} }`

export const contactPageQuery = `{
  "page": *[_id == "contactPage"][0]{
    "intro": intro${richText}, address, schedule, mapUrl, membershipUrl,
    "membershipText": membershipText${richText},
    "faq": faq[]{ _key, category, question, "answer": answer${richText} },
    "documents": documents[defined(file.asset)]{ _key, title, "url": file.asset->url, "size": file.asset->size }
  },
  "members": *[_type == "member" && defined(landPhoto.asset)] | order(order asc){
    _id, name, nickname, team, role, title, emblem, secretTitle, instructorLevel, instructorTitle,
    "landPhoto": landPhoto${image}, "diverPhoto": diverPhoto${image}
  }
}`

export const shareImagesQuery = `{
  "heroImage": *[_id == "homePage"][0].heroImage${image},
  "activityImage": *[_id == "activitiesPage"][0].sections[defined(image)][0].image${image},
  "galleryImage": *[_id == "galleryPage"][0].photos[0]${image},
  "trips": *[_type == "trip" && defined(slug.current)] | order(startDate asc){
    title, "slug": slug.current, startDate, endDate, "coverImage": coverImage${image}
  },
  "posts": *[_type == "post" && defined(slug.current)] | order(publishedAt desc){
    title, "slug": slug.current, author, publishedAt, "coverImage": coverImage${image}
  }
}`
