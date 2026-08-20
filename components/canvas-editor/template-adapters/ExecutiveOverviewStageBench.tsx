'use client'

import type { ReactNode } from 'react'
import { useStore } from '@/store'
import { NEUTRAL_FILTERS, type ImageFilters, type ImageSlotSettings } from '@/lib/image-filters'

import {
  defineStageBenchAdapter,
  type SlotDescriptor,
} from '../factory/defineStageBenchAdapter'
import { Page1, Page2 } from '@/components/templates/ExecutiveOverview'
import {
  EXEC_CARD_COUNT,
  EXEC_CHIPS_PER_CARD,
  EXEC_STAT_COUNT,
  EXEC_PLACEHOLDERS as PH,
  EXEC_LOGO_HEIGHT_DEFAULT,
  EXEC_LOGO_HEIGHT_MIN,
  EXEC_LOGO_HEIGHT_MAX,
  type ExecutiveOverviewBlockId,
  type ExecutiveOverviewCard,
  type ExecutiveOverviewStat,
} from '@/components/templates/ExecutiveOverview/constants'
import {
  defaultExecutiveOverviewDocument,
  patchExecDoc,
  updateExecCard,
  updateExecChip,
  updateExecStat,
  type ExecutiveOverviewDocument,
} from '@/lib/executive-overview/document'

/**
 * Stage & Bench adapter for executive-overview — the first MULTI-PAGE S&B
 * template (see STAGE-AND-BENCH.md §10). `pages` drives the page selector; the
 * `slots` resolver returns the active page's slots; `renderTemplate` branches
 * on `ctx.currentPage` to render Page1 or Page2. All content lives in the
 * `executiveOverviewDocument` blob; slot setters patch it immutably.
 *
 * Images (partner logo, hero, contact avatar) are always-on (`benchable:false`)
 * with empty-state placeholders — the substrate has no bench-toggle affordance
 * for `kind:'image'` yet (logged in SUBSTRATE-DEBT). Text slots carry the
 * show/hide toggles via the bench.
 */

type Id = ExecutiveOverviewBlockId

const cardTitleId = (n: number) => `card${n}Title` as Id
const cardBodyId = (n: number) => `card${n}Body` as Id
const cardChipId = (n: number, j: number) => `card${n}Chip${j}` as Id
const statId = (k: number) => `stat${k}` as Id

const textSlot = (
  blockId: Id,
  label: string,
  opts: { benchable?: boolean; parent?: Id; format?: 'html' | 'plain'; singleLine?: boolean; maxLines?: number; placeholder?: string; iconKey?: string } = {},
): SlotDescriptor<Id> => ({
  blockId,
  label,
  iconKey: opts.iconKey ?? 'headline',
  kind: 'text',
  parent: opts.parent,
  benchable: opts.benchable ?? false,
  content: {
    format: opts.format ?? 'plain',
    singleLine: opts.singleLine ?? true,
    maxLines: opts.maxLines,
    placeholder: opts.placeholder ?? '',
  },
})

const imageSlot = (
  blockId: Id,
  label: string,
  opts: { parent?: Id; size?: SlotDescriptor<Id>['size'] } = {},
): SlotDescriptor<Id> => ({
  blockId,
  label,
  iconKey: 'image',
  kind: 'image',
  parent: opts.parent,
  benchable: false,
  size: opts.size,
})

// Feature chip: editable one-line label (inline) + a swappable Lucide icon
// (EditbarChip's Replace button, via IconRegistry).
const chipSlot = (blockId: Id, label: string): SlotDescriptor<Id> => ({
  blockId,
  label,
  iconKey: 'caption',
  kind: 'chip',
  benchable: true,
  content: { format: 'plain', singleLine: true, maxLines: 1, placeholder: PH.chipLabel },
})

const PAGE1_SLOTS: SlotDescriptor<Id>[] = [
  // Drag-resizable: `size` drives the corner handles (ResizeHandles) and, as a
  // side effect, makes this slot open its image editor on double-click rather
  // than on select — it has to stay selected for the handles to show.
  // One scalar (height) with `width: auto` on the <img> keeps the ratio locked.
  imageSlot('partnerLogo', 'Partner logo', {
    size: { default: EXEC_LOGO_HEIGHT_DEFAULT, min: EXEC_LOGO_HEIGHT_MIN, max: EXEC_LOGO_HEIGHT_MAX, step: 1 },
  }),
  textSlot('introHeadline', 'Headline', { singleLine: false, maxLines: 4, placeholder: PH.introHeadline }),
  textSlot('introBody', 'Body', { format: 'html', singleLine: false, iconKey: 'body', placeholder: PH.introBody }),
  textSlot('quote', 'Quote', { benchable: true, singleLine: false, iconKey: 'quote', placeholder: PH.quote }),
  textSlot('quoteAttribution', 'Attribution', { benchable: true, iconKey: 'caption', placeholder: PH.quoteAttribution }),
  imageSlot('heroImage', 'Hero image'),
]

