import { ImagesIcon } from '@sanity/icons/Images'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const photoGrid = defineType({
  name: 'photoGrid',
  title: 'Mosaïque de photos',
  description: 'Plusieurs photos côte à côte, qui s’agrandissent au clic',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'images',
      title: 'Photos',
      description: 'Glissez-déposez plusieurs photos d’un coup',
      type: 'array',
      options: { layout: 'grid' },
      of: [defineArrayMember({ type: 'imageWithAlt' })],
      validation: (rule) => rule.required().min(1)
    }),
    defineField({ name: 'caption', title: 'Légende de la mosaïque', type: 'string' })
  ],
  preview: {
    select: { images: 'images', caption: 'caption' },
    prepare: ({ images, caption }) => ({
      title: caption || 'Mosaïque de photos',
      subtitle: `${images?.length ?? 0} photo(s)`,
      media: images?.[0]
    })
  }
})
