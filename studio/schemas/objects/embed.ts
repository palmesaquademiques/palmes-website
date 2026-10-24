import { PlayIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const embed = defineType({
  name: 'embed',
  title: 'Contenu intégré',
  description: 'Vidéo, carte, formulaire… collez l’adresse du cadre à intégrer',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'url',
      title: 'Adresse à intégrer',
      description:
        'L’adresse fournie par le bouton « Intégrer » du service (YouTube, OpenStreetMap…)',
      type: 'url',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'title',
      title: 'Titre',
      description: 'Décrit le contenu pour les lecteurs d’écran',
      type: 'string'
    }),
    defineField({
      name: 'format',
      title: 'Format',
      type: 'string',
      options: {
        list: [
          { title: 'Vidéo (16/9)', value: 'video' },
          { title: 'Carte (4/3)', value: 'map' },
          { title: 'Carré', value: 'square' },
          { title: 'Formulaire (haut)', value: 'form' }
        ],
        layout: 'radio'
      },
      initialValue: 'video'
    })
  ],
  preview: {
    select: { title: 'title', url: 'url' },
    prepare: ({ title, url }) => ({ title: title || 'Contenu intégré', subtitle: url })
  }
})
