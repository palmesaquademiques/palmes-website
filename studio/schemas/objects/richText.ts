import { defineArrayMember, defineField, defineType } from 'sanity'

export const richText = defineType({
  name: 'richText',
  title: 'Texte',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragraphe', value: 'normal' },
        { title: 'Titre', value: 'h2' },
        { title: 'Sous-titre', value: 'h3' },
        { title: 'Encadré', value: 'blockquote' }
      ],
      lists: [
        { title: 'Liste à puces', value: 'bullet' },
        { title: 'Liste numérotée', value: 'number' }
      ],
      marks: {
        decorators: [
          { title: 'Gras', value: 'strong' },
          { title: 'Italique', value: 'em' }
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            title: 'Lien',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'Adresse',
                type: 'url',
                validation: (rule) =>
                  rule.required().uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] })
              })
            ]
          })
        ]
      }
    }),
    defineArrayMember({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Description de la photo',
          description: 'Lue par les lecteurs d’écran et les moteurs de recherche',
          type: 'string'
        }),
        defineField({ name: 'caption', title: 'Légende', type: 'string' })
      ]
    }),
    defineArrayMember({ type: 'photoGrid' }),
    defineArrayMember({ type: 'helloAsso' }),
    defineArrayMember({ type: 'embed' })
  ]
})
