import Markdoc from '@markdoc/markdoc'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { markdocToPortableText, type SanityImage } from './markdocToPortableText.ts'
import { TEAM_2025_2026 } from './team.ts'

const contentDirectory = path.resolve(process.argv[2] ?? '../../palmes_test/src/content')
const outputFile = path.resolve('../migration-output/palmes.ndjson')
const localPhotosDirectory = path.resolve('migrations')

const TRIP_STATUSES: Record<string, string> = {
  'a-confirmer': 'to-confirm',
  confirmee: 'confirmed',
  'inscriptions-ouvertes': 'registration-open',
  complet: 'full',
  annulee: 'cancelled',
  passee: 'confirmed'
}

const TRIPS_INTRO =
  'Plusieurs sorties sont organisées durant l’année. Ce sont généralement des week-ends du vendredi soir au dimanche après-midi, ou de 3 à 4 jours pour les ponts comme la Pentecôte. Des sorties plongée à la journée, avec pique-nique, sont aussi proposées, par exemple au lac de Sède près de Saint-Gaudens. Les inscriptions se font via HelloAsso avec un acompte, le solde étant réglé après la sortie. Le club organise toujours l’hébergement, et les clubs de plongée locaux nous emmènent en bateau. Le covoiturage permet de partager les frais de route.'

const CLUB_SUMMARY =
  'Le club **Les Palmes Aquadémiques** est un club **associatif** de **plongée sous-marine**, affilié à la **FFESSM**. Son fonctionnement repose sur un engagement entièrement bénévole. Le club existe depuis 1986.'

const SWIMMING_TRIAL_SENTENCE =
  ' Il est également possible de découvrir la NEV en essayant les flotteurs spéciaux.'

type Frontmatter = Record<string, unknown>

const readEntry = async (filePath: string) => {
  const source = await readFile(filePath, 'utf8')
  const frontmatterSource = Markdoc.parse(source).attributes.frontmatter ?? ''
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, '')
  return { frontmatter: (parseYaml(frontmatterSource) ?? {}) as Frontmatter, body }
}

const readYaml = async (filePath: string) =>
  parseYaml(await readFile(filePath, 'utf8')) as Frontmatter

const entryFiles = async (collection: string, extension: string) =>
  (await readdir(path.join(contentDirectory, collection)))
    .filter((fileName) => fileName.endsWith(extension))
    .sort()
    .map((fileName) => ({
      slug: path.basename(fileName, extension),
      filePath: path.join(contentDirectory, collection, fileName)
    }))

const imageResolverFor =
  (collection: string) =>
  (source: string, alt = ''): SanityImage => ({
    _type: 'imageWithAlt',
    ...(alt ? { alt } : {}),
    _sanityAsset: `image@file://${path.join(contentDirectory, collection, source)}`
  })

const localPhoto = (fileName: string, alt: string): SanityImage => ({
  _type: 'imageWithAlt',
  alt,
  _sanityAsset: `image@file://${path.join(localPhotosDirectory, fileName)}`
})

const optionalImage = (collection: string, source: unknown, alt = '') =>
  typeof source === 'string' ? imageResolverFor(collection)(source, alt) : undefined

const slugField = (slug: string) => ({ _type: 'slug', current: slug })

const keyed = <Item extends object>(items: Item[], prefix: string) =>
  items.map((item, itemIndex) => ({ ...item, _key: `${prefix}${itemIndex}` }))

const buildTrips = async () =>
  Promise.all(
    (await entryFiles('sorties', '.mdoc')).map(async ({ slug, filePath }) => {
      const { frontmatter, body } = await readEntry(filePath)
      return {
        _id: `trip-${slug}`,
        _type: 'trip',
        title: frontmatter.titre,
        slug: slugField(slug),
        startDate: frontmatter.date,
        endDate: frontmatter.dateFin ?? undefined,
        status: TRIP_STATUSES[String(frontmatter.statut)] ?? 'to-confirm',
        helloAssoUrl: frontmatter.lienInscription ?? undefined,
        coverImage: optionalImage('sorties', frontmatter.couverture),
        body: markdocToPortableText(body, imageResolverFor('sorties'))
      }
    })
  )

