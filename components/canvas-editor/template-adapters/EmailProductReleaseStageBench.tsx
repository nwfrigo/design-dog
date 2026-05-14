'use client'

import { SLOT_PLACEHOLDERS } from '@/lib/slot-placeholders'

import { useStore } from '@/store'
import { NEUTRAL_FILTERS } from '@/lib/image-filters'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  EmailProductRelease,
  type EmailProductReleaseBlockId,
} from '../../templates/EmailProductRelease'

/**
 * Stage & Bench adapter for email-product-release (factory-driven).
 *
 * Track 2. 640×184 email release. Editable: eyebrow / headline + image
 * crop. Logo is brand-locked. No stage-bar controls.
 */

const IMAGE_PLACEHOLDER = '/assets/images/default_placeholder_image_1.png'

export const EmailProductReleaseStageBench =
  defineStageBenchAdapter<EmailProductReleaseBlockId>({
    templateId: 'email-product-release',
    slots: [
      { blockId: 'logo', label: 'Logo', iconKey: 'logo', kind: 'image', benchable: false },
      {
        blockId: 'eyebrow',
        label: 'Eyebrow',
        iconKey: 'eyebrow',
        chipKind: 'eyebrow',
        kind: 'text',
        benchable: false,
        content: { format: 'plain', singleLine: true, placeholder: 'Product Release' },
      },
      {
        blockId: 'headline',
        label: 'Headline',
        iconKey: 'headline',
        kind: 'text',
        benchable: false,
        content: { format: 'html', placeholder: SLOT_PLACEHOLDERS.headline },
      },
      { blockId: 'image', label: 'Image', iconKey: 'image', kind: 'image', benchable: false },
    ],
    image: { blockId: 'image', placeholderSrc: IMAGE_PLACEHOLDER },
    useStoreBindings: () => {
      const eyebrow = useStore((s) => s.eyebrow)
      const setEyebrow = useStore((s) => s.setEyebrow)
      const verbatimCopy = useStore((s) => s.verbatimCopy)
      const setVerbatimCopy = useStore((s) => s.setVerbatimCopy)

      const grayscale = useStore((s) => s.grayscale)

      const thumbnailImageUrl = useStore((s) => s.thumbnailImageUrl)
      const setThumbnailImageUrl = useStore((s) => s.setThumbnailImageUrl)
      const thumbnailImageSettings = useStore((s) => s.thumbnailImageSettings)
      const setThumbnailImageSettings = useStore((s) => s.setThumbnailImageSettings)
      const raw = thumbnailImageSettings['email-product-release']
      const position = raw?.position ?? { x: 0, y: 0 }
      const zoom = raw?.zoom ?? 1
      const filters = raw?.filters ?? NEUTRAL_FILTERS

      return {
        slotState: {
          logo: {},
          eyebrow: {
            value: eyebrow,
            setValue: setEyebrow,
          },
          headline: {
            value: verbatimCopy.headline || '',
            setValue: (v) => setVerbatimCopy({ headline: v }),
          },
          image: {},
        },
        image: {
          url: thumbnailImageUrl ?? undefined,
          position,
          zoom,
          filters,
          setUrl: setThumbnailImageUrl,
          setSettings: (next) => setThumbnailImageSettings('email-product-release', next),
          frameWidth: 331,
          frameHeight: 184,
        },
        extras: { grayscale },
      }
    },
    renderTemplate: (ctx) => {
      const grayscale = ctx.extras.grayscale as boolean
      return (
        <EmailProductRelease
          eyebrow={ctx.textOf('eyebrow')}
          headline={ctx.textOf('headline')}
          imageUrl={ctx.image?.url ?? IMAGE_PLACEHOLDER}
          imagePosition={ctx.image?.position}
          imageZoom={ctx.image?.zoom}
          imageFilters={ctx.image?.filters}
          grayscale={grayscale}
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
