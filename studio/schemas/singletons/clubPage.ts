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
      description: 'Une carte par activité : la piscine, les sorties, les baptêmes, les soirées…',
      type: 'array',
      group: 'activities',
      of: [
        defineArrayMember({
          name: 'activity',
          type: 'object',
          fields: [
            defineField({
              name: 'moment',
              title: 'Quand',
              description:
                'Affiché au-dessus du titre, par exemple « Le mardi soir » ou « En juin »',
              type: 'string'
            }),
            defineField({
              name: 'title',
              title: 'Titre',
              type: 'string',
              validation: (rule) => rule.required()
            }),
            defineField({ name: 'image', title: 'Photo', type: 'imageWithAlt' }),
            defineField({
              name: 'summary',
              title: 'Texte',
              description: 'Deux ou trois phrases',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.max(260)
            }),
            defineField({
              name: 'linkLabel',
              title: 'Texte du lien',
              description: 'Par exemple « Voir les sorties »',
              type: 'string'
            }),
            defineField({
              name: 'linkUrl',
              title: 'Adresse du lien',
              description: 'Une page du site, par exemple « /les-sorties »',
              type: 'string'
            })
          ],
          preview: { select: { title: 'title', subtitle: 'moment', media: 'image' } }
        })
      ]
    }),
    defineField({
      name: 'equipment',
      title: 'Le club vous équipe',
      description:
        'Affiché sous les activités : le matériel prêté par le club et ce qu’il faut avoir soi-même',
      type: 'richText',
      group: 'activities'
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
              name: 'intermediate',
              title: 'Étape intermédiaire',
              description:
                'Une étape entre deux niveaux, comme le PE40 : sa pastille est plus petite sur le parcours',
              type: 'boolean',
              initialValue: false
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
      name: 'codepDomains',
      title: 'Domaines du Codep 31',
      description:
        'Formations du comité départemental ouvertes aux membres du club, une carte par domaine',
      type: 'array',
      group: 'formations',
      of: [
        defineArrayMember({
          name: 'codepDomain',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Domaine',
              description: 'Par exemple « Plongée sous-marine »',
              type: 'string',
              validation: (rule) => rule.required()
            }),
            defineField({
              name: 'courses',
              title: 'Formations',
              description: 'En quelques mots, par exemple « RIFAP, Initiateur, Niveau 4, MF1… »',
              type: 'string'
            }),
            defineField({
              name: 'url',
              title: 'Lien',
              description: 'La page du domaine sur le site du comité',
              type: 'url',
              validation: (rule) => rule.required()
            })
          ],
          preview: { select: { title: 'title', subtitle: 'courses' } }
        })
      ]
    }),
    defineField({
      name: 'codepAgenda',
      title: 'Agenda des formations du Codep',
      description: 'Le bouton de l’encadré Codep. À mettre à jour chaque saison',
      type: 'object',
      group: 'formations',
      fields: [
        defineField({
          name: 'label',
          title: 'Texte du bouton',
          description: 'Par exemple « Agenda des formations 2026-2027 »',
          type: 'string'
        }),
        defineField({ name: 'url', title: 'Lien', type: 'url' })
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
