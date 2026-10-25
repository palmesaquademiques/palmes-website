import { UsersIcon } from '@sanity/icons/Users'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { bannerImageField } from '../objects/bannerImageField'

export const clubPage = defineType({
  name: 'clubPage',
  title: 'Page Le club',
  type: 'document',
  icon: UsersIcon,
  groups: [
    { name: 'history', title: 'Histoire', default: true },
    { name: 'activities', title: 'Activités' },
    { name: 'formations', title: 'Formations' },
    { name: 'documents', title: 'Documents' }
  ],
  fields: [
    bannerImageField({ fallback: 'la première photo des activités', group: 'history' }),
    defineField({
      name: 'intro',
      title: 'Introduction',
      type: 'text',
      rows: 3,
      group: 'history'
    }),
    defineField({
      name: 'anniversaryImage',
      title: 'Photo des 40 ans',
      description:
        'Affichée à côté de l’histoire du club. Tant qu’elle est vide, un encadré la remplace',
      type: 'imageWithAlt',
      group: 'history'
    }),
    defineField({
      name: 'history',
      title: 'Notre histoire',
      description: 'Quelques lignes sur l’histoire du club. Si c’est vide, rien ne s’affiche',
      type: 'richText',
      group: 'history'
    }),
    defineField({
      name: 'sections',
      title: 'Activités',
      description: 'Une section par activité : la plongée, la piscine, les baptêmes, le matériel…',
      type: 'array',
      group: 'activities',
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
    }),
    defineField({
      name: 'formationsIntro',
      title: 'Introduction des formations',
      type: 'richText',
      group: 'formations'
    }),
    defineField({
      name: 'formations',
      title: 'Formations du club',
      description: 'Une fiche par niveau préparé au club',
      type: 'array',
      group: 'formations',
      of: [
        defineArrayMember({
          name: 'formation',
          type: 'object',
          fields: [
            defineField({
              name: 'code',
              title: 'Abréviation',
              description: 'Affichée dans la pastille, par exemple « N1 »',
              type: 'string',
              validation: (rule) => rule.required().max(5)
            }),
            defineField({
              name: 'name',
              title: 'Nom',
              description: 'Par exemple « Niveau 1 »',
              type: 'string',
              validation: (rule) => rule.required()
            }),
            defineField({
              name: 'summary',
              title: 'En une phrase',
              description: 'Par exemple « Plonger encadré jusqu’à 20 m »',
              type: 'string'
            }),
            defineField({ name: 'prerequisites', title: 'Prérequis', type: 'text', rows: 2 }),
            defineField({ name: 'details', title: 'Déroulé', type: 'richText' })
          ],
          preview: { select: { title: 'name', subtitle: 'summary' } }
        })
      ]
    }),
    defineField({
      name: 'codepCourses',
      title: 'Formations du Codep 31',
      description:
        'Formations du comité départemental ouvertes aux membres du club. Taper le nom puis Entrée',
      type: 'array',
      group: 'formations',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' }
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
              name: 'kind',
              title: 'Type de document',
              type: 'string',
              options: {
                list: [
                  { title: 'Statuts et règlement', value: 'rules' },
                  { title: 'PV d’assemblée générale', value: 'minutes' }
                ],
                layout: 'radio'
              },
              initialValue: 'minutes',
              validation: (rule) => rule.required()
            }),
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
          preview: {
            select: { title: 'title', kind: 'kind' },
            prepare: ({ title, kind }) => ({
              title,
              subtitle: kind === 'rules' ? 'Statuts et règlement' : 'PV d’assemblée générale'
            })
          }
        })
      ]
    })
  ],
  preview: { prepare: () => ({ title: 'Page Le club' }) }
})
