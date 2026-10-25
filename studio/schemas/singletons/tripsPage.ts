import { CalendarIcon } from '@sanity/icons/Calendar'
import { defineField, defineType } from 'sanity'
import { bannerImageField } from '../objects/bannerImageField'

export const tripsPage = defineType({
  name: 'tripsPage',
  title: 'Page Les Sorties',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    bannerImageField({ fallback: 'la photo de la prochaine sortie' }),
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
