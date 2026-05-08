'use client'

import { useEffect, useState } from 'react'
import {
  SelectorPrimitive,
  type ColorOption,
} from '@/components/canvas-editor/stage-bar/SelectorPrimitive'
import { BenchChip, type BenchChipKind } from '@/components/canvas-editor/bench/BenchChip'
import { ActionButton, type ActionFn } from '@/components/canvas-editor/action-row/ActionButton'
import { ActionRow } from '@/components/canvas-editor/action-row/ActionRow'
import { SelectorRow } from '@/components/canvas-editor/stage-bar/SelectorRow'
import { StageBenchShell } from '@/components/canvas-editor/StageBenchShell'
import { StageBenchTab } from '@/components/canvas-editor/StageBenchTab'
import {
  EditbarRoot,
  EditbarSection,
  EditbarDivider,
  EditbarIconButton,
  EditbarImage,
  EditbarSlider,
  Toggle,
} from '@/components/canvas-editor/editbar'
import {
  EyeOff, Bold, Italic, AArrowUp, AArrowDown, MoveVertical,
} from 'lucide-react'

/**
 * Visual lab for new Stage & Bench atoms. Each section controls one variant
 * with local state so click-to-toggle is observable. Theme button at top
 * flips the `html.dark` class so we can verify both modes side-by-side.
 *
 * As more atoms land (BenchChip, ActionButton, etc.) they get sections here.
 */

const COLOR_OPTIONS_4: ColorOption[] = [
  { value: '1', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-1.png)' }, ariaLabel: 'Color 1' },
  { value: '2', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-2.png)' }, ariaLabel: 'Color 2' },
  { value: '3', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-3.png)' }, ariaLabel: 'Color 3' },
  { value: '4', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-4.png)' }, ariaLabel: 'Color 4' },
]

const COLOR_OPTIONS_3: ColorOption[] = COLOR_OPTIONS_4.slice(0, 3)
const COLOR_OPTIONS_2: ColorOption[] = COLOR_OPTIONS_4.slice(0, 2)

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-6">
      <span className="font-mono text-[10px] uppercase tracking-wider text-content-secondary w-32">
        {label}
      </span>
      {children}
    </div>
  )
}

