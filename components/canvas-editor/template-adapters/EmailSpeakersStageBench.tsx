'use client'

import { useStore } from '@/store'
import type { TemplateTheme } from '@/types'
import { NEUTRAL_FILTERS } from '@/lib/image-filters'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  EmailSpeakers,
  type EmailSpeakersBlockId,
} from '../../templates/EmailSpeakers'

/**
 * Stage & Bench adapter for email-speakers (factory-driven).
 *
 * Each of speaker1/2/3 is a bench-able group with three nested children:
 *  - speakerNName (text)
 *  - speakerNRole (text)
 *  - speakerNAvatar (image; opens per-speaker ImageEditorModal)
 *
 * Solution pill is bench-able as a 'category' chip. Left content stack
 * (eyebrow/headline/body/cta) is contentStack-driven; right speakers
 * column is unaffected by stack alignment.
 *
 * Per-speaker filter persistence is a known gap — `filters` is fed
 * NEUTRAL_FILTERS and the modal's `next.filters` is dropped. Sliders
 * move locally but don't persist across modal opens. Wiring 3×
 * per-speaker `imageFilters` store fields + export-params plumbing is
 * the follow-up to light this up.
 */

/** 1×1 transparent gif used as the imageSrc placeholder when a speaker
 *  has no avatar yet — keeps the lightbox renderable so Change Image is
 *  reachable. */
const AVATAR_PLACEHOLDER_SRC =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='

