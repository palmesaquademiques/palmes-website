import { UsersIcon } from '@sanity/icons/Users'
import { defineField, defineType } from 'sanity'

export const instructorLevels = [
  { title: 'E1 · Initiateur (piscine)', value: 'E1' },
  { title: 'E2 · Initiateur et guide de palanquée', value: 'E2' },
  { title: 'N4 · Guide de palanquée', value: 'N4' },
  { title: 'MF1 · Moniteur fédéral 1er degré', value: 'MF1' },
  { title: 'MF2 · Moniteur fédéral 2e degré', value: 'MF2' }
]

const isInstructorOnly = (document?: Record<string, unknown>) => document?.team === 'none'

export const member = defineType({
  name: 'member',
  title: 'Membre de l’équipe',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Prénom et nom',
      type: 'string',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'nickname',
      title: 'Surnom',
      description: 'Affiché entre guillemets, par exemple « Doumé »',
      type: 'string'
    }),
    defineField({
      name: 'landPhoto',
      title: 'Photo sur terre',
      description: 'Portrait, visage centré. Elle est affichée dans un médaillon rond',
      type: 'imageWithAlt',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'diverPhoto',
      title: 'Photo en plongée',
      description:
        'Affichée quand on survole le médaillon. Le même cadrage que la photo sur terre est idéal',
      type: 'imageWithAlt'
    }),
    defineField({
      name: 'team',
      title: 'Place dans le club',
      type: 'string',
      options: {
        list: [
          { title: 'Bureau (président, trésorier, secrétaire)', value: 'board' },
          { title: 'Comité directeur', value: 'committee' },
          { title: 'Encadrant uniquement', value: 'none' }
        ],
        layout: 'radio'
      },
      initialValue: 'committee',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'role',
      title: 'Rôle',
      description: 'Par exemple « Trésorier » ou « Responsable matériel »',
      type: 'string',
      hidden: ({ document }) => isInstructorOnly(document)
    }),
    defineField({
      name: 'title',
      title: 'Titre de chevalerie',
      description:
        'Le titre honorifique affiché en doré, par exemple « Grand Argentier des Trésors Engloutis »',
      type: 'string',
      hidden: ({ document }) => isInstructorOnly(document)
    }),
    defineField({
      name: 'instructorLevel',
      title: 'Niveau d’encadrement',
      description: 'À remplir pour les encadrants : ils apparaissent alors dans « Les encadrants »',
      type: 'string',
      options: { list: instructorLevels, layout: 'radio' }
    }),
    defineField({
      name: 'order',
      title: 'Ordre d’affichage',
      description: 'Les plus petits nombres apparaissent en premier',
      type: 'number',
      initialValue: 50
    })
  ],
  orderings: [
    { title: 'Ordre d’affichage', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }
  ],
  preview: {
    select: { title: 'name', role: 'role', level: 'instructorLevel', media: 'landPhoto' },
    prepare: ({ title, role, level, media }) => ({
      title,
      subtitle: [role, level].filter(Boolean).join(' · '),
      media
    })
  }
})
