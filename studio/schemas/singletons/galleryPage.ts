import { ImagesIcon } from '@sanity/icons/Images'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { bannerImageField } from '../objects/bannerImageField'

export const galleryPage = defineType({
  name: 'galleryPage',
  title: 'Page Galerie',
  type: 'document',
  icon: ImagesIcon,
  fields: [
    bannerImageField({ fallback: 'la première photo de la galerie' }),
    defineField({ name: 'intro', title: 'Introduction', type: 'text', rows: 2 }),
    defineField({
      name: 'photos',
      title: 'Photos',
      description: 'Glissez-déposez plusieurs photos d’un coup, puis réordonnez-les à la souris',
      type: 'array',
      options: { layout: 'grid' },
      of: [defineArrayMember({ type: 'imageWithAlt' })]
    })
  ],
  preview: { prepare: () => ({ title: 'Page Galerie' }) }
})
