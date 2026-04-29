'use client'

import { CanvasEditorProvider } from '@/components/canvas-editor/CanvasEditorProvider'
import { Editable } from '@/components/canvas-editor/Editable'
import { ContextualToolbar } from '@/components/canvas-editor/ContextualToolbar'
import { useCanvasEditorStore } from '@/store/canvas-editor'

export default function CanvasEditorTestPage() {
  const selection = useCanvasEditorStore((s) => s.selection)
  const hover = useCanvasEditorStore((s) => s.hover)

  return (
    <CanvasEditorProvider mode="edit">
      <div style={{ padding: 40, fontFamily: 'system-ui, sans-serif', maxWidth: 900 }}>
        <h1 style={{ marginBottom: 8, fontSize: 22, fontWeight: 600 }}>
          Canvas Editor Substrate — Phase 1 Test
        </h1>
        <p style={{ marginBottom: 24, color: '#666', fontSize: 14, lineHeight: 1.5 }}>
          Click any element below. Toolbar should appear above the selection. Click outside to clear.
          Selection state is shown at the bottom for inspection.
        </p>

        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            background: '#fff',
          }}
        >
          <Editable templateId="test" slotKey="headline" storeKey="headline" kind="text">
            <div style={{ fontSize: 28, fontWeight: 600, color: '#111' }}>
              I&apos;m a headline. Click me.
            </div>
          </Editable>

          <Editable templateId="test" slotKey="body" storeKey="body" kind="text">
            <div style={{ fontSize: 16, lineHeight: 1.5, color: '#333' }}>
              I&apos;m body text. Click me too — selection should switch and the toolbar should
              reposition.
            </div>
          </Editable>

          <Editable templateId="test" slotKey="hero-image" storeKey="thumbnailImageUrl" kind="image">
            <div
              style={{
                width: 240,
                height: 140,
                background: 'linear-gradient(135deg, #888, #444)',
                borderRadius: 4,
              }}
            />
          </Editable>

          <Editable templateId="test" slotKey="background" storeKey="colorStyle" kind="color">
            <div
              style={{
                width: '100%',
                height: 32,
                background: 'linear-gradient(90deg, #2b2d4f, #5b3e8c)',
                borderRadius: 4,
              }}
            />
          </Editable>

          <Editable templateId="test" slotKey="spacer-demo" storeKey="demoSpacer" kind="spacer">
            <div
              style={{
                height: 24,
                background: 'repeating-linear-gradient(45deg, #fafafa, #fafafa 6px, #f0f0f0 6px, #f0f0f0 12px)',
                border: '1px dashed #ccc',
                borderRadius: 2,
              }}
            />
          </Editable>
        </div>

        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#666' }}>
            Selection state
          </h2>
          <pre
            style={{
              padding: 16,
              background: '#0a0a0a',
              color: '#e6e6e6',
              borderRadius: 6,
              fontSize: 12,
              lineHeight: 1.5,
              overflowX: 'auto',
            }}
          >
            {JSON.stringify(
              {
                selection: selection
                  ? {
                      ...selection,
                      bounds: selection.bounds
                        ? {
                            top: Math.round(selection.bounds.top),
                            left: Math.round(selection.bounds.left),
                            width: Math.round(selection.bounds.width),
                            height: Math.round(selection.bounds.height),
                          }
                        : null,
                    }
                  : null,
                hover,
              },
              null,
              2,
            )}
          </pre>
        </div>

        <ContextualToolbar />
      </div>
    </CanvasEditorProvider>
  )
}
