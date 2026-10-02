'use client'

import { useStore } from '@/store'
import { NEUTRAL_FILTERS } from '@/lib/image-filters'
import {
  defineStageBenchAdapter,
  type SlotDescriptor,
} from '../factory/defineStageBenchAdapter'
import {
  IndustryRoi,
  type IndustryRoiBlockId,
} from '@/components/templates/IndustryRoi'
import {
  defaultIndustryRoiDocument,
  patchRoiDoc,
  updateRoiRow,
  addRoiRow,
  removeRoiRow,
  moveRoiRow,
  updateRoiBullet,
  addRoiBullet,
  removeRoiBullet,
  moveRoiBullet,
  updateRoiCard,
  updateRoiStat,
  ROI_CUSTOMER_LOGO,
  type IndustryRoiDocument,
} from '@/lib/industry-roi/document'

/**
 * Stage & Bench adapter for industry-roi — the first template with
 * DYNAMIC slot lists. `slots` is the resolver form: it reads the live
 * document from bindings and emits one label/value slot pair per ROI
 * table row and one slot per risk bullet, keyed by the entry's id
 * (`rowLabel:<id>` / `rowValue:<id>` / `bullet:<id>`). Add/remove/reorder
 * are editor-only on-canvas controls rendered by the TEMPLATE (behind
 * `interactive`), calling the document helpers through `listActions` —
 * no substrate changes; the substrate just re-resolves slots when the
 * arrays change.
 *
 * Hideable sections ride their carrier text slot: benching/eyeing
 * `didYouKnowText` or `customerStoryText` toggles the whole band (flow
 * layout collapses the height).
 */

type Id = IndustryRoiBlockId

const textSlot = (
  blockId: Id,
  label: string,
  opts: { iconKey?: string; benchable?: boolean; singleLine?: boolean; html?: boolean; maxLines?: number; benchNoteLabel?: string } = {},
): SlotDescriptor<Id> => ({
  blockId,
  label,
  iconKey: (opts.iconKey ?? 'headline') as SlotDescriptor<Id>['iconKey'],
  kind: 'text',
  benchable: opts.benchable ?? false,
  content: {
    format: opts.html ? 'html' : 'plain',
    singleLine: opts.singleLine ?? true,
    maxLines: opts.maxLines,
    placeholder: label,
  },
})

