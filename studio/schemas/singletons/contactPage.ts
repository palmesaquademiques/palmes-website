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
    { name: 'documents', title: 'Documents' }
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
      name: 'membershipPost',
      title: 'Article sur les inscriptions',
      description:
        'L’article du blog qui détaille les inscriptions de la saison (tarifs, licence, certificat médical, lien HelloAsso). À changer à chaque rentrée',
      type: 'reference',
      to: [{ type: 'post' }],
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
              name: 'category',
              title: 'Rubrique',
              description:
                'Les questions d’une même rubrique sont regroupées, par exemple « 📍 Pratique »',
              type: 'string'
            }),
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (rule) => rule.required()
            }),
            defineField({ name: 'answer', title: 'Réponse', type: 'richText' })
          ],
          preview: { select: { title: 'question', subtitle: 'category' } }
        })
      ]
    }),
    defineField({
      name: 'documents',
      title: 'Documents du club',
      description:
        'Procès-verbaux d’assemblée générale, statuts… Ils sont téléchargeables par tous',
      type: 'array',
      group: 'documents',
      of: [
        defineArrayMember({
          name: 'clubDocument',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Titre',
              description: 'Par exemple « PV de l’AG, saison 2025-2026 »',
              type: 'string',
              validation: (rule) => rule.required()
            }),
            defineField({
              name: 'file',
              title: 'Fichier',
              type: 'file',
              options: { accept: 'application/pdf' },
              validation: (rule) => rule.required()
            })
          ],
          preview: { select: { title: 'title' } }
        })
      ]
    })
  ],
  preview: { prepare: () => ({ title: 'Page Contact' }) }
})
