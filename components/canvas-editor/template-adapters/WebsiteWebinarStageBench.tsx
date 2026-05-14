'use client'

import { SLOT_PLACEHOLDERS } from '@/lib/slot-placeholders'

import { useStore } from '@/store'
import type { TemplateTheme, WebinarVariant } from '@/types'
import { NEUTRAL_FILTERS } from '@/lib/image-filters'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  WebsiteWebinar,
  type WebsiteWebinarBlockId,
} from '../../templates/WebsiteWebinar'
import type { EnumOption } from '../stage-bar/SelectorPrimitive'

/**
 * Stage & Bench adapter for website-webinar (factory-driven).
 *
 * Press-release-shaped left column + variant-driven right column:
 *  - variant='none'     → text-only
 *  - variant='image'    → image slot
 *  - variant='speakers' → 3 speaker cards
 *
 * Image slot binding always registers (the universal image registry is
 * sized to the largest variant); the template conditionally renders.
 * Per-speaker editing is surfaced via per-block toolbars (the 'speakers'
 * block kind is 'group' — wrapped as a single editable region).
 */

const IMAGE_PLACEHOLDER = '/placeholder-mountain.jpg'
/** 1×1 transparent gif used as the imageSrc placeholder when a speaker
 *  has no avatar yet — keeps the lightbox renderable so Change Image is
 *  reachable. Matches the pattern used in EmailSpeakersStageBench. */
const AVATAR_PLACEHOLDER_SRC =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='

const VARIANT_OPTIONS: EnumOption[] = [
  { value: 'none', ariaLabel: 'Text-only variant', label: 'Text' },
  { value: 'image', ariaLabel: 'Image variant', label: 'Image' },
  { value: 'speakers', ariaLabel: 'Speakers variant', label: 'Speakers' },
]

