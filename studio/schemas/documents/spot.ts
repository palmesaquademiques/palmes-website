import { PinIcon } from '@sanity/icons/Pin'
import { defineField, defineType } from 'sanity'

const countries = [
  { title: 'France', value: 'france' },
  { title: 'Espagne', value: 'spain' },
  { title: 'Égypte', value: 'egypt' }
]

export const spot = defineType({
  name: 'spot',
  title: 'Spot',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nom du spot',
      description: 'Par exemple « Banyuls-sur-Mer » ou « Îles Medes »',
      type: 'string',
      validation: (rule) => rule.required()
    }),
    defineField({ name: 'town', title: 'Ville', type: 'string' }),
    defineField({
      name: 'country',
      title: 'Pays',
      type: 'string',
      options: { list: countries, layout: 'radio', direction: 'horizontal' }
    }),
    defineField({
      name: 'location',
      title: 'Position sur la carte',
      description:
        'Sur Google Maps, un clic droit sur le lieu affiche ses coordonnées : la première est la latitude, la seconde la longitude',
      type: 'geopoint',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'description',
      title: 'En quelques mots',
      description: 'Ce qui fait le charme du spot, affiché sur la carte des spots',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.max(160)
    }),
    defineField({
      name: 'diveCenter',
      title: 'Club de plongée sur place',
      type: 'object',
      options: { collapsible: true },
      fields: [
        defineField({ name: 'name', title: 'Nom', type: 'string' }),
        defineField({ name: 'address', title: 'Adresse', type: 'text', rows: 2 }),
        defineField({ name: 'website', title: 'Site internet', type: 'url' })
      ]
    })
  ],
  orderings: [{ title: 'Nom', name: 'nameAsc', by: [{ field: 'name', direction: 'asc' }] }],
  preview: {
    select: { title: 'name', town: 'town', diveCenter: 'diveCenter.name' },
    prepare: ({ title, town, diveCenter }) => ({
      title,
      subtitle: [town, diveCenter].filter(Boolean).join(' · ')
    })
  }
})
