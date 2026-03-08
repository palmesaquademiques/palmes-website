import { siteConfig } from './lib/site-config'

export default siteConfig({
  language: 'fr',
  // the site's root Notion page (required)
  rootNotionPageId: 'aeb33505b6c64184ba2a77cf7d1fbd16',

  // if you want to restrict pages to a single notion workspace (optional)
  // (this should be a Notion ID; see the docs for how to extract this)
  rootNotionSpaceId: 'dc8530a0-66bf-45fc-975c-71930ad1cb32',

  // basic site info (required)
  name: 'Les Palmes Aquadémiques',
  domain: 'www.lespalmesaquademiques.fr',
  author: 'Les Palmes Aquadémiques',

  // open graph metadata (optional)
  description:
    'Club associatif de plongée sous-marine et de nage en eau vive (NEV), affilié à la FFESSM',

  // social usernames (optional)
  facebook: 'palmes.aquademiques',
  instagram: 'palmes.aquademiques',
  email: 'contact@lespalmesaquademiques.fr',

  // default notion icon and cover images for site-wide consistency (optional)
  // page-specific values will override these site-wide defaults
  defaultPageIcon: null,
  defaultPageCover: null,
  defaultPageCoverPosition: 0.5,

  // whether or not to enable support for LQIP preview images (optional)
  isPreviewImageSupportEnabled: true,

  // whether or not redis is enabled for caching generated preview images (optional)
  // NOTE: if you enable redis, you need to set the `REDIS_HOST` and `REDIS_PASSWORD`
  // environment variables. see the readme for more info
  isRedisEnabled: false,

  // map of notion page IDs to URL paths (optional)
  // any pages defined here will override their default URL paths
  // example:
  //
  // pageUrlOverrides: {
  //   '/foo': '067dd719a912471ea9a3ac10710e7fdf',
  //   '/bar': '0be6efce9daf42688f65c76b89f8eb27'
  // }
  pageUrlOverrides: {
    // override urls containing accent
    '/les-activites': 'afd41556c95d456593fe949266dc391d'
  },

  // whether to use the default notion navigation style or a custom one with links to
  // important pages. To use `navigationLinks`, set `navigationStyle` to `custom`.
  // navigationStyle: 'default'
  navigationStyle: 'custom',
  navigationLinks: [
    {
      title: 'Les Sorties',
      pageId: '1013a8ac49fc8030a090f0028bfee874'
    },
    {
      title: 'Les Activités',
      pageId: 'afd41556c95d456593fe949266dc391d'
    },
    {
      title: 'Blog',
      pageId: '70f1ba0639354c2187e2fda28ccaac38'
    },
    {
      title: 'Galerie',
      pageId: '73e5da04ef2845ffbeb7db3d4bb41fa2'
    },
    {
      title: 'Contact',
      pageId: 'a50c7ff573ab4e918a5c0d90cad2db62'
    }
  ],
  isSearchEnabled: false
})
