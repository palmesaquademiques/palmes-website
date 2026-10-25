import { HomeIcon } from '@sanity/icons/Home'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const homePage = defineType({
  name: 'homePage',
  title: 'Accueil',
  type: 'document',
  icon: HomeIcon,
  groups: [
    { name: 'hero', title: 'Grande photo', default: true },
    { name: 'club', title: 'Présentation du club' },
    { name: 'closing', title: 'Fin de page' }
  ],
  fields: [
    defineField({
      name: 'heroTitle',
      title: 'Titre principal',
      type: 'string',
      group: 'hero',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'heroTagline',
      title: 'Accroche',
      description: 'Une phrase sous le titre. Elle sert aussi de description pour Google',
      type: 'text',
      rows: 2,
      group: 'hero'
    }),
    defineField({
      name: 'heroImage',
      title: 'Photo plein écran',
      description:
        'Photo affichée en plein écran à l’arrivée sur le site. Placez le point d’intérêt pour qu’il reste visible sur téléphone',
      type: 'imageWithAlt',
      group: 'hero',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'introTitle',
      title: 'Titre de la présentation',
      type: 'string',
      group: 'club',
      initialValue: 'Le club en bref'
    }),
    defineField({ name: 'intro', title: 'Présentation', type: 'richText', group: 'club' }),
    defineField({
      name: 'keyFigures',
      title: 'Chiffres clés',
      description: 'Jusqu’à 4 chiffres mis en avant, par exemple « 1986 » / « création du club »',
      type: 'array',
      group: 'club',
      validation: (rule) => rule.max(4),
      of: [
        defineArrayMember({
          name: 'keyFigure',
          type: 'object',
          fields: [
            defineField({
              name: 'value',
              title: 'Chiffre',
              type: 'string',
              validation: (rule) => rule.required()
            }),
            defineField({
              name: 'label',
              title: 'Légende',
              type: 'string',
              validation: (rule) => rule.required()
            })
          ],
          preview: { select: { title: 'value', subtitle: 'label' } }
        })
      ]
    }),
    defineField({
      name: 'chapters',
      title: 'Sections de présentation',
      description: 'Elles défilent l’une après l’autre sous la présentation, avant les sorties',
      type: 'array',
      group: 'club',
      of: [
        defineArrayMember({
          name: 'chapter',
          type: 'object',
          fields: [
            defineField({
              name: 'kicker',
              title: 'Surtitre',
              description: 'Petit texte au-dessus du titre, par exemple « Le mardi soir »',
              type: 'string'
            }),
            defineField({
              name: 'title',
              title: 'Titre',
              type: 'string',
              validation: (rule) => rule.required()
            }),
            defineField({ name: 'text', title: 'Texte', type: 'text', rows: 4 }),
            defineField({ name: 'image', title: 'Photo', type: 'imageWithAlt' }),
            defineField({
              name: 'linkLabel',
              title: 'Texte du bouton',
              description: 'Laisser vide pour ne pas afficher de bouton',
              type: 'string'
            }),
            defineField({
              name: 'linkUrl',
              title: 'Lien du bouton',
              description: 'Par exemple /le-club ou une adresse complète',
              type: 'url',
              validation: (rule) => rule.uri({ allowRelative: true })
            })
          ],
          preview: { select: { title: 'title', subtitle: 'kicker', media: 'image' } }
        })
      ]
    }),
    defineField({
      name: 'closingTitle',
      title: 'Titre de fin de page',
      type: 'string',
      group: 'closing'
    }),
    defineField({
      name: 'closingText',
      title: 'Texte de fin de page',
      description: 'Invitation à venir essayer, affichée avec un bouton « Nous rejoindre »',
      type: 'text',
      rows: 3,
      group: 'closing'
    })
  ],
  preview: { prepare: () => ({ title: 'Accueil' }) }
})
