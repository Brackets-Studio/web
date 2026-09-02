import {defineField, defineType} from 'sanity'

/**
 * Il blocco prezzo delle landing verticali.
 *
 * Estratto come tipo condiviso perché vive in due posti con la stessa forma: su
 * `verticalDefaults` come prezzo predefinito, e su ogni `vertical` come override.
 * Se le due definizioni divergessero, il merge nella query GROQ smetterebbe di
 * funzionare in silenzio.
 */
export const verticalPrice = defineType({
  name: 'verticalPrice',
  title: 'Prezzo',
  type: 'object',
  fields: [
    defineField({name: 'title', title: 'Titolo sezione', type: 'string'}),
    defineField({
      name: 'oneTime',
      title: 'Pagamento unico',
      type: 'object',
      fields: [
        defineField({name: 'label', title: 'Etichetta', type: 'string'}),
        defineField({name: 'amount', title: 'Importo', type: 'string'}),
        defineField({
          name: 'includes', 
          title: 'Cosa include', 
          type: 'text',
          rows: 4,
          validation: Rule => Rule.max(300).error('Massimo 300 caratteri')
        }),
        defineField({
          name: 'features',
          title: 'Voci incluse',
          description:
            'Cosa comprende il totale. Senza prezzo per riga: sono incluse, non extra a parte.',
          type: 'array',
          of: [{type: 'string'}],
        }),
      ],
    }),
    defineField({
      name: 'installments',
      title: 'Rateizzato',
      type: 'object',
      fields: [
        defineField({name: 'label', title: 'Etichetta', type: 'string'}),
        defineField({name: 'amount', title: 'Importo', type: 'string'}),
        defineField({name: 'note', title: 'Nota', type: 'text', rows: 2}),
      ],
    }),
  ],
})
