import { HeartIcon } from '@sanity/icons/Heart'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const membershipPage = defineType({
  name: 'membershipPage',
  title: 'Page Inscriptions',
  type: 'document',
  icon: HeartIcon,
  groups: [
    { name: 'season', title: 'Saison', default: true },
    { name: 'prices', title: 'Tarifs' },
    { name: 'checklist', title: 'À ne pas oublier' },
    { name: 'form', title: 'Formulaire' }
  ],
  fields: [
    defineField({
      name: 'season',
      title: 'Saison',
      description: 'Par exemple « 2026-2027 ». À changer à chaque rentrée',
      type: 'string',
      group: 'season',
      validation: (rule) => rule.required()
    }),
    defineField({ name: 'intro', title: 'Introduction', type: 'text', rows: 3, group: 'season' }),
    defineField({
      name: 'keyDates',
      title: 'Dates de la rentrée',
      description: 'Reprise de la piscine, soirée de rentrée, assemblée générale…',
      type: 'array',
      group: 'season',
      of: [
        defineArrayMember({
          name: 'keyDate',
          type: 'object',
          fields: [
            defineField({
              name: 'date',
              title: 'Date',
              description: 'Par exemple « Mardi 15 septembre »',
              type: 'string',
              validation: (rule) => rule.required()
            }),
            defineField({
              name: 'title',
              title: 'Événement',
              type: 'string',
              validation: (rule) => rule.required()
            }),
            defineField({ name: 'details', title: 'Détails', type: 'text', rows: 2 }),
            defineField({
              name: 'linkUrl',
              title: 'Lien d’inscription',
              description: 'Facultatif, par exemple la billetterie HelloAsso de l’événement',
              type: 'url'
            })
          ],
          preview: { select: { title: 'title', subtitle: 'date' } }
        })
      ]
    }),
    defineField({
      name: 'prices',
      title: 'Tarifs du club',
      type: 'array',
      group: 'prices',
      of: [
        defineArrayMember({
          name: 'price',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Formule',
              type: 'string',
              validation: (rule) => rule.required()
            }),
            defineField({
              name: 'amount',
              title: 'Prix',
              description: 'Par exemple « 80 € »',
              type: 'string',
              validation: (rule) => rule.required()
            }),
            defineField({ name: 'note', title: 'Précision', type: 'string' })
          ],
          preview: { select: { title: 'label', subtitle: 'amount' } }
        })
      ]
    }),
    defineField({
      name: 'pricesNote',
      title: 'Licence et assurance',
      description: 'Texte affiché sous les tarifs du club',
      type: 'richText',
      group: 'prices'
    }),
    defineField({
      name: 'checklist',
      title: 'À ne pas oublier',
      description: 'Licence, assurance, certificat médical…',
      type: 'array',
      group: 'checklist',
      of: [
        defineArrayMember({
          name: 'checklistItem',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Titre',
              type: 'string',
              validation: (rule) => rule.required()
            }),
            defineField({ name: 'details', title: 'Détails', type: 'richText' })
          ],
          preview: { select: { title: 'title' } }
        })
      ]
    }),
    defineField({
      name: 'goodToKnow',
      title: 'Bon à savoir',
      description: 'Dates limites, informations pour les encadrants…',
      type: 'richText',
      group: 'checklist'
    }),
    defineField({
      name: 'helloAssoUrl',
      title: 'Lien d’adhésion HelloAsso de la saison',
      description:
        'Adresse du formulaire d’adhésion HelloAsso. Il s’affiche en bas de la page, après toutes les informations',
      type: 'url',
      group: 'form',
      validation: (rule) =>
        rule.custom((url) =>
          !url || url.includes('helloasso.com') ? true : 'L’adresse doit venir de helloasso.com'
        )
    })
  ],
  preview: { prepare: () => ({ title: 'Page Inscriptions' }) }
})
