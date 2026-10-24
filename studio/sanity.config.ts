import { frFRLocale } from '@sanity/locale-fr-fr'
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes, singletonTypes } from './schemas'
import { structure } from './structure'

const singletonNames = new Set<string>(singletonTypes.map((singletonType) => singletonType.name))

const singletonActions = new Set(['publish', 'discardChanges', 'restore'])

export default defineConfig({
  name: 'default',
  title: 'Les Palmes Aquadémiques',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? '',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  plugins: [structureTool({ structure }), visionTool(), frFRLocale()],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter((template) => !singletonNames.has(template.schemaType))
  },
  document: {
    actions: (actions, context) =>
      singletonNames.has(context.schemaType)
        ? actions.filter((action) => action.action && singletonActions.has(action.action))
        : actions
  }
})
