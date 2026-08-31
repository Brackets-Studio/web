import {defineField, defineType} from 'sanity'

/**
 * Le obiezioni delle landing verticali — condiviso tra `verticalDefaults`
 * (le domande che arrivano su ogni nicchia) e `vertical` (l'override per quelle
 * specifiche del settore).
 */
export const verticalObjections = defineType({
  name: 'verticalObjections',
  title: 'Obiezioni',
  type: 'object',
  fields: [
    defineField({name: 'title', title: 'Titolo sezione', type: 'string'}),
    defineField({
      name: 'items',
      title: 'Voci',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'objection',
          fields: [
            defineField({name: 'fear', title: 'Obiezione', type: 'string'}),
            defineField({name: 'answer', title: 'Risposta', type: 'text', rows: 2}),
          ],
          preview: {select: {title: 'fear', subtitle: 'answer'}},
        },
      ],
    }),
  ],
})
