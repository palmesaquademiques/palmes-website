import { HeartIcon } from '@sanity/icons/Heart'
import { defineField, defineType } from 'sanity'

export const helloAsso = defineType({
  name: 'helloAsso',
  title: 'Formulaire HelloAsso',
  description: 'Billetterie, adhésion ou don, affiché directement dans la page',
  type: 'object',
  icon: HeartIcon,
  fields: [
    defineField({
      name: 'url',
      title: 'Adresse de la page HelloAsso',
      description:
        'Copiez l’adresse de la billetterie ou de l’adhésion depuis HelloAsso, par exemple https://www.helloasso.com/associations/les-palmes-aquademiques/evenements/…',
      type: 'url',
      validation: (rule) =>
        rule
          .required()
          .custom((url) =>
            !url || url.includes('helloasso.com') ? true : 'L’adresse doit venir de helloasso.com'
          )
    }),
    defineField({
      name: 'title',
      title: 'Intitulé',
      description: 'Affiché au-dessus du formulaire, par exemple « Inscription à la sortie »',
      type: 'string'
    })
  ],
  preview: {
    select: { title: 'title', url: 'url' },
    prepare: ({ title, url }) => ({ title: title || 'Formulaire HelloAsso', subtitle: url })
  }
})
