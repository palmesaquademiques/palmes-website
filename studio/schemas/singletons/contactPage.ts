import { EnvelopeIcon } from '@sanity/icons/Envelope'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { bannerImageField } from '../objects/bannerImageField'

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Page Contact',
  type: 'document',
  icon: EnvelopeIcon,
  groups: [
    { name: 'infos', title: 'Informations', default: true },
    { name: 'faq', title: 'Questions fréquentes' }
  ],
  fields: [
    bannerImageField({ fallback: 'pas de photo', group: 'infos' }),
    defineField({
      name: 'address',
      title: 'Adresse de la piscine',
      type: 'text',
      rows: 2,
      group: 'infos'
    }),
    defineField({
      name: 'schedule',
      title: 'Horaires',
      description: 'Par exemple « Le mardi de 21h à 22h30, rendez-vous à 20h45 »',
      type: 'text',
      rows: 2,
      group: 'infos'
    }),
    defineField({
      name: 'location',
      title: 'Position sur la carte',
      description:
        'Là où la palme est plantée. Sur Google Maps, un clic droit sur le lieu affiche ses coordonnées : la première est la latitude, la seconde la longitude',
      type: 'geopoint',
      group: 'infos'
    }),
    defineField({
      name: 'faq',
      title: 'Questions fréquentes',
      type: 'array',
      group: 'faq',
      of: [
        defineArrayMember({
          name: 'question',
          type: 'object',
          fields: [
            defineField({
              name: 'category',
              title: 'Rubrique',
              description:
                'Les questions d’une même rubrique sont regroupées, par exemple « 📍 Pratique »',
              type: 'string'
            }),
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (rule) => rule.required()
            }),
            defineField({ name: 'answer', title: 'Réponse', type: 'richText' })
          ],
          preview: { select: { title: 'question', subtitle: 'category' } }
        })
      ]
    })
  ],
  preview: { prepare: () => ({ title: 'Page Contact' }) }
})
