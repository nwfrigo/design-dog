'use client'

import { useStore } from '@/store'
import { NEUTRAL_FILTERS } from '@/lib/image-filters'
import type { CustomerLibraryVariant } from '@/types'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import type { EnumOption } from '../stage-bar/SelectorPrimitive'
import {
  CustomerLibrary,
  type CustomerLibraryBlockId,
} from '../../templates/CustomerLibrary'

/**
 * Stage & Bench adapter for customer-library (factory-driven).
 *
 * 590×330 QR-code asset card. Editable: headline / eyebrow / body /
 * footerText + QR image. "Powered by Cority" pill and decorative arrow
 * are brand-locked. Stage bar: 3-swatch variant (orange / dark / light).
 *
 * Placeholders kept intentionally custom rather than canonical:
 * "Chemical Library" (headline), "EBOOK" (eyebrow), "Body text"
 * (body), "Lorem ipsum" (footer) — these match the legacy editor and
 * the existing render-route schema defaults.
 */

const QR_PLACEHOLDER = ''

const VARIANT_SWATCHES: Record<CustomerLibraryVariant, string> = {
  orange: '#D35F0B',
  dark: '#060015',
  light: '#FFFFFF',
}

const VARIANT_OPTIONS: EnumOption[] = (
  ['orange', 'dark', 'light'] as const
).map((v) => ({
  value: v,
  ariaLabel: v,
  swatch: { backgroundColor: VARIANT_SWATCHES[v] },
}))

export const CustomerLibraryStageBench =
  defineStageBenchAdapter<CustomerLibraryBlockId>({
    templateId: 'customer-library',
    slots: [
      {
        blockId: 'headline',
        label: 'Headline',
        iconKey: 'headline',
        kind: 'text',
        content: { format: 'html', placeholder: 'Chemical Library' },
        size: { default: 37, min: 20, max: 54, step: 2 },
      },
      {
        blockId: 'eyebrow',
        label: 'Eyebrow',
        iconKey: 'eyebrow',
        chipKind: 'eyebrow',
        kind: 'text',
        content: { format: 'plain', singleLine: true, placeholder: 'EBOOK' },
      },
      {
        blockId: 'body',
        label: 'Body',
        iconKey: 'body',
        kind: 'text',
        content: { format: 'html', placeholder: 'Body text' },
      },
      {
        blockId: 'footerText',
        label: 'Footer',
        iconKey: 'subhead',
        chipKind: 'subheadline',
        kind: 'text',
        content: { format: 'plain', placeholder: 'Lorem ipsum' },
      },
      { blockId: 'qrCode', label: 'QR Code', iconKey: 'image', kind: 'image', benchable: false },
    ],
    stageBar: [
      { id: 'variant', kind: 'enum', label: 'style', options: VARIANT_OPTIONS },
    ],
    image: { blockId: 'qrCode', placeholderSrc: QR_PLACEHOLDER },
    useStoreBindings: () => {
      const eyebrow = useStore((s) => s.eyebrow)
      const setEyebrow = useStore((s) => s.setEyebrow)
      const verbatimCopy = useStore((s) => s.verbatimCopy)
      const setVerbatimCopy = useStore((s) => s.setVerbatimCopy)

      const showHeadline = useStore((s) => s.showHeadline)
      const showEyebrow = useStore((s) => s.showEyebrow)
      const setShowEyebrow = useStore((s) => s.setShowEyebrow)
      const showBody = useStore((s) => s.showBody)
      const setShowBody = useStore((s) => s.setShowBody)
      const showSubhead = useStore((s) => s.showSubhead)
      const setShowSubhead = useStore((s) => s.setShowSubhead)

      const variant = useStore((s) => s.customerLibraryVariant)
      const setVariant = useStore((s) => s.setCustomerLibraryVariant)

      const headlineFontSize = useStore((s) => s.headlineFontSize)
      const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)

      const thumbnailImageUrl = useStore((s) => s.thumbnailImageUrl)
      const setThumbnailImageUrl = useStore((s) => s.setThumbnailImageUrl)
      const thumbnailImageSettings = useStore((s) => s.thumbnailImageSettings)
      const setThumbnailImageSettings = useStore((s) => s.setThumbnailImageSettings)
      const raw = thumbnailImageSettings['customer-library']
      const position = raw?.position ?? { x: 0, y: 0 }
      const zoom = raw?.zoom ?? 1
      const filters = raw?.filters ?? NEUTRAL_FILTERS

      return {
        slotState: {
          headline: {
            value: verbatimCopy.headline || '',
            visible: showHeadline,
            fontSize: headlineFontSize ?? undefined,
            setValue: (v) => setVerbatimCopy({ headline: v }),
            setFontSize: setHeadlineFontSize,
          },
          eyebrow: {
            value: eyebrow,
            visible: showEyebrow,
            setValue: setEyebrow,
            setVisible: setShowEyebrow,
          },
          body: {
            value: verbatimCopy.body || '',
            visible: showBody,
            setValue: (v) => setVerbatimCopy({ body: v }),
            setVisible: setShowBody,
          },
          footerText: {
            value: verbatimCopy.subhead || '',
            visible: showSubhead,
            setValue: (v) => setVerbatimCopy({ subhead: v }),
            setVisible: setShowSubhead,
          },
          qrCode: {},
        },
        stageBar: {
          variant: { value: variant, set: (v) => setVariant(v as CustomerLibraryVariant) },
        },
        image: {
          url: thumbnailImageUrl ?? undefined,
          position,
          zoom,
          filters,
          setUrl: setThumbnailImageUrl,
          setSettings: (next) => setThumbnailImageSettings('customer-library', next),
          frameWidth: 213,
          frameHeight: 213,
        },
        extras: { variant },
      }
    },
    renderTemplate: (ctx) => {
      const variant = ctx.extras.variant as CustomerLibraryVariant
      return (
        <CustomerLibrary
          headline={ctx.textOf('headline')}
          eyebrow={ctx.textOf('eyebrow')}
          body={ctx.textOf('body')}
          footerText={ctx.textOf('footerText')}
          variant={variant}
          qrCodeUrl={ctx.image?.url}
          hasQrCode={!!ctx.image?.url}
          showHeadline={ctx.rawVisibilityOf('headline')}
          showEyebrow={ctx.rawVisibilityOf('eyebrow')}
          showBody={ctx.rawVisibilityOf('body')}
          showFooterText={ctx.rawVisibilityOf('footerText')}
          headlineFontSize={ctx.fontSizeOf('headline')}
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
