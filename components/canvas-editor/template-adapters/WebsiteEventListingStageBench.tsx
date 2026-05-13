'use client'

import { useStore } from '@/store'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  WebsiteEventListing,
  EVENT_LISTING_VARIANT_COLORS,
  type WebsiteEventListingBlockId,
  type EventListingVariant,
} from '../../templates/WebsiteEventListing'
import type { EnumOption } from '../stage-bar/SelectorPrimitive'

/**
 * Stage & Bench adapter for website-event-listing (factory-driven).
 *
 * Track 2 fixed-composition. Editable: eyebrow / headline / subhead +
 * 4 grid-detail rows. Stage bar: 3-swatch variant. Rows 1 and 4 are
 * always visible; rows 2 and 3 toggle via the universal
 * `showGridDetail2` / `showGridDetail3` store flags.
 */

const VARIANTS: EventListingVariant[] = ['orange', 'light', 'dark-gradient']
const VARIANT_OPTIONS: EnumOption[] = VARIANTS.map((v) => ({
  value: v,
  ariaLabel: v.replace(/-/g, ' '),
  swatch: { backgroundColor: EVENT_LISTING_VARIANT_COLORS[v].background },
}))

export const WebsiteEventListingStageBench =
  defineStageBenchAdapter<WebsiteEventListingBlockId>({
    templateId: 'website-event-listing',
    slots: [
      { blockId: 'logo', label: 'Logo', iconKey: 'logo', kind: 'image', benchable: false },
      {
        blockId: 'eyebrow',
        label: 'Eyebrow',
        iconKey: 'eyebrow',
        chipKind: 'eyebrow',
        kind: 'text',
        content: { format: 'plain', singleLine: true, placeholder: 'Eyebrow' },
      },
      {
        blockId: 'headline',
        label: 'Headline',
        iconKey: 'headline',
        kind: 'text',
        content: { format: 'html', placeholder: 'Headline' },
        size: { default: 38, min: 24, max: 60, step: 2 },
      },
      {
        blockId: 'subhead',
        label: 'Subhead',
        iconKey: 'subhead',
        chipKind: 'subheadline',
        kind: 'text',
        content: { format: 'html', placeholder: 'Subheadline' },
      },
      {
        blockId: 'gridDetail1',
        label: 'Row 1',
        iconKey: 'small-caption',
        chipKind: 'small-caption',
        kind: 'text',
        benchable: false,
        content: { format: 'plain', singleLine: true, placeholder: 'Row 1' },
      },
      {
        blockId: 'gridDetail2',
        label: 'Row 2',
        iconKey: 'small-caption',
        chipKind: 'small-caption',
        kind: 'text',
        content: { format: 'plain', singleLine: true, placeholder: 'Row 2' },
      },
      {
        blockId: 'gridDetail3',
        label: 'Row 3',
        iconKey: 'small-caption',
        chipKind: 'small-caption',
        kind: 'text',
        content: { format: 'plain', singleLine: true, placeholder: 'Row 3' },
      },
      {
        blockId: 'gridDetail4',
        label: 'Row 4',
        iconKey: 'small-caption',
        chipKind: 'small-caption',
        kind: 'text',
        benchable: false,
        content: { format: 'plain', singleLine: true, placeholder: 'Row 4' },
      },
    ],
    stageBar: [
      { id: 'variant', kind: 'enum', label: 'variant', options: VARIANT_OPTIONS },
      { id: 'stackAlign', kind: 'stack', label: 'content stack' },
    ],
    contentStack: { templateKey: 'website-event-listing', maxGap: 96 },
    useStoreBindings: () => {
      const eyebrow = useStore((s) => s.eyebrow)
      const setEyebrow = useStore((s) => s.setEyebrow)
      const verbatimCopy = useStore((s) => s.verbatimCopy)
      const setVerbatimCopy = useStore((s) => s.setVerbatimCopy)

      const showEyebrow = useStore((s) => s.showEyebrow)
      const setShowEyebrow = useStore((s) => s.setShowEyebrow)
      const showHeadline = useStore((s) => s.showHeadline)
      const showSubhead = useStore((s) => s.showSubhead)
      const setShowSubhead = useStore((s) => s.setShowSubhead)
      const showGridDetail2 = useStore((s) => s.showGridDetail2)
      const setShowGridDetail2 = useStore((s) => s.setShowGridDetail2)
      const showGridDetail3 = useStore((s) => s.showGridDetail3)
      const setShowGridDetail3 = useStore((s) => s.setShowGridDetail3)

      const variant = useStore((s) => s.eventListingVariant)
      const setVariant = useStore((s) => s.setEventListingVariant)

      const gridDetail1Text = useStore((s) => s.gridDetail1Text)
      const setGridDetail1Text = useStore((s) => s.setGridDetail1Text)
      const gridDetail2Text = useStore((s) => s.gridDetail2Text)
      const setGridDetail2Text = useStore((s) => s.setGridDetail2Text)
      const gridDetail3Text = useStore((s) => s.gridDetail3Text)
      const setGridDetail3Text = useStore((s) => s.setGridDetail3Text)
      const gridDetail4Text = useStore((s) => s.gridDetail4Text)
      const setGridDetail4Text = useStore((s) => s.setGridDetail4Text)

      const headlineFontSize = useStore((s) => s.headlineFontSize)
      const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)

      const stackAlign = useStore((s) => s.stackAlign)
      const setStackAlign = useStore((s) => s.setStackAlign)
      const gaps = useStore((s) => s.templateGaps['website-event-listing'] ?? {})
      const setTemplateGap = useStore((s) => s.setTemplateGap)

      return {
        slotState: {
          logo: {},
          eyebrow: {
            value: eyebrow,
            visible: showEyebrow,
            setValue: setEyebrow,
            setVisible: setShowEyebrow,
          },
          headline: {
            value: verbatimCopy.headline || '',
            visible: showHeadline,
            fontSize: headlineFontSize ?? undefined,
            setValue: (v) => setVerbatimCopy({ headline: v }),
            setFontSize: setHeadlineFontSize,
          },
          subhead: {
            value: verbatimCopy.subhead || '',
            visible: showSubhead,
            setValue: (v) => setVerbatimCopy({ subhead: v }),
            setVisible: setShowSubhead,
          },
          gridDetail1: {
            value: gridDetail1Text,
            setValue: setGridDetail1Text,
          },
          gridDetail2: {
            value: gridDetail2Text,
            visible: showGridDetail2,
            setValue: setGridDetail2Text,
            setVisible: setShowGridDetail2,
          },
          gridDetail3: {
            value: gridDetail3Text,
            visible: showGridDetail3,
            setValue: setGridDetail3Text,
            setVisible: setShowGridDetail3,
          },
          gridDetail4: {
            value: gridDetail4Text,
            setValue: setGridDetail4Text,
          },
        },
        stageBar: {
          variant: { value: variant, set: (v) => setVariant(v as EventListingVariant) },
          stackAlign: { value: stackAlign, set: setStackAlign as (v: unknown) => void },
        },
        contentStack: {
          stackAlign,
          setStackAlign,
          gaps,
          setGap: (key, value) => setTemplateGap('website-event-listing', key, value),
        },
        extras: { variant },
      }
    },
    renderTemplate: (ctx) => {
      const variant = ctx.extras.variant as EventListingVariant
      return (
        <WebsiteEventListing
          eyebrow={ctx.textOf('eyebrow')}
          headline={ctx.textOf('headline')}
          subhead={ctx.textOf('subhead')}
          variant={variant}
          gridDetail1Text={ctx.textOf('gridDetail1')}
          gridDetail2Text={ctx.textOf('gridDetail2')}
          gridDetail3Text={ctx.textOf('gridDetail3')}
          gridDetail4Text={ctx.textOf('gridDetail4')}
          showGridDetail2={ctx.visibilityOf('gridDetail2')}
          showGridDetail3={ctx.visibilityOf('gridDetail3')}
          showEyebrow={ctx.visibilityOf('eyebrow')}
          showHeadline={ctx.rawVisibilityOf('headline')}
          showSubhead={ctx.visibilityOf('subhead')}
          headlineFontSize={ctx.fontSizeOf('headline')}
          stackAlign={ctx.stackAlign}
          gaps={ctx.gaps}
          renderBlock={ctx.renderBlock}
          renderInlineEditor={ctx.renderInlineEditor}
          renderOverlay={ctx.renderOverlay}
          renderSpacerBetween={ctx.renderSpacerBetween}
          colors={ctx.colors}
          typography={ctx.typography}
          scale={ctx.scale}
        />
      )
    },
  })
