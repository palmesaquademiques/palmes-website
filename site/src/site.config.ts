export const siteConfig = {
  name: 'Les Palmes Aquadémiques',
  description:
    'Club associatif de plongée sous-marine à Toulouse, affilié à la FFESSM depuis 1986.',
  url: 'https://www.lespalmesaquademiques.fr',
  language: 'fr',
  locale: 'fr_FR',
  city: 'Toulouse',
  email: 'contact@lespalmesaquademiques.fr',
  instagram: 'https://instagram.com/palmes.aquademiques'
} as const

export const navigationLinks = [
  { label: 'Le club', href: '/le-club' },
  { label: 'Sorties', href: '/les-sorties' },
  { label: 'Blog', href: '/blog' },
  { label: 'Galerie', href: '/galerie' },
  { label: 'Contact', href: '/contact' }
] as const
