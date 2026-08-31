import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {colorInput} from '@sanity/color-input'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

const SINGLETON_TYPES = ['verticalDefaults', 'pricingSettings', 'socialProof'] as const

export default defineConfig({
  name: 'default',
  title: 'Bracket Studio',

  projectId: 'rih5ru9l',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool(), colorInput()],

  schema: {
    types: schemaTypes,
    // I singleton si raggiungono dalla struttura, non si creano dal menu
    // "nuovo documento".
    templates: (prev) =>
      prev.filter(
        (template) => !SINGLETON_TYPES.includes(template.schemaType as (typeof SINGLETON_TYPES)[number]),
      ),
  },

  document: {
    // Stessa ragione: niente azione "duplica"/"elimina" su un documento che deve restare unico.
    actions: (prev, {schemaType}) =>
      SINGLETON_TYPES.includes(schemaType as (typeof SINGLETON_TYPES)[number])
        ? prev.filter(({action}) => action !== 'duplicate' && action !== 'delete')
        : prev,
  },
})
