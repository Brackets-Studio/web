import {defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'

/**
 * Impostazioni condivise da tutte le landing verticali — singleton.
 *
 * Nasce da un problema misurato: "Ristoranti" e "B&B" avevano prezzo, obiezioni,
 * label delle CTA e testo "chi sono" IDENTICI a parte una parola. Con sette
 * verticali in programma, ogni ritocco al prezzo sarebbero sette documenti da
 * modificare a mano — e prima o poi due divergono senza che nessuno se ne accorga.
 *
 * Regola: qui sta ciò che vale per TUTTE le verticali. Sul singolo documento
 * `vertical` gli stessi campi restano, ma come override: se sono vuoti si usa
 * quanto scritto qui. Il merge avviene nella query GROQ, campo per campo per il
 * prezzo (sovrascrivere solo l'importo non deve azzerare le voci incluse).
 *
 * Non è un documento traducibile: le verticali sono IT-only per scelta.
 */
export const verticalDefaults = defineType({
  name: 'verticalDefaults',
  title: 'Impostazioni verticali',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'contact', title: 'Contatto', default: true},
    {name: 'content', title: 'Contenuto condiviso'},
    {name: 'labels', title: 'Etichette'},
  ],
  fields: [
    defineField({
      name: 'contact',
      title: 'CTA e contatto',
      type: 'object',
      group: 'contact',
      fields: [
        defineField({name: 'ctaLabel', title: 'Testo CTA chiamata', type: 'string'}),
        defineField({name: 'ctaWhatsappLabel', title: 'Testo CTA WhatsApp', type: 'string'}),
        defineField({
          name: 'callbackTitle',
          title: 'Titolo modulo "ti richiamo io"',
          type: 'string',
          description: 'Es. "Preferisci che ti chiami io?"',
        }),
        defineField({
          name: 'callbackText',
          title: 'Testo modulo "ti richiamo io"',
          type: 'text',
          rows: 2,
        }),
      ],
    }),
    defineField({
      name: 'trust',
      title: 'Striscia di fiducia',
      description:
        'Tre affermazioni brevi sotto l\'hero — le paure che si tolgono di mezzo subito (es. "Il sito è tuo", "Rispondo entro un\'ora"). Massimo quattro: oltre non le legge nessuno.',
      type: 'object',
      group: 'content',
      fields: [
        defineField({
          name: 'items',
          title: 'Voci',
          type: 'array',
          validation: (Rule) => Rule.max(4),
          of: [
            {
              type: 'object',
              name: 'trustItem',
              fields: [
                defineField({name: 'title', title: 'Titolo', type: 'string'}),
                defineField({name: 'text', title: 'Testo', type: 'string'}),
              ],
              preview: {select: {title: 'title', subtitle: 'text'}},
            },
          ],
        }),
      ],
    }),
    defineField({
      name: 'price',
      title: 'Prezzo (predefinito)',
      description: 'Vale per ogni verticale che non ne definisce uno proprio.',
      type: 'verticalPrice',
      group: 'content',
    }),
    defineField({
      name: 'objections',
      title: 'Obiezioni (predefinite)',
      type: 'verticalObjections',
      group: 'content',
    }),
    defineField({
      name: 'about',
      title: '"Chi sono" (predefinito)',
      type: 'object',
      group: 'content',
      fields: [defineField({name: 'text', title: 'Testo', type: 'text', rows: 3})],
    }),
    defineField({
      name: 'closingCta',
      title: 'CTA finale (predefinita)',
      type: 'object',
      group: 'content',
      fields: [
        defineField({name: 'title', title: 'Titolo', type: 'string'}),
        defineField({name: 'text', title: 'Testo', type: 'text', rows: 2}),
      ],
    }),
    defineField({
      name: 'sectionLabels',
      title: 'Etichette delle sezioni',
      description:
        'Le intestazioni ricorrenti della pagina. Stavano scritte nel codice: qui si cambiano senza un deploy.',
      type: 'object',
      group: 'labels',
      fields: [
        defineField({name: 'proof', title: 'Sezione prova', type: 'string'}),
        defineField({name: 'benefits', title: 'Sezione benefici', type: 'string'}),
        defineField({name: 'process', title: 'Sezione "come funziona"', type: 'string'}),
        defineField({name: 'price', title: 'Sezione prezzo', type: 'string'}),
        defineField({name: 'cases', title: 'Sezione case study', type: 'string'}),
        defineField({name: 'objections', title: 'Sezione obiezioni', type: 'string'}),
        defineField({name: 'about', title: 'Sezione "chi sono"', type: 'string'}),
      ],
    }),
  ],
  preview: {
    select: {trustItems: 'trust.items', objectionItems: 'objections.items'},
    prepare({trustItems, objectionItems}) {
      const trustCount = Array.isArray(trustItems) ? trustItems.length : 0
      const objectionCount = Array.isArray(objectionItems) ? objectionItems.length : 0
      return {
        title: 'Impostazioni verticali',
        subtitle: `${trustCount} voci di fiducia — ${objectionCount} obiezioni predefinite`,
      }
    },
  },
})
