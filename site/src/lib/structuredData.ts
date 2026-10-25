import { siteConfig } from '../site.config'

const club = { '@type': 'SportsClub', name: siteConfig.name, url: siteConfig.url }

export const sportsClub = (imageUrl?: string) => ({
  ...club,
  description: siteConfig.description,
  email: siteConfig.email,
  sport: 'Plongée sous-marine',
  foundingDate: '1986',
  logo: `${siteConfig.url}/logo.png`,
  ...(imageUrl ? { image: imageUrl } : {}),
  memberOf: {
    '@type': 'SportsOrganization',
    name: 'Fédération Française d’Études et de Sports Sous-Marins',
    alternateName: 'FFESSM'
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Piscine Léo Lagrange, 1 place Riquet',
    postalCode: '31000',
    addressLocality: siteConfig.city,
    addressCountry: 'FR'
  },
  sameAs: [siteConfig.instagram]
})

export const event = ({
  title,
  description,
  startDate,
  endDate,
  url,
  imageUrl,
  registrationUrl,
  isFull,
  isCancelled
}: {
  title: string
  description: string
  startDate: string
  endDate: string | null
  url: string
  imageUrl?: string
  registrationUrl: string | null
  isFull: boolean
  isCancelled: boolean
}) => ({
  '@type': 'Event',
  name: title,
  description,
  startDate,
  endDate: endDate ?? startDate,
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: isCancelled
    ? 'https://schema.org/EventCancelled'
    : 'https://schema.org/EventScheduled',
  location: { '@type': 'Place', name: title, address: title },
  organizer: club,
  url,
  ...(imageUrl ? { image: imageUrl } : {}),
  ...(registrationUrl
    ? {
        offers: {
          '@type': 'Offer',
          url: registrationUrl,
          availability: isFull ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock'
        }
      }
    : {})
})

export const blogPosting = ({
  title,
  description,
  author,
  publishedAt,
  url,
  imageUrl
}: {
  title: string
  description: string
  author: string | null
  publishedAt: string
  url: string
  imageUrl?: string
}) => ({
  '@type': 'BlogPosting',
  headline: title,
  description,
  datePublished: publishedAt,
  author: author ? { '@type': 'Person', name: author } : club,
  publisher: { '@type': 'Organization', name: siteConfig.name, logo: `${siteConfig.url}/logo.png` },
  mainEntityOfPage: url,
  ...(imageUrl ? { image: imageUrl } : {})
})
