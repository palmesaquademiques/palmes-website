import { DocumentTextIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Article',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Adresse de la page',
      description: 'Cliquez sur « Generate » pour la créer à partir du titre',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'date',
      options: { dateFormat: 'DD/MM/YYYY' },
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (rule) => rule.required()
    }),
    defineField({ name: 'author', title: 'Auteur ou autrice', type: 'string' }),
    defineField({
      name: 'excerpt',
      title: 'Résumé',
      description: 'Affiché dans la liste des articles et sur l’aperçu quand on partage le lien',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(220)
    }),
    defineField({
      name: 'coverImage',
      title: 'Photo de couverture',
      type: 'imageWithAlt'
    }),
    defineField({ name: 'body', title: 'Contenu', type: 'richText' })
  ],
  orderings: [
    {
      title: 'Date de publication, plus récents d’abord',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }]
    }
  ],
  preview: {
    select: { title: 'title', author: 'author', publishedAt: 'publishedAt', media: 'coverImage' },
    prepare: ({ title, author, publishedAt, media }) => ({
      title,
      subtitle: [publishedAt && new Date(publishedAt).toLocaleDateString('fr-FR'), author]
        .filter(Boolean)
        .join(' · '),
      media
    })
  }
})