export const WebsiteWebinarStageBench =
  defineStageBenchAdapter<WebsiteWebinarBlockId>({
    templateId: 'website-webinar',
    slots: [
      { blockId: 'logo', label: 'Logo', iconKey: 'logo', kind: 'image', benchable: false },
      { blockId: 'solutionPill', label: 'Category', iconKey: 'category', chipKind: 'category', kind: 'pill' },
      {
        blockId: 'eyebrow',
        label: 'Eyebrow',
        iconKey: 'eyebrow',
        chipKind: 'eyebrow',
        kind: 'text',
        content: { format: 'plain', singleLine: true, placeholder: SLOT_PLACEHOLDERS.eyebrow },
      },
      {
        blockId: 'headline',
        label: 'Headline',
        iconKey: 'headline',
        kind: 'text',
        content: { format: 'html', placeholder: SLOT_PLACEHOLDERS.headline },
        size: { default: 38, min: 24, max: 60, step: 2 },
      },
      {
        blockId: 'subhead',
        label: 'Subhead',
        iconKey: 'subhead',
        chipKind: 'subheadline',
        kind: 'text',
        content: { format: 'html', placeholder: SLOT_PLACEHOLDERS.subhead },
        size: { default: 18, min: 12, max: 28, step: 1 },
      },
      {
        blockId: 'body',
        label: 'Body',
        iconKey: 'body',
        chipKind: 'body',
        kind: 'text',
        content: { format: 'html', placeholder: SLOT_PLACEHOLDERS.body },
      },
      {
        blockId: 'cta',
        label: 'CTA',
        iconKey: 'cta',
        kind: 'cta',
        content: { format: 'plain', placeholder: SLOT_PLACEHOLDERS.cta },
      },
      { blockId: 'image', label: 'Image', iconKey: 'image', kind: 'image', benchable: false },
      // Each speaker is its own bench-able group (matches EmailSpeakers).
      // Drag a speaker to the bench → showSpeakerN goes false; drag back
      // → restored. Per-speaker name + role are nested children below.
      { blockId: 'speaker1', label: 'Speaker 1', iconKey: 'speaker', chipKind: 'speaker', kind: 'group' },
      { blockId: 'speaker2', label: 'Speaker 2', iconKey: 'speaker', chipKind: 'speaker', kind: 'group' },
      { blockId: 'speaker3', label: 'Speaker 3', iconKey: 'speaker', chipKind: 'speaker', kind: 'group' },
      {
        blockId: 'speaker1Name', label: 'Speaker 1 Name', iconKey: 'speaker',
        chipKind: 'speaker', kind: 'text', parent: 'speaker1',
        content: { format: 'plain', singleLine: true, placeholder: 'Speaker Name' },
      },
      {
        blockId: 'speaker1Role', label: 'Speaker 1 Role', iconKey: 'small-caption',
        chipKind: 'small-caption', kind: 'text', parent: 'speaker1',
        content: { format: 'plain', singleLine: true, placeholder: 'Speaker Role' },
      },
      {
        blockId: 'speaker2Name', label: 'Speaker 2 Name', iconKey: 'speaker',
        chipKind: 'speaker', kind: 'text', parent: 'speaker2',
        content: { format: 'plain', singleLine: true, placeholder: 'Speaker Name' },
      },
      {
        blockId: 'speaker2Role', label: 'Speaker 2 Role', iconKey: 'small-caption',
        chipKind: 'small-caption', kind: 'text', parent: 'speaker2',
        content: { format: 'plain', singleLine: true, placeholder: 'Speaker Role' },
      },
      {
        blockId: 'speaker3Name', label: 'Speaker 3 Name', iconKey: 'speaker',
        chipKind: 'speaker', kind: 'text', parent: 'speaker3',
        content: { format: 'plain', singleLine: true, placeholder: 'Speaker Name' },
      },
      {
        blockId: 'speaker3Role', label: 'Speaker 3 Role', iconKey: 'small-caption',
        chipKind: 'small-caption', kind: 'text', parent: 'speaker3',
        content: { format: 'plain', singleLine: true, placeholder: 'Speaker Role' },
      },
      // Per-speaker avatars — image children of the respective speaker
      // group. Each opens its own ImageEditorModal via the factory's
      // childImages config (resolved by blockId).
      { blockId: 'speaker1Avatar', label: 'Speaker 1 Avatar', iconKey: 'image', kind: 'image', parent: 'speaker1' },
      { blockId: 'speaker2Avatar', label: 'Speaker 2 Avatar', iconKey: 'image', kind: 'image', parent: 'speaker2' },
      { blockId: 'speaker3Avatar', label: 'Speaker 3 Avatar', iconKey: 'image', kind: 'image', parent: 'speaker3' },
    ],
    childImages: [
      { blockId: 'speaker1Avatar', placeholderSrc: AVATAR_PLACEHOLDER_SRC, frameWidth: 48, frameHeight: 48 },
      { blockId: 'speaker2Avatar', placeholderSrc: AVATAR_PLACEHOLDER_SRC, frameWidth: 48, frameHeight: 48 },
      { blockId: 'speaker3Avatar', placeholderSrc: AVATAR_PLACEHOLDER_SRC, frameWidth: 48, frameHeight: 48 },
    ],
    stageBar: [
      { id: 'theme', kind: 'theme', label: 'theme' },
      { id: 'variant', kind: 'enum', label: 'variant', options: VARIANT_OPTIONS },
      { id: 'stackAlign', kind: 'stack', label: 'content stack' },
    ],
    image: { blockId: 'image', placeholderSrc: IMAGE_PLACEHOLDER },
    category: {
      blockId: 'solutionPill',
      options: (colors) =>
        Object.entries(colors.solutions)
          .filter(([key]) => key !== 'none')
          .map(([key, cfg]) => ({ value: key, label: cfg.label, color: cfg.color })),
    },
    contentStack: { templateKey: 'website-webinar', maxGap: 96 },
    useStoreBindings: () => {
      const eyebrow = useStore((s) => s.eyebrow)
      const setEyebrow = useStore((s) => s.setEyebrow)
      const verbatimCopy = useStore((s) => s.verbatimCopy)
      const setVerbatimCopy = useStore((s) => s.setVerbatimCopy)
      const ctaText = useStore((s) => s.ctaText)
      const setCtaText = useStore((s) => s.setCtaText)

      const showEyebrow = useStore((s) => s.showEyebrow)
      const setShowEyebrow = useStore((s) => s.setShowEyebrow)
      const showHeadline = useStore((s) => s.showHeadline)
      const showSubhead = useStore((s) => s.showSubhead)
      const setShowSubhead = useStore((s) => s.setShowSubhead)
      const showBody = useStore((s) => s.showBody)
      const setShowBody = useStore((s) => s.setShowBody)
      const showCta = useStore((s) => s.showCta)
      const setShowCta = useStore((s) => s.setShowCta)
      const showSolutionSet = useStore((s) => s.showSolutionSet)
      const setShowSolutionSet = useStore((s) => s.setShowSolutionSet)

      const solution = useStore((s) => s.solution)
      const setSolution = useStore((s) => s.setSolution)
      const theme = useStore((s) => s.theme)
      const setTheme = useStore((s) => s.setTheme)
      const webinarVariant = useStore((s) => s.webinarVariant)
      const setWebinarVariant = useStore((s) => s.setWebinarVariant)
      const grayscale = useStore((s) => s.grayscale)

      const headlineFontSize = useStore((s) => s.headlineFontSize)
      const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)
      const subheadFontSize = useStore((s) => s.subheadFontSize)
      const setSubheadFontSize = useStore((s) => s.setSubheadFontSize)

      const stackAlign = useStore((s) => s.stackAlign)
      const setStackAlign = useStore((s) => s.setStackAlign)
      const gaps = useStore((s) => s.templateGaps['website-webinar'] ?? {})
      const setTemplateGap = useStore((s) => s.setTemplateGap)

      const thumbnailImageUrl = useStore((s) => s.thumbnailImageUrl)
      const setThumbnailImageUrl = useStore((s) => s.setThumbnailImageUrl)
      const thumbnailImageSettings = useStore((s) => s.thumbnailImageSettings)
      const setThumbnailImageSettings = useStore((s) => s.setThumbnailImageSettings)
      const raw = thumbnailImageSettings['website-webinar']
      const position = raw?.position ?? { x: 0, y: 0 }
      const zoom = raw?.zoom ?? 1
      const filters = raw?.filters ?? NEUTRAL_FILTERS

      // Speaker fields stay raw — surfaced via extras for the template
      // to render its 3-card column directly.
      const speaker1Name = useStore((s) => s.speaker1Name)
      const setSpeaker1Name = useStore((s) => s.setSpeaker1Name)
      const speaker1Role = useStore((s) => s.speaker1Role)
      const setSpeaker1Role = useStore((s) => s.setSpeaker1Role)
      const speaker1ImageUrl = useStore((s) => s.speaker1ImageUrl)
      const setSpeaker1ImageUrl = useStore((s) => s.setSpeaker1ImageUrl)
      const speaker1ImagePosition = useStore((s) => s.speaker1ImagePosition)
      const setSpeaker1ImagePosition = useStore((s) => s.setSpeaker1ImagePosition)
      const speaker1ImageZoom = useStore((s) => s.speaker1ImageZoom)
      const setSpeaker1ImageZoom = useStore((s) => s.setSpeaker1ImageZoom)
      const speaker2Name = useStore((s) => s.speaker2Name)
      const setSpeaker2Name = useStore((s) => s.setSpeaker2Name)
      const speaker2Role = useStore((s) => s.speaker2Role)
      const setSpeaker2Role = useStore((s) => s.setSpeaker2Role)
      const speaker2ImageUrl = useStore((s) => s.speaker2ImageUrl)
      const setSpeaker2ImageUrl = useStore((s) => s.setSpeaker2ImageUrl)
      const speaker2ImagePosition = useStore((s) => s.speaker2ImagePosition)
      const setSpeaker2ImagePosition = useStore((s) => s.setSpeaker2ImagePosition)
      const speaker2ImageZoom = useStore((s) => s.speaker2ImageZoom)
      const setSpeaker2ImageZoom = useStore((s) => s.setSpeaker2ImageZoom)
      const speaker3Name = useStore((s) => s.speaker3Name)
      const setSpeaker3Name = useStore((s) => s.setSpeaker3Name)
      const speaker3Role = useStore((s) => s.speaker3Role)
      const setSpeaker3Role = useStore((s) => s.setSpeaker3Role)
      const speaker3ImageUrl = useStore((s) => s.speaker3ImageUrl)
      const setSpeaker3ImageUrl = useStore((s) => s.setSpeaker3ImageUrl)
      const speaker3ImagePosition = useStore((s) => s.speaker3ImagePosition)
      const setSpeaker3ImagePosition = useStore((s) => s.setSpeaker3ImagePosition)
      const speaker3ImageZoom = useStore((s) => s.speaker3ImageZoom)
      const setSpeaker3ImageZoom = useStore((s) => s.setSpeaker3ImageZoom)
      const showSpeaker1 = useStore((s) => s.showSpeaker1)
      const setShowSpeaker1 = useStore((s) => s.setShowSpeaker1)
      const showSpeaker2 = useStore((s) => s.showSpeaker2)
      const setShowSpeaker2 = useStore((s) => s.setShowSpeaker2)
      const showSpeaker3 = useStore((s) => s.showSpeaker3)
      const setShowSpeaker3 = useStore((s) => s.setShowSpeaker3)
      const speakers = {
        speaker1: { name: speaker1Name, role: speaker1Role, imageUrl: speaker1ImageUrl, imagePosition: speaker1ImagePosition, imageZoom: speaker1ImageZoom },
        speaker2: { name: speaker2Name, role: speaker2Role, imageUrl: speaker2ImageUrl, imagePosition: speaker2ImagePosition, imageZoom: speaker2ImageZoom },
        speaker3: { name: speaker3Name, role: speaker3Role, imageUrl: speaker3ImageUrl, imagePosition: speaker3ImagePosition, imageZoom: speaker3ImageZoom },
        showSpeaker1, showSpeaker2, showSpeaker3,
      }

      return {
        slotState: {
          logo: {},
          solutionPill: {
            visible: showSolutionSet,
            setVisible: setShowSolutionSet,
          },
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
            fontSize: subheadFontSize ?? undefined,
            setValue: (v) => setVerbatimCopy({ subhead: v }),
            setVisible: setShowSubhead,
            setFontSize: setSubheadFontSize,
          },
          body: {
            value: verbatimCopy.body || '',
            visible: showBody,
            setValue: (v) => setVerbatimCopy({ body: v }),
            setVisible: setShowBody,
          },
          cta: {
            value: ctaText,
            visible: showCta,
            setValue: setCtaText,
            setVisible: setShowCta,
          },
          image: {},
          speaker1: { visible: showSpeaker1, setVisible: setShowSpeaker1 },
          speaker2: { visible: showSpeaker2, setVisible: setShowSpeaker2 },
          speaker3: { visible: showSpeaker3, setVisible: setShowSpeaker3 },
          speaker1Name: { value: speaker1Name, setValue: setSpeaker1Name },
          speaker1Role: { value: speaker1Role, setValue: setSpeaker1Role },
          speaker1Avatar: {},
          speaker2Name: { value: speaker2Name, setValue: setSpeaker2Name },
          speaker2Role: { value: speaker2Role, setValue: setSpeaker2Role },
          speaker2Avatar: {},
          speaker3Name: { value: speaker3Name, setValue: setSpeaker3Name },
          speaker3Role: { value: speaker3Role, setValue: setSpeaker3Role },
          speaker3Avatar: {},
        },
        stageBar: {
          theme: { value: theme, set: (v) => setTheme(v as TemplateTheme) },
          variant: { value: webinarVariant, set: (v) => setWebinarVariant(v as WebinarVariant) },
          stackAlign: { value: stackAlign, set: setStackAlign as (v: unknown) => void },
        },
        image: {
          url: thumbnailImageUrl ?? undefined,
          position,
          zoom,
          filters,
          setUrl: setThumbnailImageUrl,
          setSettings: (next) => setThumbnailImageSettings('website-webinar', next),
          frameWidth: 333,
          frameHeight: 450,
        },
        // Per-speaker avatar bindings. Filters aren't persisted per speaker
        // yet — feed NEUTRAL_FILTERS and ignore the filters portion of
        // onSettingsChange (sliders move locally but reset on reopen).
        // Matches the existing EmailSpeakers TODO.
        childImages: {
          speaker1Avatar: {
            url: speaker1ImageUrl || undefined,
            position: speaker1ImagePosition,
            zoom: speaker1ImageZoom,
            filters: NEUTRAL_FILTERS,
            setUrl: setSpeaker1ImageUrl,
            setSettings: (next) => {
              setSpeaker1ImagePosition(next.position)
              setSpeaker1ImageZoom(next.zoom)
            },
          },
          speaker2Avatar: {
            url: speaker2ImageUrl || undefined,
            position: speaker2ImagePosition,
            zoom: speaker2ImageZoom,
            filters: NEUTRAL_FILTERS,
            setUrl: setSpeaker2ImageUrl,
            setSettings: (next) => {
              setSpeaker2ImagePosition(next.position)
              setSpeaker2ImageZoom(next.zoom)
            },
          },
          speaker3Avatar: {
            url: speaker3ImageUrl || undefined,
            position: speaker3ImagePosition,
            zoom: speaker3ImageZoom,
            filters: NEUTRAL_FILTERS,
            setUrl: setSpeaker3ImageUrl,
            setSettings: (next) => {
              setSpeaker3ImagePosition(next.position)
              setSpeaker3ImageZoom(next.zoom)
            },
          },
        },
        category: {
          value: solution,
          set: setSolution,
        },
        contentStack: {
          stackAlign,
          setStackAlign,
          gaps,
          setGap: (key, value) => setTemplateGap('website-webinar', key, value),
        },
        extras: { theme, variant: webinarVariant, grayscale, solution, speakers },
      }
    },
    renderTemplate: (ctx) => {
      const theme = ctx.extras.theme as TemplateTheme
      const variant = ctx.extras.variant as WebinarVariant
      const grayscale = ctx.extras.grayscale as boolean
      const solution = ctx.extras.solution as string
      const speakers = ctx.extras.speakers as {
        speaker1: WebsiteWebinarSpeaker
        speaker2: WebsiteWebinarSpeaker
        speaker3: WebsiteWebinarSpeaker
        showSpeaker1: boolean
        showSpeaker2: boolean
        showSpeaker3: boolean
      }
      const showSolution = ctx.visibilityOf('solutionPill')
      return (
        <WebsiteWebinar
          eyebrow={ctx.textOf('eyebrow')}
          headline={ctx.textOf('headline')}
          subhead={ctx.textOf('subhead')}
          body={ctx.textOf('body')}
          cta={ctx.textOf('cta')}
          solution={showSolution ? solution : 'none'}
          variant={variant}
          imageUrl={ctx.image?.url}
          imagePosition={ctx.image?.position}
          imageZoom={ctx.image?.zoom}
          imageFilters={ctx.image?.filters}
          showEyebrow={ctx.visibilityOf('eyebrow')}
          showHeadline={ctx.rawVisibilityOf('headline')}
          showSubhead={ctx.visibilityOf('subhead')}
          showBody={ctx.visibilityOf('body')}
          showCta={ctx.visibilityOf('cta')}
          grayscale={grayscale}
          theme={theme}
          speaker1={speakers.speaker1}
          speaker2={speakers.speaker2}
          speaker3={speakers.speaker3}
          showSpeaker1={ctx.visibilityOf('speaker1')}
          showSpeaker2={ctx.visibilityOf('speaker2')}
          showSpeaker3={ctx.visibilityOf('speaker3')}
          headlineFontSize={ctx.fontSizeOf('headline')}
          subheadFontSize={ctx.fontSizeOf('subhead')}
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

type WebsiteWebinarSpeaker = {
  name: string
  role: string
  imageUrl: string
  imagePosition: { x: number; y: number }
  imageZoom: number
}