const buildPosts = async () =>
  Promise.all(
    (await entryFiles('blog', '.mdoc')).map(async ({ slug, filePath }) => {
      const { frontmatter, body } = await readEntry(filePath)
      return {
        _id: frontmatter.publie ? `post-${slug}` : `drafts.post-${slug}`,
        _type: 'post',
        title: frontmatter.titre,
        slug: slugField(slug),
        publishedAt: frontmatter.datePublication,
        author: frontmatter.auteur || undefined,
        excerpt: frontmatter.description || undefined,
        coverImage: optionalImage('blog', frontmatter.couverture),
        body: markdocToPortableText(body, imageResolverFor('blog'))
      }
    })
  )

const pageImage = imageResolverFor('pages')
const galleryImage = (photoName: string) =>
  imageResolverFor('galerie')(`./${photoName}/${photoName}.webp`)

const buildHomePage = async () => {
  const { frontmatter } = await readEntry(path.join(contentDirectory, 'pages/accueil.mdoc'))

  return {
    _id: 'homePage',
    _type: 'homePage',
    heroTitle: frontmatter.titre,
    heroTagline: frontmatter.accroche,
    heroImage: localPhoto('home-hero.jpg', 'Plongeur dans une grotte sous-marine'),
    introTitle: 'Le club en bref',
    intro: markdocToPortableText(CLUB_SUMMARY, pageImage),
    keyFigures: keyed(
      [
        { value: '1986', label: 'année de création du club' },
        { value: '100 %', label: 'bénévole, de l’encadrement au bureau' },
        { value: 'N1 → N3', label: 'formations plongée au club' },
        { value: '11', label: 'sorties plongée en 2026' }
      ],
      'figure'
    ),
    chapters: keyed(
      [
        {
          kicker: 'Plongée sous-marine',
          title: 'Du baptême au niveau 3',
          text: 'Nos moniteurs bénévoles (MF1, E2, E1) vous forment du niveau 1 au niveau 3 et accompagnent l’entraînement physique des niveaux 4. Pendant l’année de formation, le club prête gratuitement le matériel.',
          image: imageResolverFor('galerie')(
            './photo-18/photo-18.webp',
            'Plongeur faisant le signe OK'
          ),
          linkLabel: 'Découvrir les formations',
          linkUrl: '/les-activites'
        },
        {
          kicker: 'Le mardi soir',
          title: 'Rendez-vous à la piscine Léo Lagrange',
          text: 'De septembre à juin, de 21h à 22h30, avec un rendez-vous à 20h45 sur le parvis. Des baptêmes gratuits sont proposés en septembre et en juin pour découvrir la plongée.',
          image: pageImage('./activites/image-01.webp', 'Nageur sous l’eau à la piscine'),
          linkLabel: 'Venir essayer',
          linkUrl: '/contact'
        },
        {
          kicker: 'Hors de l’eau',
          title: 'Un club de bons vivants',
          text: 'Soirée de rentrée, galette des rois, repas après les plongées… On se retrouve aussi au sec, toujours dans la bonne humeur.',
          image: imageResolverFor('blog')(
            './soiree-de-rentree-2025/couverture.webp',
            'Les membres du club réunis à la soirée de rentrée'
          ),
          linkLabel: 'Lire le blog',
          linkUrl: '/blog'
        }
      ],
      'chapter'
    ).map((chapter) => ({ _type: 'chapter', ...chapter })),
    closingTitle: 'Prêt à vous jeter à l’eau ?',
    closingText:
      'Les nouveaux peuvent faire une séance d’essai avant de s’inscrire. Rendez-vous un mardi soir à 20h45, devant la piscine Léo Lagrange.'
  }
}

type PortableTextBlocks = ReturnType<typeof markdocToPortableText>

const isSectionHeading = (block: PortableTextBlocks[number]) =>
  block._type === 'block' && block.style === 'h2'

const textOfBlock = (block: PortableTextBlocks[number]) =>
  (block.children as { text: string }[]).map((span) => span.text).join('')

