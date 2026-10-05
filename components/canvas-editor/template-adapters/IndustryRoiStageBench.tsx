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
  ROI_CUSTOMER_LOGO,
  type IndustryRoiDocument,
} from '@/lib/industry-roi/document'

/**
 * Stage & Bench adapter for industry-roi — the first template with
 * DYNAMIC slot lists. `slots` is the resolver form: it reads the live
 * document from bindings and emits one label/value slot pair per ROI
 * table row and one slot per risk bullet, keyed by the entry's id.
 * Add/remove/reorder are editor-only on-canvas controls rendered by the
 * TEMPLATE (behind `interactive`), calling the document helpers via
 * `listActions` — the substrate just re-resolves slots when arrays change.
 *
 * The two hideable bands are `kind:'group'` slots wrapping the WHOLE
 * section (exec's contact-group pattern) — hover/selection/bench-drag
 * works anywhere on the band; their text fields are parented children.
 *
 * Editable surface is deliberately small (source doc's highlights);
 * everything else renders as brand-locked constants in the template.
 */

type Id = IndustryRoiBlockId

const textSlot = (
  blockId: Id,
  label: string,
  opts: { iconKey?: string; parent?: Id; singleLine?: boolean; html?: boolean; maxLines?: number } = {},
): SlotDescriptor<Id> => ({
  blockId,
  label,
  iconKey: (opts.iconKey ?? 'headline') as SlotDescriptor<Id>['iconKey'],
  kind: 'text',
  parent: opts.parent,
  benchable: false,
  content: {
    format: opts.html ? 'html' : 'plain',
    singleLine: opts.singleLine ?? true,
    maxLines: opts.maxLines,
    placeholder: label,
  },
})

export const IndustryRoiStageBench = defineStageBenchAdapter<Id>({
  templateId: 'industry-roi',
  // Always a 612px PDF — a resolution picker would be meaningless.
  hideExportScale: true,
  slots: (bindings): SlotDescriptor<Id>[] => {
    const doc = (bindings.extras?.doc as IndustryRoiDocument | undefined) ?? defaultIndustryRoiDocument()
    return [
      { blockId: 'heroImage', label: 'Hero image', iconKey: 'image', kind: 'image', benchable: false },
      textSlot('industry', 'Industry', { iconKey: 'headline' }),
      textSlot('heroIntro', 'Hero intro', { html: true, singleLine: false, iconKey: 'body' }),
      ...doc.rows.flatMap((row, i): SlotDescriptor<Id>[] => [
        textSlot(`rowLabel:${row.id}`, `Row ${i + 1} label`, { iconKey: 'caption' }),
        textSlot(`rowValue:${row.id}`, `Row ${i + 1} value`, { iconKey: 'caption' }),
      ]),
      // Whole-band group slots: benchable, carry the section visibility.
      { blockId: 'didYouKnowSection', label: 'Did you know?', iconKey: 'quote', chipKind: 'category', kind: 'group', benchable: true } as SlotDescriptor<Id>,
      textSlot('didYouKnowText', 'Did-you-know text', { parent: 'didYouKnowSection', html: true, singleLine: false, iconKey: 'body' }),
      textSlot('didYouKnowSource', 'Did-you-know source', { parent: 'didYouKnowSection', html: true, singleLine: false, iconKey: 'small-caption' }),
      ...doc.bullets.map((b, i) => textSlot(`bullet:${b.id}`, `Bullet ${i + 1}`, { iconKey: 'caption' })),
      { blockId: 'customerStorySection', label: 'Customer story', iconKey: 'quote', chipKind: 'category', kind: 'group', benchable: true } as SlotDescriptor<Id>,
      {
        blockId: 'customerLogo', label: 'Customer logo', iconKey: 'image', kind: 'image', benchable: false, parent: 'customerStorySection',
        size: { default: ROI_CUSTOMER_LOGO.default, min: ROI_CUSTOMER_LOGO.min, max: ROI_CUSTOMER_LOGO.max, step: 1 },
      },
      textSlot('customerStoryText', 'Case-study text', { parent: 'customerStorySection', html: true, singleLine: false, iconKey: 'quote' }),
      textSlot('customerStoryAttribution', 'Story attribution', { parent: 'customerStorySection', html: true, singleLine: false, iconKey: 'small-caption' }),
    ]
  },
  childImages: [
    { blockId: 'heroImage', placeholderSrc: '', frameWidth: 612, frameHeight: 264 },
    // Replace-only: the logo renders objectFit: contain at intrinsic aspect.
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
    slotState.industry = { value: doc.industry, setValue: (v) => patch({ industry: v }) }
    slotState.heroIntro = { value: doc.heroIntro, setValue: (v) => patch({ heroIntro: v }) }
    for (const row of doc.rows) {
      slotState[`rowLabel:${row.id}`] = { value: row.label, setValue: (v) => setDoc(updateRoiRow(getDoc(), row.id, { label: v })) }
      slotState[`rowValue:${row.id}`] = { value: row.value, setValue: (v) => setDoc(updateRoiRow(getDoc(), row.id, { value: v })) }
    }
    slotState.didYouKnowSection = {
      visible: doc.showDidYouKnow,
      setVisible: (v) => patch({ showDidYouKnow: v }),
    }
    slotState.didYouKnowText = { value: doc.didYouKnowText, setValue: (v) => patch({ didYouKnowText: v }) }
    slotState.didYouKnowSource = { value: doc.didYouKnowSource, setValue: (v) => patch({ didYouKnowSource: v }) }
    for (const b of doc.bullets) {
      slotState[`bullet:${b.id}`] = { value: b.text, setValue: (v) => setDoc(updateRoiBullet(getDoc(), b.id, v)) }
    }
    slotState.customerStorySection = {
      visible: doc.showCustomerStory,
      setVisible: (v) => patch({ showCustomerStory: v }),
    }
    slotState.customerLogo = {
      fontSize: doc.customerLogoHeight,
      setFontSize: (v) => patch({ customerLogoHeight: v ?? ROI_CUSTOMER_LOGO.default }),
    }
    slotState.customerStoryText = { value: doc.customerStoryText, setValue: (v) => patch({ customerStoryText: v }) }
    slotState.customerStoryAttribution = { value: doc.customerStoryAttribution, setValue: (v) => patch({ customerStoryAttribution: v }) }

    return {
      slotState,
      childImages: {
        heroImage: {
          url: doc.heroImageUrl ?? undefined,
          position: doc.heroImagePosition,
          zoom: doc.heroImageZoom,
          filters: doc.heroImageFilters,
          setUrl: (url: string) => patch({ heroImageUrl: url }),
          setSettings: (s: { position: { x: number; y: number }; zoom: number; filters: typeof NEUTRAL_FILTERS }) =>
            patch({ heroImagePosition: s.position, heroImageZoom: s.zoom, heroImageFilters: s.filters }),
        },
        customerLogo: {
          url: doc.customerLogoUrl ?? undefined,
          position: { x: 0, y: 0 },
          zoom: 1,
          filters: NEUTRAL_FILTERS,
          setUrl: (url: string) => patch({ customerLogoUrl: url }),
          setSettings: () => {},
        },
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
