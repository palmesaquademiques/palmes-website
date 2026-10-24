import Markdoc from '@markdoc/markdoc'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { markdocToPortableText, type SanityImage } from './markdocToPortableText.ts'
import { TEAM_2025_2026 } from './team.ts'

const contentDirectory = path.resolve(process.argv[2] ?? '../../palmes_test/src/content')
const outputFile = path.resolve('../migration-output/palmes.ndjson')
const localPhotosDirectory = path.resolve('migrations')
const documentsDirectory = path.resolve('../migration-output/documents')

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

const MEMBERSHIP_URL =
  'https://www.helloasso.com/associations/les-palmes-aquademiques/adhesions/adhesion-inscription-au-club-des-palmes-aquademiques-2026-2027'

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

const buildPublishedPost = async ({ slug, filePath }: { slug: string; filePath: string }) => {
  const { frontmatter, body } = await readEntry(filePath)
  if (!frontmatter.publie) return []

  return [
    {
      _id: `post-${slug}`,
      _type: 'post',
      title: frontmatter.titre,
      slug: slugField(slug),
      publishedAt: frontmatter.datePublication,
      author: frontmatter.auteur || undefined,
      excerpt: frontmatter.description || undefined,
      coverImage: optionalImage('blog', frontmatter.couverture),
      body: markdocToPortableText(body, imageResolverFor('blog'))
    }
  ]
}

const buildPosts = async () =>
  (await Promise.all((await entryFiles('blog', '.mdoc')).map(buildPublishedPost))).flat()

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
          text: 'De septembre à juin, de 21h à 22h15, avec un rendez-vous à 20h45 sur le parvis. Chaque année, un mardi de juin est consacré aux baptêmes pour découvrir la plongée.',
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

const markdownSections = (markdown: string, headingMarker: string) =>
  markdown
    .split(new RegExp(`^${headingMarker} `, 'm'))
    .slice(1)
    .map((section) => {
      const [heading, ...content] = section.split('\n')
      return { heading: heading.replaceAll('**', '').trim(), content: content.join('\n').trim() }
    })

const buildFaq = (faqMarkdown: string) =>
  markdownSections(faqMarkdown, '###').flatMap(({ heading: category, content }) =>
    markdownSections(content, '####').map(({ heading: question, content: answer }) => ({
      _type: 'question',
      category,
      question,
      answer: markdocToPortableText(answer, pageImage)
    }))
  )

const downloadDriveFile = async (fileId: string, fileName: string) => {
  const response = await fetch(`https://drive.google.com/uc?export=download&id=${fileId}`)
  const content = Buffer.from(await response.arrayBuffer())
  if (!content.subarray(0, 4).equals(Buffer.from('%PDF'))) {
    throw new Error(`Le document Drive ${fileId} n’est pas un PDF téléchargeable`)
  }
  const filePath = path.join(documentsDirectory, fileName)
  await mkdir(documentsDirectory, { recursive: true })
  await writeFile(filePath, content)
  return filePath
}

const buildDocuments = (documentsMarkdown: string) =>
  Promise.all(
    [
      ...documentsMarkdown.matchAll(
        /\[([^\]]+)\]\(https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/[^)]*\)/g
      )
    ].map(async ([, title, fileId]) => ({
      _type: 'clubDocument',
      title,
      file: {
        _type: 'file',
        _sanityAsset: `file@file://${await downloadDriveFile(fileId, `${slugOf(title)}.pdf`)}`
      }
    }))
  )

const slugOf = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const buildContactPage = async () => {
  const { frontmatter, body } = await readEntry(path.join(contentDirectory, 'pages/contact.mdoc'))
  const [introMarkdown, faqAndDocuments = ''] = body.split(/^## FAQ\s*$/m)
  const [faqMarkdown, documentsMarkdown = ''] = faqAndDocuments.split(
    /^## Documents importants\s*$/m
  )

  return {
    _id: 'contactPage',
    _type: 'contactPage',
    intro: markdocToPortableText(introMarkdown, pageImage),
    address: frontmatter.adresse,
    schedule:
      'Le mardi de 21h à 22h15, de septembre à juin, hors vacances scolaires.\nRendez-vous à 20h45, à droite sur le parvis.',
    mapUrl: frontmatter.urlCarte,
    membershipUrl: MEMBERSHIP_URL,
    faq: keyed(buildFaq(faqMarkdown), 'question'),
    documents: keyed(await buildDocuments(documentsMarkdown), 'document')
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
