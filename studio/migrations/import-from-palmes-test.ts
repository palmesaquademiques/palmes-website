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

const CLUB_DOCUMENTS = [
  { title: 'Statuts de l’association (2026)', fileName: 'statuts-2026.pdf' },
  { title: 'Règlement intérieur (2026)', fileName: 'reglement-interieur-2026.pdf' },
  { title: 'PV de l’AG, saison 2025-2026', fileName: 'pv-ag-2025-2026.pdf' },
  { title: 'PV de l’AG, saison 2024-2025', fileName: 'pv-ag-2024-2025.pdf' },
  { title: 'PV de l’AG, saison 2023-2024', fileName: 'pv-ag-2023-2024.pdf' }
]

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

const localDocument = ({ title, fileName }: { title: string; fileName: string }) => ({
  _type: 'clubDocument',
  title,
  file: {
    _type: 'file',
    _sanityAsset: `file@file://${path.join(localPhotosDirectory, 'documents', fileName)}`
  }
})

const buildContactPage = async () => {
  const { frontmatter, body } = await readEntry(path.join(contentDirectory, 'pages/contact.mdoc'))
  const [introMarkdown, faqAndDocuments = ''] = body.split(/^## FAQ\s*$/m)
  const [faqMarkdown] = faqAndDocuments.split(/^## Documents importants\s*$/m)

  return {
    _id: 'contactPage',
    _type: 'contactPage',
    intro: markdocToPortableText(introMarkdown, pageImage),
    address: frontmatter.adresse,
    schedule:
      'Le mardi de 21h à 22h15, de septembre à juin, hors vacances scolaires.\nRendez-vous à 20h45, à droite sur le parvis.',
    mapUrl: frontmatter.urlCarte,
    faq: keyed(buildFaq(faqMarkdown), 'question'),
    documents: keyed(CLUB_DOCUMENTS.map(localDocument), 'document')
  }
}

const MEMBERSHIP_GOOD_TO_KNOW = `**Vous souhaitez passer un niveau ?** Inscrivez-vous avant le 1er novembre 2026 : les responsables des formations pourront valider vos choix et les formations commencer au plus vite.

**Anciens membres :** inscrivez-vous dès que possible. Sans inscription au 1er janvier 2027, l’accès à la piscine sera refusé pour des raisons d’assurance.

**Encadrants à partir de N4-GP, formateurs, dirigeants, juges, arbitres, entraîneurs et toute personne encadrant des mineurs :** des informations supplémentaires vous seront demandées (nom, prénom, ville, département et pays de naissance) pour la vérification d’honorabilité du ministère des Sports, sans laquelle il n’est pas possible d’encadrer. [Plus d’informations sur le site de la FFESSM](https://ffessm.fr/actualites/saisie-des-nouvelles-licences-et-honorabilite).`

const buildMembershipPage = () => ({
  _id: 'membershipPage',
  _type: 'membershipPage',
  season: '2026-2027',
  intro:
    'Toutes les informations pour rejoindre les Palmes Aquadémiques cette saison. Les nouveaux peuvent faire une séance d’essai avant de s’inscrire.',
  keyDates: keyed(
    [
      {
        date: 'Mardi 15 septembre',
        title: 'Reprise de la piscine',
        details:
          'Rendez-vous à partir de 20h30 à la piscine Léo Lagrange. Les nouveaux peuvent faire une séance d’essai avant de s’inscrire.'
      },
      {
        date: 'Week-end des 3 et 4 octobre',
        title: 'Les 40 ans du club',
        details: 'Venez souffler les bougies !',
        linkUrl:
          'https://www.helloasso.com/associations/les-palmes-aquademiques/evenements/week-end-40-ans-des-palmes'
      },
      {
        date: 'Mardi 20 octobre',
        title: 'Assemblée générale',
        details: 'Assemblée générale de la saison 2025-2026.'
      }
    ].map((keyDate) => ({ _type: 'keyDate', ...keyDate })),
    'date'
  ),
  prices: keyed(
    [
      { label: 'Adhérent', amount: '80 €' },
      { label: 'Membre passager', amount: '50 €', note: 'Conditions spéciales' }
    ].map((price) => ({ _type: 'price', ...price })),
    'price'
  ),
  pricesNote: markdocToPortableText(
    'La **licence** et l’**assurance** FFESSM s’ajoutent à l’adhésion : tous les tarifs sont sur la [grille des tarifs de la FFESSM](https://ffessm.fr/gerer/grille-des-tarifs).',
    pageImage
  ),
  checklist: keyed(
    [
      {
        title: 'La licence FFESSM 2026-2027',
        details:
          'Pensez à prendre la **licence** dans le formulaire. Si vous en avez déjà une, choisissez le tarif « adhésion seule ».'
      },
      {
        title: 'L’assurance',
        details:
          'Pensez à prendre l’**assurance**. Si vous en avez déjà une, cochez la case « J’ai déjà une assurance ». Des questions ? Lisez [notre article sur l’assurance](/blog/comment-choisir-mon-assurance-plongee).'
      },
      {
        title: 'Le certificat médical',
        details:
          'Comme la licence et l’assurance, il est **obligatoire** pour chaque sortie et chaque séance de piscine. Des questions ? Lisez [notre article sur le certificat médical](/blog/certificat-medical).'
      }
    ].map(({ title, details }) => ({
      _type: 'checklistItem',
      title,
      details: markdocToPortableText(details, pageImage)
    })),
    'item'
  ),
  goodToKnow: markdocToPortableText(MEMBERSHIP_GOOD_TO_KNOW, pageImage),
  helloAssoUrl:
    'https://www.helloasso.com/associations/les-palmes-aquademiques/adhesions/adhesion-inscription-au-club-des-palmes-aquademiques-2026-2027'
})

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
    buildMembershipPage(),
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