export const IndustryRoiStageBench = defineStageBenchAdapter<Id>({
  templateId: 'industry-roi',
  slots: (bindings) => {
    const doc = (bindings.extras?.doc as IndustryRoiDocument | undefined) ?? defaultIndustryRoiDocument()
    return [
      { blockId: 'heroImage', label: 'Hero image', iconKey: 'image', kind: 'image', benchable: false },
      textSlot('heroTitle', 'Industry title', { html: true, singleLine: false, maxLines: 3 }),
      textSlot('heroIntro', 'Hero intro', { html: true, singleLine: false, iconKey: 'body' }),
      textSlot('tableIntro', 'Table intro', { html: true, singleLine: false, iconKey: 'body' }),
      ...doc.rows.flatMap((row, i): SlotDescriptor<Id>[] => [
        textSlot(`rowLabel:${row.id}`, `Row ${i + 1} label`, { iconKey: 'caption' }),
        textSlot(`rowValue:${row.id}`, `Row ${i + 1} value`, { iconKey: 'caption' }),
      ]),
      textSlot('tableFootnote', 'Footnote', { html: true, singleLine: false, iconKey: 'small-caption' }),
      textSlot('didYouKnowText', 'Did-you-know section', { html: true, singleLine: false, benchable: true, iconKey: 'body' }),
      textSlot('didYouKnowSource', 'Did-you-know source', { html: true, singleLine: false, iconKey: 'small-caption' }),
      textSlot('benefitsHeader', 'Benefits header', { html: true, singleLine: false, iconKey: 'caption' }),
      ...([0, 1, 2] as const).flatMap((i): SlotDescriptor<Id>[] => [
        { blockId: `cardImage:${i}`, label: `Card ${i + 1} image`, iconKey: 'image', kind: 'image', benchable: false },
        textSlot(`cardRole:${i}`, `Card ${i + 1} role`, { iconKey: 'caption' }),
        textSlot(`cardBody:${i}`, `Card ${i + 1} body`, { html: true, singleLine: false, maxLines: 5, iconKey: 'body' }),
      ]),
      textSlot('risksTitle', 'Risks title', { html: true, singleLine: false }),
      ...doc.bullets.map((b, i) => textSlot(`bullet:${b.id}`, `Bullet ${i + 1}`, { iconKey: 'caption' })),
      {
        blockId: 'customerLogo', label: 'Customer logo', iconKey: 'image', kind: 'image', benchable: false,
        size: { default: ROI_CUSTOMER_LOGO.default, min: ROI_CUSTOMER_LOGO.min, max: ROI_CUSTOMER_LOGO.max, step: 1 },
      },
      textSlot('customerStoryText', 'Customer-story section', { html: true, singleLine: false, benchable: true, iconKey: 'quote' }),
      textSlot('customerStoryAttribution', 'Story attribution', { html: true, singleLine: false, iconKey: 'small-caption' }),
      textSlot('roiHeadline', 'ROI headline', { html: true, singleLine: false }),
      textSlot('roiIntro', 'ROI intro', { html: true, singleLine: false, iconKey: 'body' }),
      ...([0, 1, 2, 3] as const).flatMap((i): SlotDescriptor<Id>[] => [
        textSlot(`statValue:${i}`, `Stat ${i + 1} value`, { iconKey: 'caption' }),
        textSlot(`statLabel:${i}`, `Stat ${i + 1} label`, { iconKey: 'small-caption' }),
      ]),
      textSlot('ctaHeadline', 'CTA headline', { html: true, singleLine: false }),
      { blockId: 'cta', label: 'CTA', iconKey: 'cta', kind: 'cta', benchable: false, content: { format: 'plain', singleLine: true, placeholder: 'Explore Cority' } },
    ]
  },
  childImages: [
    { blockId: 'heroImage', placeholderSrc: '', frameWidth: 436, frameHeight: 369 },
    { blockId: 'cardImage:0', placeholderSrc: '', frameWidth: 331, frameHeight: 186 },
    { blockId: 'cardImage:1', placeholderSrc: '', frameWidth: 331, frameHeight: 186 },
    { blockId: 'cardImage:2', placeholderSrc: '', frameWidth: 331, frameHeight: 186 },
    // Replace-only: the logo renders objectFit: contain at intrinsic aspect —
    // no crop to adjust (the exec partner-logo rationale).
    { blockId: 'customerLogo', placeholderSrc: '', frameWidth: 120, frameHeight: 32, replaceOnly: true },
  ],
  useStoreBindings: () => {
    const docState = useStore((s) => s.industryRoiDocument)
    const setDoc = useStore((s) => s.setIndustryRoiDocument)
    const doc = docState ?? defaultIndustryRoiDocument()

    // Mutations read the FRESHEST doc (image modal fires setUrl + setSettings
    // back-to-back; closing over render-time doc would drop the first patch).
    const getDoc = () => useStore.getState().industryRoiDocument ?? defaultIndustryRoiDocument()
    const patch = (p: Partial<IndustryRoiDocument>) => setDoc(patchRoiDoc(getDoc(), p))

    const slotState = {} as Record<Id, { value?: string; visible?: boolean; fontSize?: number; setValue?: (v: string) => void; setVisible?: (v: boolean) => void; setFontSize?: (v: number | null) => void }>

    slotState.heroImage = {}
    slotState.heroTitle = { value: doc.heroTitle, setValue: (v) => patch({ heroTitle: v }) }
    slotState.heroIntro = { value: doc.heroIntro, setValue: (v) => patch({ heroIntro: v }) }
    slotState.tableIntro = { value: doc.tableIntro, setValue: (v) => patch({ tableIntro: v }) }
    for (const row of doc.rows) {
      slotState[`rowLabel:${row.id}`] = { value: row.label, setValue: (v) => setDoc(updateRoiRow(getDoc(), row.id, { label: v })) }
      slotState[`rowValue:${row.id}`] = { value: row.value, setValue: (v) => setDoc(updateRoiRow(getDoc(), row.id, { value: v })) }
    }
    slotState.tableFootnote = { value: doc.tableFootnote, setValue: (v) => patch({ tableFootnote: v }) }
    slotState.didYouKnowText = {
      value: doc.didYouKnowText,
      visible: doc.showDidYouKnow,
      setValue: (v) => patch({ didYouKnowText: v }),
      setVisible: (v) => patch({ showDidYouKnow: v }),
    }
    slotState.didYouKnowSource = { value: doc.didYouKnowSource, setValue: (v) => patch({ didYouKnowSource: v }) }
    slotState.benefitsHeader = { value: doc.benefitsHeader, setValue: (v) => patch({ benefitsHeader: v }) }
    for (const i of [0, 1, 2] as const) {
      slotState[`cardImage:${i}`] = {}
      slotState[`cardRole:${i}`] = { value: doc.cards[i].role, setValue: (v) => setDoc(updateRoiCard(getDoc(), i, { role: v })) }
      slotState[`cardBody:${i}`] = { value: doc.cards[i].body, setValue: (v) => setDoc(updateRoiCard(getDoc(), i, { body: v })) }
    }
    slotState.risksTitle = { value: doc.risksTitle, setValue: (v) => patch({ risksTitle: v }) }
    for (const b of doc.bullets) {
      slotState[`bullet:${b.id}`] = { value: b.text, setValue: (v) => setDoc(updateRoiBullet(getDoc(), b.id, v)) }
    }
    slotState.customerLogo = {
      fontSize: doc.customerLogoHeight,
      setFontSize: (v) => patch({ customerLogoHeight: v ?? ROI_CUSTOMER_LOGO.default }),
    }
    slotState.customerStoryText = {
      value: doc.customerStoryText,
      visible: doc.showCustomerStory,
      setValue: (v) => patch({ customerStoryText: v }),
      setVisible: (v) => patch({ showCustomerStory: v }),
    }
    slotState.customerStoryAttribution = { value: doc.customerStoryAttribution, setValue: (v) => patch({ customerStoryAttribution: v }) }
    slotState.roiHeadline = { value: doc.roiHeadline, setValue: (v) => patch({ roiHeadline: v }) }
    slotState.roiIntro = { value: doc.roiIntro, setValue: (v) => patch({ roiIntro: v }) }
    for (const i of [0, 1, 2, 3] as const) {
      slotState[`statValue:${i}`] = { value: doc.stats[i].value, setValue: (v) => setDoc(updateRoiStat(getDoc(), i, { value: v })) }
      slotState[`statLabel:${i}`] = { value: doc.stats[i].label, setValue: (v) => setDoc(updateRoiStat(getDoc(), i, { label: v })) }
    }
    slotState.ctaHeadline = { value: doc.ctaHeadline, setValue: (v) => patch({ ctaHeadline: v }) }
    slotState.cta = { value: doc.ctaText, setValue: (v) => patch({ ctaText: v }) }

    const imageBinding = (
      url: string | null,
      position: { x: number; y: number },
      zoom: number,
      filters: typeof NEUTRAL_FILTERS,
      setUrl: (next: string) => void,
      setSettings: (next: { position: { x: number; y: number }; zoom: number; filters: typeof NEUTRAL_FILTERS }) => void,
    ) => ({ url: url ?? undefined, position, zoom, filters, setUrl, setSettings })

    return {
      slotState,
      childImages: {
        heroImage: imageBinding(
          doc.heroImageUrl, doc.heroImagePosition, doc.heroImageZoom, doc.heroImageFilters,
          (url) => patch({ heroImageUrl: url }),
          (s) => patch({ heroImagePosition: s.position, heroImageZoom: s.zoom, heroImageFilters: s.filters }),
        ),
        'cardImage:0': imageBinding(
          doc.cards[0].imageUrl, doc.cards[0].imagePosition, doc.cards[0].imageZoom, doc.cards[0].imageFilters,
          (url) => setDoc(updateRoiCard(getDoc(), 0, { imageUrl: url })),
          (s) => setDoc(updateRoiCard(getDoc(), 0, { imagePosition: s.position, imageZoom: s.zoom, imageFilters: s.filters })),
        ),
        'cardImage:1': imageBinding(
          doc.cards[1].imageUrl, doc.cards[1].imagePosition, doc.cards[1].imageZoom, doc.cards[1].imageFilters,
          (url) => setDoc(updateRoiCard(getDoc(), 1, { imageUrl: url })),
          (s) => setDoc(updateRoiCard(getDoc(), 1, { imagePosition: s.position, imageZoom: s.zoom, imageFilters: s.filters })),
        ),
        'cardImage:2': imageBinding(
          doc.cards[2].imageUrl, doc.cards[2].imagePosition, doc.cards[2].imageZoom, doc.cards[2].imageFilters,
          (url) => setDoc(updateRoiCard(getDoc(), 2, { imageUrl: url })),
          (s) => setDoc(updateRoiCard(getDoc(), 2, { imagePosition: s.position, imageZoom: s.zoom, imageFilters: s.filters })),
        ),
        customerLogo: imageBinding(
          doc.customerLogoUrl, { x: 0, y: 0 }, 1, NEUTRAL_FILTERS,
          (url) => patch({ customerLogoUrl: url }),
          () => {},
        ),
      },
      extras: { doc },
    }
  },
  renderTemplate: (ctx) => {
    const doc = ctx.extras.doc as IndustryRoiDocument
    const setDoc = useStore.getState().setIndustryRoiDocument
    const getDoc = () => useStore.getState().industryRoiDocument ?? defaultIndustryRoiDocument()
    return (
      <IndustryRoi
        doc={doc}
        listActions={{
          onAddRow: () => setDoc(addRoiRow(getDoc())),
          onRemoveRow: (id) => setDoc(removeRoiRow(getDoc(), id)),
          onMoveRow: (id, dir) => setDoc(moveRoiRow(getDoc(), id, dir)),
          onAddBullet: () => setDoc(addRoiBullet(getDoc())),
          onRemoveBullet: (id) => setDoc(removeRoiBullet(getDoc(), id)),
          onMoveBullet: (id, dir) => setDoc(moveRoiBullet(getDoc(), id, dir)),
        }}
        renderBlock={ctx.renderBlock}
        renderInlineEditor={ctx.renderInlineEditor}
        renderOverlay={ctx.renderOverlay}
        colors={ctx.colors}
        typography={ctx.typography}
        scale={ctx.scale}
      />
    )
  },
})