export const EmailSpeakersStageBench =
  defineStageBenchAdapter<EmailSpeakersBlockId>({
    templateId: 'email-speakers',
    slots: [
      { blockId: 'solutionPill', label: 'Category', iconKey: 'category', chipKind: 'category', kind: 'pill' },
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
        benchable: false,
        content: { format: 'html', placeholder: 'Headline' },
        size: { default: 38, min: 16, max: 50, step: 2 },
      },
      {
        blockId: 'body',
        label: 'Body',
        iconKey: 'body',
        chipKind: 'body',
        kind: 'text',
        content: { format: 'html', placeholder: 'Body copy goes here.' },
      },
      {
        blockId: 'cta',
        label: 'CTA',
        iconKey: 'cta',
        kind: 'cta',
        content: { format: 'plain', placeholder: 'Call to Action' },
      },
      // Each speaker is a bench-able group.
      { blockId: 'speaker1', label: 'Speaker 1', iconKey: 'speaker', chipKind: 'speaker', kind: 'group' },
      { blockId: 'speaker2', label: 'Speaker 2', iconKey: 'speaker', chipKind: 'speaker', kind: 'group' },
      { blockId: 'speaker3', label: 'Speaker 3', iconKey: 'speaker', chipKind: 'speaker', kind: 'group' },
      // Per-speaker text children (name + role) — bench-suppressed via `parent`.
      {
        blockId: 'speaker1Name', label: 'Speaker 1 Name', iconKey: 'speaker',
        chipKind: 'speaker', kind: 'text', parent: 'speaker1',
        content: { format: 'plain', singleLine: true, placeholder: 'Firstname Lastname' },
      },
      {
        blockId: 'speaker1Role', label: 'Speaker 1 Role', iconKey: 'small-caption',
        chipKind: 'small-caption', kind: 'text', parent: 'speaker1',
        content: { format: 'plain', singleLine: true, placeholder: 'Role, Company' },
      },
      {
        blockId: 'speaker2Name', label: 'Speaker 2 Name', iconKey: 'speaker',
        chipKind: 'speaker', kind: 'text', parent: 'speaker2',
        content: { format: 'plain', singleLine: true, placeholder: 'Firstname Lastname' },
      },
      {
        blockId: 'speaker2Role', label: 'Speaker 2 Role', iconKey: 'small-caption',
        chipKind: 'small-caption', kind: 'text', parent: 'speaker2',
        content: { format: 'plain', singleLine: true, placeholder: 'Role, Company' },
      },
      {
        blockId: 'speaker3Name', label: 'Speaker 3 Name', iconKey: 'speaker',
        chipKind: 'speaker', kind: 'text', parent: 'speaker3',
        content: { format: 'plain', singleLine: true, placeholder: 'Firstname Lastname' },
      },
      {
        blockId: 'speaker3Role', label: 'Speaker 3 Role', iconKey: 'small-caption',
        chipKind: 'small-caption', kind: 'text', parent: 'speaker3',
        content: { format: 'plain', singleLine: true, placeholder: 'Role, Company' },
      },
      // Per-speaker avatar children — image kind opens own ImageEditorModal.
      { blockId: 'speaker1Avatar', label: 'Speaker 1 Avatar', iconKey: 'image', kind: 'image', parent: 'speaker1' },
      { blockId: 'speaker2Avatar', label: 'Speaker 2 Avatar', iconKey: 'image', kind: 'image', parent: 'speaker2' },
      { blockId: 'speaker3Avatar', label: 'Speaker 3 Avatar', iconKey: 'image', kind: 'image', parent: 'speaker3' },
    ],
    stageBar: [
      { id: 'theme', kind: 'theme', label: 'theme' },
      { id: 'stackAlign', kind: 'stack', label: 'content stack' },
    ],
    childImages: [
      { blockId: 'speaker1Avatar', placeholderSrc: AVATAR_PLACEHOLDER_SRC, frameWidth: 48, frameHeight: 48 },
      { blockId: 'speaker2Avatar', placeholderSrc: AVATAR_PLACEHOLDER_SRC, frameWidth: 48, frameHeight: 48 },
      { blockId: 'speaker3Avatar', placeholderSrc: AVATAR_PLACEHOLDER_SRC, frameWidth: 48, frameHeight: 48 },
    ],
    category: {
      blockId: 'solutionPill',
      options: (colors) =>
        Object.entries(colors.solutions)
          .filter(([key]) => key !== 'none')
          .map(([key, cfg]) => ({ value: key, label: cfg.label, color: cfg.color })),
    },
    contentStack: { templateKey: 'email-speakers', maxGap: 96 },
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
      const showBody = useStore((s) => s.showBody)
      const setShowBody = useStore((s) => s.setShowBody)
      const showCta = useStore((s) => s.showCta)
      const setShowCta = useStore((s) => s.setShowCta)
      const showSolutionSet = useStore((s) => s.showSolutionSet)
      const setShowSolutionSet = useStore((s) => s.setShowSolutionSet)
      const showSpeaker1 = useStore((s) => s.showSpeaker1)
      const setShowSpeaker1 = useStore((s) => s.setShowSpeaker1)
      const showSpeaker2 = useStore((s) => s.showSpeaker2)
      const setShowSpeaker2 = useStore((s) => s.setShowSpeaker2)
      const showSpeaker3 = useStore((s) => s.showSpeaker3)
      const setShowSpeaker3 = useStore((s) => s.setShowSpeaker3)

      const solution = useStore((s) => s.solution)
      const setSolution = useStore((s) => s.setSolution)
      const theme = useStore((s) => s.theme)
      const setTheme = useStore((s) => s.setTheme)
      const logoColor = useStore((s) => s.logoColor)
      const grayscale = useStore((s) => s.grayscale)
      const speakerCount = useStore((s) => s.speakerCount)

      const headlineFontSize = useStore((s) => s.headlineFontSize)
      const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)

      const stackAlign = useStore((s) => s.stackAlign)
      const setStackAlign = useStore((s) => s.setStackAlign)
      const gaps = useStore((s) => s.templateGaps['email-speakers'] ?? {})
      const setTemplateGap = useStore((s) => s.setTemplateGap)

      // Speaker text + image bindings.
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

      const speakers = {
        speaker1: { name: speaker1Name, role: speaker1Role, imageUrl: speaker1ImageUrl, imagePosition: speaker1ImagePosition, imageZoom: speaker1ImageZoom },
        speaker2: { name: speaker2Name, role: speaker2Role, imageUrl: speaker2ImageUrl, imagePosition: speaker2ImagePosition, imageZoom: speaker2ImageZoom },
        speaker3: { name: speaker3Name, role: speaker3Role, imageUrl: speaker3ImageUrl, imagePosition: speaker3ImagePosition, imageZoom: speaker3ImageZoom },
      }

      return {
        slotState: {
          solutionPill: { visible: showSolutionSet, setVisible: setShowSolutionSet },
          eyebrow: { value: eyebrow, visible: showEyebrow, setValue: setEyebrow, setVisible: setShowEyebrow },
          headline: {
            value: verbatimCopy.headline || '',
            visible: showHeadline,
            fontSize: headlineFontSize ?? undefined,
            setValue: (v) => setVerbatimCopy({ headline: v }),
            setFontSize: setHeadlineFontSize,
          },
          body: {
            value: verbatimCopy.body || '',
            visible: showBody,
            setValue: (v) => setVerbatimCopy({ body: v }),
            setVisible: setShowBody,
          },
          cta: { value: ctaText, visible: showCta, setValue: setCtaText, setVisible: setShowCta },
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
          stackAlign: { value: stackAlign, set: setStackAlign as (v: unknown) => void },
        },
        category: { value: solution, set: setSolution },
        contentStack: {
          stackAlign,
          setStackAlign,
          gaps,
          setGap: (key, value) => setTemplateGap('email-speakers', key, value),
        },
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
        extras: { theme, grayscale, solution, speakers, logoColor, speakerCount },
      }
    },
    renderTemplate: (ctx) => {
      const theme = ctx.extras.theme as TemplateTheme
      const grayscale = ctx.extras.grayscale as boolean
      const solution = ctx.extras.solution as string
      const logoColor = (ctx.extras.logoColor as string) === 'orange' ? 'orange' : 'black'
      const speakerCount = ctx.extras.speakerCount as 1 | 2 | 3
      const speakers = ctx.extras.speakers as {
        speaker1: { name: string; role: string; imageUrl: string; imagePosition: { x: number; y: number }; imageZoom: number }
        speaker2: { name: string; role: string; imageUrl: string; imagePosition: { x: number; y: number }; imageZoom: number }
        speaker3: { name: string; role: string; imageUrl: string; imagePosition: { x: number; y: number }; imageZoom: number }
      }
      return (
        <EmailSpeakers
          headline={ctx.textOf('headline')}
          eyebrow={ctx.textOf('eyebrow')}
          body={ctx.textOf('body')}
          ctaText={ctx.textOf('cta')}
          solution={solution}
          logoColor={logoColor}
          showEyebrow={ctx.visibilityOf('eyebrow')}
          showHeadline={ctx.rawVisibilityOf('headline')}
          showBody={ctx.visibilityOf('body')}
          showCta={ctx.visibilityOf('cta')}
          showSolutionSet={ctx.visibilityOf('solutionPill')}
          grayscale={grayscale}
          theme={theme}
          speakerCount={speakerCount}
          showSpeaker1={ctx.visibilityOf('speaker1')}
          showSpeaker2={ctx.visibilityOf('speaker2')}
          showSpeaker3={ctx.visibilityOf('speaker3')}
          speaker1={speakers.speaker1}
          speaker2={speakers.speaker2}
          speaker3={speakers.speaker3}
          headlineFontSize={ctx.fontSizeOf('headline')}
          stackAlign={ctx.stackAlign}
          gaps={ctx.gaps}
          colors={ctx.colors}
          typography={ctx.typography}
          scale={ctx.scale}
          renderBlock={ctx.renderBlock}
          renderInlineEditor={ctx.renderInlineEditor}
          renderSpacerBetween={ctx.renderSpacerBetween}
          renderOverlay={ctx.renderOverlay}
        />
      )
    },
  })