const PAGE2_SLOTS: SlotDescriptor<Id>[] = [
  textSlot('tagline', 'Tagline', { benchable: true, singleLine: false, placeholder: PH.tagline }),
  ...Array.from({ length: EXEC_CARD_COUNT }, (_, i) => i + 1).flatMap((n) => [
    textSlot(cardTitleId(n), `Card ${n} title`, { maxLines: 1, placeholder: PH.cardTitle }),
    textSlot(cardBodyId(n), `Card ${n} body`, { singleLine: false, maxLines: 4, iconKey: 'body', placeholder: PH.cardBody }),
    ...Array.from({ length: EXEC_CHIPS_PER_CARD }, (_, j) => j + 1).map((j) =>
      chipSlot(cardChipId(n, j), `Card ${n} chip ${j}`),
    ),
  ]),
  textSlot('trustedHeader', 'Section header', { benchable: true, placeholder: PH.trustedHeader }),
  textSlot('trustedSubhead', 'Section subhead', { benchable: true, singleLine: false, placeholder: PH.trustedSubhead }),
  ...Array.from({ length: EXEC_STAT_COUNT }, (_, k) => k + 1).map((k) =>
    textSlot(statId(k), `Stat ${k}`, { benchable: true, iconKey: 'caption', placeholder: PH.stat }),
  ),
  textSlot('footerCta', 'Footer message', { placeholder: PH.footerCta }),
  // The footer byline is one unit: the group carries the bench chip + eye
  // toggle (doc.showContact), and the four fields are its children so they
  // stay individually editable but don't each get their own chip. Same
  // pattern as the speaker groups on email-speakers / website-webinar.
  { blockId: 'contact', label: 'Contact', iconKey: 'speaker', chipKind: 'speaker', kind: 'group', benchable: true },
  textSlot('contactName', 'Contact name', { parent: 'contact', iconKey: 'caption', placeholder: PH.contactName }),
  textSlot('contactRole', 'Contact role', { parent: 'contact', iconKey: 'caption', placeholder: PH.contactRole }),
  textSlot('contactEmail', 'Contact email', { parent: 'contact', iconKey: 'caption', placeholder: PH.contactEmail }),
  imageSlot('contactAvatar', 'Contact photo', { parent: 'contact' }),
]

type SlotEntry = {
  value?: string
  visible?: boolean
  icon?: string
  /** SizeRegistry channel. Named for its original font-size use; the registry
   *  itself is kind-agnostic, so the partner logo drives its height through it. */
  fontSize?: number
  setFontSize?: (next: number) => void
  setValue?: (next: string) => void
  setVisible?: (next: boolean) => void
  setIcon?: (next: string) => void
}

