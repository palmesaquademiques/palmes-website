import { defineField } from 'sanity'

export const bannerImageField = ({ fallback, group }: { fallback: string; group?: string }) =>
  defineField({
    name: 'bannerImage',
    title: 'Photo de bannière',
    description: `Affichée en fondu à droite du titre de la page. Si elle est vide : ${fallback}`,
    type: 'imageWithAlt',
    group
  })