const splitByHeading = (blocks: PortableTextBlocks) =>
  blocks.reduce<{ title: string; body: PortableTextBlocks }[]>((sections, block) => {
    if (isSectionHeading(block)) return [...sections, { title: textOfBlock(block), body: [] }]
    if (sections.length === 0) return sections

    const lastSection = sections[sections.length - 1]
    return [...sections.slice(0, -1), { ...lastSection, body: [...lastSection.body, block] }]
  }, [])

const buildActivitiesPage = async () => {
  const { body } = await readEntry(path.join(contentDirectory, 'pages/activites.mdoc'))
  const sections = splitByHeading(
    markdocToPortableText(body.replace(SWIMMING_TRIAL_SENTENCE, ''), pageImage)
  ).filter((section) => !/nage en eau vive/i.test(section.title))

  return {
    _id: 'activitiesPage',
    _type: 'activitiesPage',
    intro:
      'Plongée sous-marine, entraînements en piscine et baptêmes : voici tout ce que propose le club, de septembre à juin.',
    sections: keyed(
      sections.map((section) => {
        const image = section.body.find((block) => block._type === 'image')
        const { _key: imageKey, ...imageFields } = image ?? {}
        return {
          _type: 'activity',
          title: section.title,
          ...(image ? { image: { ...imageFields, _type: 'imageWithAlt' } } : {}),
          body: section.body.filter((block) => block !== image)
        }
      }),
      'activity'
    )
  }
}

const buildGalleryPage = async () => {
  const photos = await Promise.all(
    (await entryFiles('galerie', '.yaml')).map(async ({ slug, filePath }) => {
      const photo = await readYaml(filePath)
      return { ...galleryImage(slug), ...(photo.alt ? { alt: photo.alt } : {}) }
    })
  )

  return {
    _id: 'galleryPage',
    _type: 'galleryPage',
    intro: 'Quelques images de nos plongées et de la vie du club.',
    photos: keyed(photos, 'photo')
  }
}

const buildContactPage = async () => {
  const { frontmatter, body } = await readEntry(path.join(contentDirectory, 'pages/contact.mdoc'))
  const byOrder = (first: Frontmatter, second: Frontmatter) =>
    Number(first.ordre) - Number(second.ordre)

  const faq = (
    await Promise.all((await entryFiles('faq', '.yaml')).map(({ filePath }) => readYaml(filePath)))
  ).sort(byOrder)

  return {
    _id: 'contactPage',
    _type: 'contactPage',
    intro: markdocToPortableText(body, pageImage),
    address: frontmatter.adresse,
    schedule:
      'Le mardi de 21h à 22h30, de septembre à juin, hors vacances scolaires.\nRendez-vous à 20h45, à droite sur le parvis.',
    mapUrl: frontmatter.urlCarte,
    faq: keyed(
      faq.map((entry) => ({ _type: 'question', question: entry.question, answer: entry.reponse })),
      'question'
    )
  }
}

const buildMembers = () =>
  TEAM_2025_2026.map(({ slug, ...member }) => ({
    _id: `member-${slug}`,
    _type: 'member',
    ...member,
    landPhoto: localPhoto(`team-photos/${slug}-terre.jpg`, member.name),
    diverPhoto: localPhoto(`team-photos/${slug}-plongee.jpg`, `${member.name} en plongée`)
  }))

const buildTripsPage = () => ({ _id: 'tripsPage', _type: 'tripsPage', intro: TRIPS_INTRO })

const withoutUndefined = (document: object) =>
  JSON.parse(JSON.stringify(document)) as Record<string, unknown>

const migrate = async () => {
  const documents = [
    ...(await buildTrips()),
    ...(await buildPosts()),
    await buildHomePage(),
    buildTripsPage(),
    await buildActivitiesPage(),
    await buildGalleryPage(),
    await buildContactPage(),
    ...buildMembers()
  ].map(withoutUndefined)

  await mkdir(path.dirname(outputFile), { recursive: true })
  await writeFile(
    outputFile,
    `${documents.map((document) => JSON.stringify(document)).join('\n')}\n`
  )

  console.log(`${documents.length} documents écrits dans ${outputFile}`)
}

await migrate()