export const ExecutiveOverviewStageBench = defineStageBenchAdapter<Id>({
  templateId: 'executive-overview',
  pages: { count: 2, labels: ['Cover', 'Details'] },
  slots: (_bindings, page) => (page === 1 ? PAGE1_SLOTS : PAGE2_SLOTS),
  childImages: [
    { blockId: 'heroImage', placeholderSrc: '', frameWidth: 159, frameHeight: 792 },
    // Replace-only: the cover renders this mark `objectFit: contain` at its
    // intrinsic aspect, so there is no crop to adjust — and its binding
    // deliberately discards position/zoom/filters. Opening straight to the
    // library keeps the modal honest (its crop frame otherwise described a
    // crop that never happened).
    { blockId: 'partnerLogo', placeholderSrc: '', frameWidth: 120, frameHeight: 32, replaceOnly: true },
    { blockId: 'contactAvatar', placeholderSrc: '', frameWidth: 38, frameHeight: 38 },
  ],
  useStoreBindings: () => {
    const docState = useStore((s) => s.executiveOverviewDocument)
    const setDoc = useStore((s) => s.setExecutiveOverviewDocument)
    const doc = docState ?? defaultExecutiveOverviewDocument()

    // Mutations read the FRESHEST doc from the store, not the render-time
    // closure — the image modal fires setUrl() then setSettings() back-to-back,
    // and closing over `doc` would make the second call clobber the first
    // (zustand set is synchronous, so getState() sees the prior update). Reads
    // for rendering still use the render-time `doc` above.
    const getDoc = () => useStore.getState().executiveOverviewDocument ?? defaultExecutiveOverviewDocument()
    const patch = (p: Partial<ExecutiveOverviewDocument>) => setDoc(patchExecDoc(getDoc(), p))

    // Build slotState for EVERY blockId across both pages (Record<Id> requires
    // all keys). The factory only consumes the current page's entries.
    const slotState = {} as Record<Id, SlotEntry>

    // ---- page 1 ----
    slotState.partnerLogo = {
      fontSize: doc.partnerLogoHeight ?? EXEC_LOGO_HEIGHT_DEFAULT,
      setFontSize: (v) => patch({ partnerLogoHeight: v }),
    }
    slotState.heroImage = {}
    slotState.introHeadline = { value: doc.introHeadline, setValue: (v) => patch({ introHeadline: v }) }
    slotState.introBody = { value: doc.introBody, setValue: (v) => patch({ introBody: v }) }
    slotState.quote = { value: doc.quote, visible: doc.showQuote, setValue: (v) => patch({ quote: v }), setVisible: (v) => patch({ showQuote: v }) }
    slotState.quoteAttribution = { value: doc.quoteAttribution, visible: doc.showQuoteAttribution, setValue: (v) => patch({ quoteAttribution: v }), setVisible: (v) => patch({ showQuoteAttribution: v }) }

    // ---- page 2 ----
    slotState.tagline = { value: doc.tagline, visible: doc.showTagline, setValue: (v) => patch({ tagline: v }), setVisible: (v) => patch({ showTagline: v }) }
    doc.cards.forEach((card, i) => {
      const n = i + 1
      slotState[cardTitleId(n)] = { value: card.title, setValue: (v) => setDoc(updateExecCard(getDoc(), i,{ title: v })) }
      slotState[cardBodyId(n)] = { value: card.body, setValue: (v) => setDoc(updateExecCard(getDoc(), i,{ body: v })) }
      card.chips.forEach((chip, j) => {
        slotState[cardChipId(n, j + 1)] = {
          value: chip.label,
          visible: chip.show,
          icon: chip.icon,
          setValue: (v) => setDoc(updateExecChip(getDoc(), i, j,{ label: v })),
          setVisible: (v) => setDoc(updateExecChip(getDoc(), i, j,{ show: v })),
          setIcon: (v) => setDoc(updateExecChip(getDoc(), i, j,{ icon: v })),
        }
      })
    })
    slotState.trustedHeader = { value: doc.trustedHeader, visible: doc.showTrustedHeader, setValue: (v) => patch({ trustedHeader: v }), setVisible: (v) => patch({ showTrustedHeader: v }) }
    slotState.trustedSubhead = { value: doc.trustedSubhead, visible: doc.showTrustedSubhead, setValue: (v) => patch({ trustedSubhead: v }), setVisible: (v) => patch({ showTrustedSubhead: v }) }
    doc.stats.forEach((stat, k) => {
      slotState[statId(k + 1)] = {
        value: stat.label,
        visible: stat.show,
        setValue: (v) => setDoc(updateExecStat(getDoc(), k,{ label: v })),
        setVisible: (v) => setDoc(updateExecStat(getDoc(), k,{ show: v })),
      }
    })
    slotState.footerCta = { value: doc.footerCta, setValue: (v) => patch({ footerCta: v }) }
    slotState.contact = { visible: doc.showContact, setVisible: (v) => patch({ showContact: v }) }
    slotState.contactName = { value: doc.contactName, setValue: (v) => patch({ contactName: v }) }
    slotState.contactRole = { value: doc.contactRole, setValue: (v) => patch({ contactRole: v }) }
    slotState.contactEmail = { value: doc.contactEmail, setValue: (v) => patch({ contactEmail: v }) }
    slotState.contactAvatar = {}

    const imageBinding = (
      url: string | null,
      position: { x: number; y: number },
      zoom: number,
      filters: ImageFilters,
      setUrl: (next: string) => void,
      setSettings: (next: ImageSlotSettings) => void,
    ) => ({ url: url ?? undefined, position, zoom, filters, setUrl, setSettings })

    return {
      slotState,
      childImages: {
        heroImage: imageBinding(
          doc.heroImageUrl,
          doc.heroImagePosition,
          doc.heroImageZoom,
          doc.heroImageFilters,
          (url) => patch({ heroImageUrl: url }),
          // Persist ALL three settings — position, zoom, AND filters — so the
          // modal's color adjustments + presets actually apply (and survive).
          (s) => patch({ heroImagePosition: s.position, heroImageZoom: s.zoom, heroImageFilters: s.filters }),
        ),
        partnerLogo: imageBinding(
          doc.partnerLogoUrl,
          { x: 0, y: 0 },
          1,
          NEUTRAL_FILTERS,
          (url) => patch({ partnerLogoUrl: url }),
          () => {},
        ),
        contactAvatar: imageBinding(
          doc.contactAvatarUrl,
          { x: 0, y: 0 },
          1,
          NEUTRAL_FILTERS,
          (url) => patch({ contactAvatarUrl: url }),
          () => {},
        ),
      },
      extras: { doc },
    }
  },
  renderTemplate: (ctx) => {
    const doc = ctx.extras.doc as ExecutiveOverviewDocument
    const renderBlock = ctx.renderBlock
    const renderInlineEditor = ctx.renderInlineEditor
    const renderOverlay = ctx.renderOverlay

    if (ctx.currentPage === 1) {
      return (
        <Page1
          partnerLogoUrl={doc.partnerLogoUrl}
          partnerLogoHeight={ctx.fontSizeOf('partnerLogo') ?? EXEC_LOGO_HEIGHT_DEFAULT}
          introHeadline={ctx.rawTextOf('introHeadline')}
          introBody={ctx.rawTextOf('introBody')}
          quote={ctx.rawTextOf('quote')}
          quoteAttribution={ctx.rawTextOf('quoteAttribution')}
          heroImageUrl={doc.heroImageUrl}
          heroImagePosition={doc.heroImagePosition}
          heroImageZoom={doc.heroImageZoom}
          heroImageFilters={doc.heroImageFilters}
          grayscale={doc.grayscale}
          showPartnerLogo={doc.showPartnerLogo}
          showQuote={ctx.visibilityOf('quote')}
          showQuoteAttribution={ctx.visibilityOf('quoteAttribution')}
          interactive
          renderBlock={renderBlock}
          renderInlineEditor={renderInlineEditor}
          renderOverlay={renderOverlay}
          typography={ctx.typography}
          scale={ctx.scale}
        />
      )
    }

    const cards: ExecutiveOverviewCard[] = doc.cards.map((card, i) => {
      const n = i + 1
      return {
        title: ctx.rawTextOf(cardTitleId(n)),
        body: ctx.rawTextOf(cardBodyId(n)),
        chips: card.chips.map((chip, j) => ({
          label: ctx.rawTextOf(cardChipId(n, j + 1)),
          icon: chip.icon,
          show: ctx.visibilityOf(cardChipId(n, j + 1)),
        })),
      }
    })
    const stats: ExecutiveOverviewStat[] = doc.stats.map((_stat, k) => ({
      label: ctx.rawTextOf(statId(k + 1)),
      show: ctx.visibilityOf(statId(k + 1)),
    }))

    return (
      <Page2
        tagline={ctx.rawTextOf('tagline')}
        cards={cards}
        trustedHeader={ctx.rawTextOf('trustedHeader')}
        trustedSubhead={ctx.rawTextOf('trustedSubhead')}
        stats={stats}
        footerCta={ctx.rawTextOf('footerCta')}
        contactName={ctx.rawTextOf('contactName')}
        contactRole={ctx.rawTextOf('contactRole')}
        contactEmail={ctx.rawTextOf('contactEmail')}
        contactAvatarUrl={doc.contactAvatarUrl}
        showTagline={ctx.visibilityOf('tagline')}
        showTrustedHeader={ctx.visibilityOf('trustedHeader')}
        showTrustedSubhead={ctx.visibilityOf('trustedSubhead')}
        showContact={ctx.visibilityOf('contact')}
        renderBlock={renderBlock as (id: Id, content: ReactNode) => ReactNode}
        renderInlineEditor={renderInlineEditor as (id: Id, defaultInner: ReactNode) => ReactNode}
        renderOverlay={renderOverlay}
        typography={ctx.typography}
        scale={ctx.scale}
      />
    )
  },
})