export default function StageBenchAtomsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [align, setAlign] = useState<'left' | 'center'>('left')
  const [stack, setStack] = useState<'top' | 'center' | 'bottom'>('top')
  const [layout, setLayout] = useState<'image' | 'even' | 'text'>('even')
  const [color2, setColor2] = useState('1')
  const [color3, setColor3] = useState('1')
  const [color4, setColor4] = useState('1')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    return () => {
      // Don't leave dark class on when navigating away
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary p-10">
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="space-y-2">
          <h1 className="text-xl font-semibold">Stage & Bench — Atoms</h1>
          <p className="text-sm text-content-secondary">
            Visual lab for new components. Click anything to toggle.
            Currently rendering: <strong>SelectorPrimitive</strong>.
          </p>
          <button
            type="button"
            onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
            className="mt-2 px-3 py-1.5 text-xs font-mono uppercase tracking-wide
              border border-line-subtle rounded-[4px] hover:bg-interactive-hover transition-colors"
          >
            App chrome theme: {theme}
          </button>
          <p className="text-xs text-content-tertiary">
            App-wide theme — controls the editor chrome only. The Stage Bar &quot;Theme&quot;
            selector below is the per-asset theme (template light/dark variant) and is independent.
          </p>
        </header>

        <div className="space-y-6 p-6 rounded-lg border border-line-subtle bg-surface-secondary">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-content-secondary">
            SelectorPrimitive
          </h2>

          <Section label="theme">
            <SelectorPrimitive kind="theme" value={theme} onChange={setTheme} />
          </Section>

          <Section label="alignment">
            <SelectorPrimitive kind="alignment" value={align} onChange={setAlign} />
          </Section>

          <Section label="stack">
            <SelectorPrimitive kind="stack" value={stack} onChange={setStack} />
          </Section>

          <Section label="layout">
            <SelectorPrimitive kind="layout" value={layout} onChange={setLayout} />
          </Section>

          <Section label="color-2">
            <SelectorPrimitive kind="color-2" value={color2} onChange={setColor2} options={COLOR_OPTIONS_2} />
          </Section>

          <Section label="color-3">
            <SelectorPrimitive kind="color-3" value={color3} onChange={setColor3} options={COLOR_OPTIONS_3} />
          </Section>

          <Section label="color-4">
            <SelectorPrimitive kind="color-4" value={color4} onChange={setColor4} options={COLOR_OPTIONS_4} />
          </Section>
        </div>

        <div className="space-y-6 p-6 rounded-lg border border-line-subtle bg-surface-secondary">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-content-secondary">
            BenchChip
          </h2>

          <div className="flex flex-col items-start gap-4">
            {(['headline', 'body', 'subheadline', 'eyebrow', 'button', 'category', 'speaker', 'grid-detail', 'small-caption'] as BenchChipKind[]).map(kind => (
              <BenchChip key={kind} kind={kind} />
            ))}
          </div>
        </div>

        <div className="space-y-6 p-6 rounded-lg border border-line-subtle bg-surface-secondary">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-content-secondary">
            ActionButton
          </h2>

          <div className="flex items-center gap-2">
            {(['preview', 'add-to-queue', 'export'] as ActionFn[]).map(fn => (
              <ActionButton key={fn} fn={fn} onClick={() => console.log(fn)} />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-content-secondary">loading state:</span>
            <ActionButton fn="export" loading onClick={() => {}} />
          </div>
        </div>

        <div className="space-y-6 p-6 rounded-lg border border-line-subtle bg-surface-secondary">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-content-secondary">
            Contextual Toolbars
          </h2>

          {/* toolbar_text — eye-off + divider + bold/italic/A↑/A↓/move-vertical */}
          <Section label="toolbar_text">
            <EditbarRoot ariaLabel="Text formatting">
              <EditbarSection gap="default">
                <EditbarIconButton ariaLabel="Hide" size="sm">
                  <EyeOff size={18} />
                </EditbarIconButton>
              </EditbarSection>
              <EditbarDivider />
              <EditbarSection gap="default">
                <EditbarIconButton ariaLabel="Bold" size="sm">
                  <Bold size={18} />
                </EditbarIconButton>
                <EditbarIconButton ariaLabel="Italic" size="sm">
                  <Italic size={18} />
                </EditbarIconButton>
                <EditbarIconButton ariaLabel="Increase font size" size="sm">
                  <AArrowUp size={18} />
                </EditbarIconButton>
                <EditbarIconButton ariaLabel="Decrease font size" size="sm">
                  <AArrowDown size={18} />
                </EditbarIconButton>
                <EditbarIconButton ariaLabel="Line spacing" size="sm">
                  <MoveVertical size={18} />
                </EditbarIconButton>
              </EditbarSection>
            </EditbarRoot>
          </Section>

          {/* toolbar_cta — eye-off + divider + Button/Toggle/Link */}
          <Section label="toolbar_cta">
            <CtaToolbarPreview />
          </Section>

          {/* toolbar_image — image / sparkles / pencil */}
          <Section label="toolbar_image">
            <EditbarImage />
          </Section>

          {/* toolbar_slider — track + thumb + readout */}
          <Section label="toolbar_slider">
            <SliderPreview />
          </Section>
        </div>

        {/* Toggle in isolation, both sides */}
        <div className="space-y-6 p-6 rounded-lg border border-line-subtle bg-surface-secondary">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-content-secondary">
            Toggle
          </h2>
          <Section label="left-on / right-on">
            <TogglePreview />
          </Section>
        </div>

        <div className="space-y-6 p-6 rounded-lg border border-line-subtle bg-surface-secondary">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-content-secondary">
            Composites — SelectorRow + ActionRow
          </h2>

          <div className="space-y-3">
            <SelectorRow label="theme">
              <SelectorPrimitive kind="theme" value={theme} onChange={setTheme} />
            </SelectorRow>
            <SelectorRow label="color">
              <SelectorPrimitive kind="color-4" value={color4} onChange={setColor4} options={COLOR_OPTIONS_4} />
            </SelectorRow>
            <SelectorRow label="layout">
              <SelectorPrimitive kind="layout" value={layout} onChange={setLayout} />
            </SelectorRow>
            <SelectorRow label="content stack">
              <SelectorPrimitive kind="stack" value={stack} onChange={setStack} />
            </SelectorRow>
            <SelectorRow label="alignment">
              <SelectorPrimitive kind="alignment" value={align} onChange={setAlign} />
            </SelectorRow>
          </div>

          <div className="pt-2">
            <ActionRow>
              <ActionButton fn="preview" onClick={() => console.log('preview')} />
              <ActionButton fn="add-to-queue" onClick={() => console.log('queue')} />
              <ActionButton fn="export" onClick={() => console.log('export')} />
            </ActionRow>
          </div>
        </div>

        <div className="text-xs font-mono text-content-tertiary">
          state: theme={theme} · align={align} · stack={stack} · layout={layout} · c2={color2} · c3={color3} · c4={color4}
        </div>
      </div>

      {/* Full-shell preview — geometry sanity check */}
      <div className="mt-16 border-t border-line-subtle">
        <h2 className="px-10 pt-10 text-sm font-semibold uppercase tracking-wider text-content-secondary">
          StageBenchShell — geometry preview
        </h2>
        <StageBenchShell
          header={
            <>
              <StageBenchTab active>
                <span className="font-mono text-[12px] uppercase">
                  <span className="text-content-secondary">email</span>
                  <span className="text-content-tertiary mx-1">/</span>
                  <span className="text-content-primary">Dark &amp; Simple</span>
                </span>
              </StageBenchTab>
              <button className="ml-2 mb-2 p-1 text-content-secondary hover:text-content-primary transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </>
          }
          bench={
            <>
              <span className="font-mono text-[10px] uppercase tracking-wider text-content-secondary mb-1">Bench</span>
              <BenchChip kind="eyebrow" />
              <BenchChip kind="subheadline" />
              <BenchChip kind="button" />
            </>
          }
          stageBar={
            <>
              <SelectorRow label="theme">
                <SelectorPrimitive kind="theme" value={theme} onChange={setTheme} />
              </SelectorRow>
              <SelectorRow label="color">
                <SelectorPrimitive kind="color-4" value={color4} onChange={setColor4} options={COLOR_OPTIONS_4} />
              </SelectorRow>
              <SelectorRow label="layout">
                <SelectorPrimitive kind="layout" value={layout} onChange={setLayout} />
              </SelectorRow>
              <SelectorRow label="content stack">
                <SelectorPrimitive kind="stack" value={stack} onChange={setStack} />
              </SelectorRow>
              <SelectorRow label="alignment">
                <SelectorPrimitive kind="alignment" value={align} onChange={setAlign} />
              </SelectorRow>
            </>
          }
          actionRow={
            <ActionRow>
              <ActionButton fn="preview" onClick={() => {}} />
              <ActionButton fn="add-to-queue" onClick={() => {}} />
              <ActionButton fn="export" onClick={() => {}} />
            </ActionRow>
          }
        >
          {/* placeholder Stage — fake design */}
          <div
            className="rounded-md flex items-center justify-center text-content-tertiary font-mono text-sm uppercase"
            style={{ width: 640, height: 300, background: '#000', boxShadow: '0 var(--elevation-md-y) var(--elevation-md-blur) var(--elevation-md-color)' }}
          >
            Stage — 640 × 300
          </div>
        </StageBenchShell>
      </div>
    </div>
  )
}

// --- Toolbar previews (visual-lab only) ---
// These wrap the real components with local state so they're observable
// in isolation. The production EditbarText / EditbarCta pull state from
// the canvas-editor providers, which aren't mounted here.

function CtaToolbarPreview() {
  const [style, setStyle] = useState<'button' | 'link'>('button')
  return (
    <EditbarRoot ariaLabel="CTA formatting">
      <EditbarSection gap="default">
        <EditbarIconButton ariaLabel="Hide" size="sm">
          <EyeOff size={18} />
        </EditbarIconButton>
      </EditbarSection>
      <EditbarDivider />
      <EditbarSection gap="default">
        <span className="font-mono text-[12px] uppercase text-content-secondary">Button</span>
        <Toggle<'button' | 'link'>
          value={style}
          onChange={setStyle}
          options={[
            { value: 'button', label: 'Button' },
            { value: 'link', label: 'Link' },
          ]}
        />
        <span className="font-mono text-[12px] uppercase text-content-secondary">Link</span>
      </EditbarSection>
    </EditbarRoot>
  )
}

function SliderPreview() {
  const [val, setVal] = useState(0.5)
  return (
    <EditbarSlider
      ariaLabel="Slider"
      value={val}
      onChange={setVal}
      min={0}
      max={1}
      step={0.01}
      showValue
    />
  )
}

function TogglePreview() {
  const [side, setSide] = useState<'left' | 'right'>('right')
  return (
    <Toggle<'left' | 'right'>
      value={side}
      onChange={setSide}
      options={[
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ]}
    />
  )
}
