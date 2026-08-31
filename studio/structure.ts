import type {StructureResolver} from 'sanity/structure'
import {CogIcon} from '@sanity/icons/Cog'
import {PinIcon} from '@sanity/icons/Pin'
import {BarChartIcon} from '@sanity/icons/BarChart'
import {UsersIcon} from '@sanity/icons/Users'

const VERTICAL_DEFAULTS_ID = 'verticalDefaults'
const PRICING_SETTINGS_ID = 'pricingSettings'
const SOCIAL_PROOF_ID = 'socialProof'

/**
 * Struttura dello Studio.
 *
 * Le landing verticali hanno una cartella loro per due motivi: sono un
 * sottoinsieme del sito con regole proprie (IT-only, indicizzazione manuale), e
 * la distinzione attive/bozze è quella che si guarda ogni volta — una verticale
 * non pubblicata è invisibile in produzione, e senza questa separazione ci si
 * accorge tardi di averla lasciata spenta.
 *
 * "Impostazioni verticali", "Impostazioni prezzi" e "Loghi" sono
 * singleton: documenti a id fisso, senza lista e senza pulsante di creazione,
 * così non ne può nascere un secondo che silenziosamente non viene letto da
 * nessuno.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenuti')
    .items([
      S.listItem()
        .title('Landing verticali')
        .icon(PinIcon)
        .child(
          S.list()
            .title('Landing verticali')
            .items([
              S.listItem()
                .title('Attive')
                .icon(PinIcon)
                .child(
                  S.documentTypeList('vertical')
                    .title('Attive')
                    .filter('_type == "vertical" && active == true'),
                ),
              S.listItem()
                .title('Bozze')
                .child(
                  S.documentTypeList('vertical')
                    .title('Bozze')
                    .filter('_type == "vertical" && active != true'),
                ),
              S.divider(),
              S.listItem()
                .title('Impostazioni verticali')
                .icon(CogIcon)
                .child(
                  S.document()
                    .schemaType('verticalDefaults')
                    .documentId(VERTICAL_DEFAULTS_ID)
                    .title('Impostazioni verticali'),
                ),
            ]),
        ),
      S.listItem()
        .title('Impostazioni prezzi')
        .icon(BarChartIcon)
        .child(
          S.document()
            .schemaType('pricingSettings')
            .documentId(PRICING_SETTINGS_ID)
            .title('Impostazioni prezzi'),
        ),
      S.listItem()
        .title('Loghi')
        .icon(UsersIcon)
        .child(
          S.document()
            .schemaType('socialProof')
            .documentId(SOCIAL_PROOF_ID)
            .title('Loghi'),
        ),
      S.divider(),
      // Tutto il resto invariato, meno i tipi già collocati sopra.
      ...S.documentTypeListItems().filter(
        (item) =>
          !['vertical', 'verticalDefaults', 'pricingSettings', 'socialProof'].includes(
            item.getId() ?? '',
          ),
      ),
    ])
