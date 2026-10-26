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
      of: [
        defineArrayMember({
          name: 'galleryPhoto',
          title: 'Photo',
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Description',
              description:
                'Affichée sur la photo et lue par les lecteurs d’écran, par exemple « Mérou à Cala Montjoi »',
              type: 'string'
            }),
            defineField({
              name: 'theme',
              title: 'Thème',
              description: 'Sert aux filtres de la galerie',
              type: 'string',
              options: {
                list: [
                  { title: 'Macro', value: 'macro' },
                  { title: 'Plongeurs', value: 'divers' },
                  { title: 'Grand bleu', value: 'blue' }
                ],
                layout: 'radio',
                direction: 'horizontal'
              }
            }),
            defineField({
              name: 'featured',
              title: 'Mettre en avant',
              description: 'Affichée en grand dans la galerie. Deux ou trois photos suffisent',
              type: 'boolean',
              initialValue: false
            }),
            defineField({
              name: 'photographer',
              title: 'Photographe',
              description: 'Prénom et nom, affichés en crédit « Photo : … »',
              type: 'string'
            })
          ]
        })
      ]
    })
  ],
  preview: { prepare: () => ({ title: 'Page Galerie' }) }
})
