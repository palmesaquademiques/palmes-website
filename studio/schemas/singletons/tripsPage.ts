import { CalendarIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const tripsPage = defineType({
  name: 'tripsPage',
  title: 'Page Les Sorties',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'intro',
      title: 'Introduction',
      description: 'Texte affiché en haut de la liste des sorties',
      type: 'text',
      rows: 4
    })
  ],
  preview: { prepare: () => ({ title: 'Page Les Sorties' }) }
})
