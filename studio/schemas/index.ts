import { post } from './documents/post'
import { trip } from './documents/trip'
import { embed } from './objects/embed'
import { helloAsso } from './objects/helloAsso'
import { imageWithAlt } from './objects/imageWithAlt'
import { photoGrid } from './objects/photoGrid'
import { richText } from './objects/richText'
import { activitiesPage } from './singletons/activitiesPage'
import { contactPage } from './singletons/contactPage'
import { galleryPage } from './singletons/galleryPage'
import { homePage } from './singletons/homePage'
import { tripsPage } from './singletons/tripsPage'

export const singletonTypes = [homePage, tripsPage, activitiesPage, galleryPage, contactPage]

export const schemaTypes = [
  trip,
  post,
  ...singletonTypes,
  richText,
  imageWithAlt,
  photoGrid,
  helloAsso,
  embed
]
