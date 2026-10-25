import type { APIRoute, GetStaticPaths } from 'astro'
import { formatDate, formatDateRange } from '../../lib/dates'
import { type SanityImage, shareImagesQuery } from '../../lib/queries'
import { sanityQuery } from '../../lib/sanity'
import { renderShareImage } from '../../lib/shareImage'

type ShareImage = { title: string; subtitle: string; image: SanityImage | null }

type ShareImagesData = {
  heroImage: SanityImage
  activityImage: SanityImage | null
  galleryImage: SanityImage | null
  trips: {
    title: string
    slug: string
    startDate: string
    endDate: string | null
    coverImage: SanityImage | null
  }[]
  posts: {
    title: string
    slug: string
    author: string | null
    publishedAt: string
    coverImage: SanityImage | null
  }[]
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

export const getStaticPaths = (async () => {
  const { heroImage, activityImage, galleryImage, trips, posts } =
    await sanityQuery<ShareImagesData>(shareImagesQuery)

  const pages: [string, ShareImage][] = [
    [
      'accueil',
      {
        title: 'Reprenez ou découvrez la plongée',
        subtitle: 'Club de plongée sous-marine · Toulouse · depuis 1986',
        image: heroImage
      }
    ],
    [
      'les-sorties',
      {
        title: 'Les sorties',
        subtitle: 'Le calendrier des sorties plongée du club',
        image: trips.findLast((trip) => trip.coverImage)?.coverImage ?? heroImage
      }
    ],
    [
      'les-activites',
      {
        title: 'Les activités',
        subtitle: 'Plongée, entraînements en piscine et baptêmes',
        image: activityImage ?? heroImage
      }
    ],
    [
      'blog',
      {
        title: 'Le blog',
        subtitle: 'Récits de sorties et vie du club',
        image: posts.find((post) => post.coverImage)?.coverImage ?? heroImage
      }
    ],
    [
      'galerie',
      { title: 'Galerie', subtitle: 'Nos images sous la surface', image: galleryImage ?? heroImage }
    ],
    [
      'inscriptions',
      {
        title: 'Inscriptions',
        subtitle: 'Toutes les informations pour rejoindre le club',
        image: heroImage
      }
    ],
    [
      'jeu',
      {
        title: 'Poulpalmes',
        subtitle: 'Le jeu du poulpe · Saurez-vous atteindre le niveau Moniteur ?',
        image: null
      }
    ],
    [
      'contact',
      {
        title: 'Contact',
        subtitle: 'Le mardi soir à la piscine Léo Lagrange',
        image: heroImage
      }
    ]
  ]

  const tripPages: [string, ShareImage][] = trips.map((trip) => [
    `les-sorties/${trip.slug}`,
    {
      title: trip.title,
      subtitle: `Sortie plongée · ${capitalize(formatDateRange(trip.startDate, trip.endDate))}`,
      image: trip.coverImage ?? heroImage
    }
  ])

  const postPages: [string, ShareImage][] = posts.map((post) => [
    `blog/${post.slug}`,
    {
      title: post.title,
      subtitle: [formatDate(post.publishedAt), post.author].filter(Boolean).join(' · '),
      image: post.coverImage ?? heroImage
    }
  ])

  return [...pages, ...tripPages, ...postPages].map(([path, shareImage]) => ({
    params: { path },
    props: shareImage
  }))
}) satisfies GetStaticPaths

export const GET: APIRoute<ShareImage> = async ({ props }) =>
  new Response(await renderShareImage(props), { headers: { 'Content-Type': 'image/png' } })
