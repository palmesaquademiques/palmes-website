import { defineField, defineType } from 'sanity'

export const imageWithAlt = defineType({
  name: 'imageWithAlt',
  title: 'Photo',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Description de la photo',
      description: 'Lue par les lecteurs d’écran et les moteurs de recherche',
      type: 'string'
    })
  ]
})
