import { member } from './documents/member'
import { post } from './documents/post'
import { spot } from './documents/spot'
import { trip } from './documents/trip'
import { embed } from './objects/embed'
import { helloAsso } from './objects/helloAsso'
import { imageWithAlt } from './objects/imageWithAlt'
import { photoGrid } from './objects/photoGrid'
import { richText } from './objects/richText'
import { clubPage } from './singletons/clubPage'
import { contactPage } from './singletons/contactPage'
import { galleryPage } from './singletons/galleryPage'
import { homePage } from './singletons/homePage'
import { membershipPage } from './singletons/membershipPage'
import { tripsPage } from './singletons/tripsPage'

export const singletonTypes = [
  homePage,
  tripsPage,
  clubPage,
  galleryPage,
  contactPage,
  membershipPage
]

export const schemaTypes = [
  trip,
  spot,
  post,
  member,
  ...singletonTypes,
  richText,
  imageWithAlt,
  photoGrid,
  helloAsso,
  embed
]
