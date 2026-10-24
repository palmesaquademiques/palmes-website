import { ActivityIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const activitiesPage = defineType({
  name: 'activitiesPage',
  title: 'Page Les Activités',
  type: 'document',
  icon: ActivityIcon,
  fields: [
    defineField({ name: 'intro', title: 'Introduction', type: 'text', rows: 3 }),
    defineField({
      name: 'sections',
      title: 'Sections',
      description: 'Une section par activité : la plongée, la piscine, les baptêmes, la NEV…',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'activity',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Titre',
              type: 'string',
              validation: (rule) => rule.required()
            }),
            defineField({ name: 'image', title: 'Photo', type: 'imageWithAlt' }),
            defineField({ name: 'body', title: 'Texte', type: 'richText' })
          ],
          preview: { select: { title: 'title', media: 'image' } }
        })
      ]
    })
  ],
  preview: { prepare: () => ({ title: 'Page Les Activités' }) }
})
