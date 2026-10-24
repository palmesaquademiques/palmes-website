import type { StructureResolver } from 'sanity/structure'
import { singletonTypes } from './schemas'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenu du site')
    .items([
      S.listItem()
        .title('Sorties')
        .schemaType('trip')
        .child(
          S.documentTypeList('trip')
            .title('Sorties')
            .defaultOrdering([{ field: 'startDate', direction: 'desc' }])
        ),
      S.listItem()
        .title('Blog')
        .schemaType('post')
        .child(
          S.documentTypeList('post')
            .title('Articles')
            .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
        ),
      S.listItem()
        .title('L’équipe')
        .schemaType('member')
        .child(
          S.documentTypeList('member')
            .title('L’équipe')
            .defaultOrdering([{ field: 'order', direction: 'asc' }])
        ),
      S.divider().title('Pages'),
      ...singletonTypes.map((singletonType) =>
        S.listItem()
          .title(singletonType.title ?? singletonType.name)
          .icon(singletonType.icon)
          .child(
            S.document()
              .schemaType(singletonType.name)
              .documentId(singletonType.name)
              .title(singletonType.title ?? singletonType.name)
          )
      )
    ])
