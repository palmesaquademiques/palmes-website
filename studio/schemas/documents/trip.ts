import { CalendarIcon } from '@sanity/icons/Calendar'
import { defineField, defineType } from 'sanity'

export const tripStatuses = [
  { title: 'À confirmer', value: 'to-confirm' },
  { title: 'Confirmée', value: 'confirmed' },
  { title: 'Inscriptions ouvertes', value: 'registration-open' },
  { title: 'Complet', value: 'full' },
  { title: 'Annulée', value: 'cancelled' }
]

const statusTitle = (status?: string) =>
  tripStatuses.find((tripStatus) => tripStatus.value === status)?.title ?? ''

const frenchDate = (isoDate?: string) =>
  isoDate ? new Date(isoDate).toLocaleDateString('fr-FR', { dateStyle: 'medium' }) : 'Sans date'

export const trip = defineType({
  name: 'trip',
  title: 'Sortie',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Lieu de la sortie',
      description: 'Par exemple « Banyuls » ou « Croisière 40 ans »',
      type: 'string',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Adresse de la page',
      description: 'Cliquez sur « Generate » pour la créer à partir du titre',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'startDate',
      title: 'Date de début',
      type: 'date',
      options: { dateFormat: 'DD/MM/YYYY' },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'endDate',
      title: 'Date de fin',
      description: 'À remplir si la sortie dure plusieurs jours',
      type: 'date',
      options: { dateFormat: 'DD/MM/YYYY' },
      validation: (rule) => rule.min(rule.valueOfField('startDate'))
    }),
    defineField({
      name: 'status',
      title: 'Statut',
      description:
        'Une fois la date passée, la sortie bascule toute seule dans les sorties passées',
      type: 'string',
      options: { list: tripStatuses, layout: 'radio' },
      initialValue: 'to-confirm',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'helloAssoUrl',
      title: 'Lien d’inscription HelloAsso',
      description:
        'Adresse de la billetterie HelloAsso. Le formulaire d’inscription s’affiche alors en bas de la page de la sortie',
      type: 'url',
      hidden: ({ document }) => document?.status === 'cancelled',
      validation: (rule) =>
        rule.custom((url) =>
          !url || url.includes('helloasso.com') ? true : 'L’adresse doit venir de helloasso.com'
        )
    }),
    defineField({
      name: 'coverImage',
      title: 'Photo de couverture',
      description: 'Affichée en grand en haut de la page et sur l’aperçu quand on partage le lien',
      type: 'imageWithAlt'
    }),
    defineField({
      name: 'summary',
      title: 'Résumé',
      description: 'Une ou deux phrases affichées sur la carte de la sortie',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(220)
    }),
    defineField({ name: 'body', title: 'Présentation de la sortie', type: 'richText' })
  ],
  orderings: [
    {
      title: 'Date de début, plus récentes d’abord',
      name: 'startDateDesc',
      by: [{ field: 'startDate', direction: 'desc' }]
    }
  ],
  preview: {
    select: { title: 'title', startDate: 'startDate', status: 'status', media: 'coverImage' },
    prepare: ({ title, startDate, status, media }) => ({
      title,
      subtitle: `${frenchDate(startDate)} · ${statusTitle(status)}`,
      media
    })
  }
})
