import { EnvelopeIcon } from '@sanity/icons/Envelope'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Page Contact',
  type: 'document',
  icon: EnvelopeIcon,
  groups: [
    { name: 'infos', title: 'Informations', default: true },
    { name: 'membership', title: 'Adhésion' },
    { name: 'faq', title: 'Questions fréquentes' },
    { name: 'team', title: 'Le bureau' }
  ],
  fields: [
    defineField({ name: 'intro', title: 'Texte d’accueil', type: 'richText', group: 'infos' }),
    defineField({
      name: 'address',
      title: 'Adresse de la piscine',
      type: 'text',
      rows: 2,
      group: 'infos'
    }),
    defineField({
      name: 'schedule',
      title: 'Horaires',
      description: 'Par exemple « Le mardi de 21h à 22h30, rendez-vous à 20h45 »',
      type: 'text',
      rows: 2,
      group: 'infos'
    }),
    defineField({
      name: 'mapUrl',
      title: 'Carte OpenStreetMap',
      description: 'Adresse du cadre « Partager › HTML » sur openstreetmap.org',
      type: 'url',
      group: 'infos'
    }),
    defineField({
      name: 'membershipUrl',
      title: 'Lien d’adhésion HelloAsso de la saison',
      description:
        'À mettre à jour à chaque rentrée. Le formulaire d’adhésion s’affiche alors sur la page Contact',
      type: 'url',
      group: 'membership'
    }),
    defineField({
      name: 'membershipText',
      title: 'Texte sur l’adhésion',
      description: 'Tarifs, documents à fournir (certificat médical, licence…)',
      type: 'richText',
      group: 'membership'
    }),
    defineField({
      name: 'faq',
      title: 'Questions fréquentes',
      type: 'array',
      group: 'faq',
      of: [
        defineArrayMember({
          name: 'question',
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (rule) => rule.required()
            }),
            defineField({ name: 'answer', title: 'Réponse', type: 'text', rows: 4 })
          ],
          preview: { select: { title: 'question', subtitle: 'answer' } }
        })
      ]
    }),
    defineField({
      name: 'team',
      title: 'Membres du bureau',
      type: 'array',
      group: 'team',
      of: [
        defineArrayMember({
          name: 'member',
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Prénom',
              type: 'string',
              validation: (rule) => rule.required()
            }),
            defineField({ name: 'role', title: 'Rôle dans le club', type: 'string' }),
            defineField({
              name: 'photo',
              title: 'Photo',
              description: 'Cadrage carré de préférence, elle est affichée en rond',
              type: 'imageWithAlt'
            })
          ],
          preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } }
        })
      ]
    })
  ],
  preview: { prepare: () => ({ title: 'Page Contact' }) }
})
