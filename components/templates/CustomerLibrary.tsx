'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

export type CustomerLibraryVariant = 'orange' | 'dark' | 'light'

/** Editable block ids for Stage & Bench wiring. "Powered by Cority"
 *  pill and decorative arrow are brand-locked (baked in). */
export type CustomerLibraryBlockId =
  | 'headline'
  | 'eyebrow'
  | 'body'
  | 'footerText'
  | 'qrCode'

export interface CustomerLibraryProps {
  headline: string
  eyebrow: string
  body: string
  footerText: string
  variant: CustomerLibraryVariant
  qrCodeUrl?: string
  hasQrCode?: boolean
  showHeadline: boolean
  showEyebrow: boolean
  showBody: boolean
  showFooterText: boolean
  headlineFontSize?: number
  /** Stage & Bench render-prop: wraps each editable region in <Editable>. */
  renderBlock?: (blockId: CustomerLibraryBlockId, content: ReactNode) => ReactNode
  /** Stage & Bench render-prop: swaps a block's inner text for an in-place editor. */
  renderInlineEditor?: (blockId: CustomerLibraryBlockId, defaultInner: ReactNode) => ReactNode
  /** Stage & Bench render-prop: absolutely-positioned overlay (drag scrim). */
  renderOverlay?: () => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

export function CustomerLibrary({
  headline,
  eyebrow,
  body,
  footerText,
  variant = 'orange',
  qrCodeUrl,
  hasQrCode = false,
  showHeadline = true,
  showEyebrow = true,
  showBody = true,
  showFooterText = true,
  headlineFontSize: headlineFontSizeProp,
  renderBlock,
  renderInlineEditor,
  renderOverlay,
  colors,
  typography,
  scale = 1,
}: CustomerLibraryProps) {
  // Render-prop shims: in export/preview contexts these are no-ops; in
  // the editor they wrap blocks with <Editable> and swap inner text for
  // an in-place editor when selected.
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const wrapInline = renderInlineEditor ?? ((_id, defaultInner) => defaultInner)
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  const getVariantColors = () => {
    switch (variant) {
      case 'orange':
        return {
          background: '#D35F0B',
          headlineColor: 'white',
          eyebrowColor: 'white',
          bodyColor: 'white',
          footerTextColor: 'white',
          arrowColor: 'white',
          bottomBarBg: 'rgba(0, 0, 0, 0.20)',
          bottomBarBorderColor: 'white',
          pillBg: '#D35F0B',
          pillBorderColor: 'white',
          pillTextColor: 'white',
          logoFill: '#FFFFFF',
        }
      case 'dark':
        return {
          background: '#060015',
          headlineColor: 'white',
          eyebrowColor: '#89888B',
          bodyColor: 'white',
          footerTextColor: 'white',
          arrowColor: 'white',
          bottomBarBg: 'rgba(0, 0, 0, 0.20)',
          bottomBarBorderColor: '#0080FF',
          pillBg: '#060621',
          pillBorderColor: '#0080FF',
          pillTextColor: '#89888B',
          logoFill: '#FFFFFF',
        }
      case 'light':
        return {
          background: 'white',
          headlineColor: '#060015',
          eyebrowColor: '#89888B',
          bodyColor: '#060015',
          footerTextColor: '#060015',
          arrowColor: '#D35F0B',
          bottomBarBg: '#F1F3F4',
          bottomBarBorderColor: '#060015',
          pillBg: 'white',
          pillBorderColor: '#B3B2B1',
          pillTextColor: '#89888B',
          logoFill: '#D65F00',
        }
    }
  }

  const c = getVariantColors()
  const headlineSize = headlineFontSizeProp ?? 36.98

  const containerStyle: CSSProperties = {
    width: 590,
    height: 330,
    position: 'relative',
    background: c.background,
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  return (
    <div style={containerStyle}>
      <style>{`
        .cl-rich-text p { margin: 0; }
      `}</style>
      {/* Left content area — flows naturally so eyebrow tracks headline height */}
      <div
        style={{
          position: 'absolute',
          left: 18,
          top: 33,
          width: 320,
          bottom: 82,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: 0,
        }}
      >
        {/* Headline */}
        {showHeadline && wrapBlock('headline', (
          <div
            className="cl-rich-text"
            style={{
              width: 298,
              color: c.headlineColor,
              fontSize: headlineSize,
              fontWeight: 600,
              lineHeight: 1.05,
              wordWrap: 'break-word',
              textShadow: '0px 0px 6px rgba(0, 0, 0, 0.15)',
            }}
          >
            {wrapInline(
              'headline',
              <span dangerouslySetInnerHTML={{ __html: headline || 'Chemical Library' }} />
            )}
          </div>
        ))}

        {/* Eyebrow */}
        {showEyebrow && wrapBlock('eyebrow', (
          <div
            style={{
              color: c.eyebrowColor,
              fontSize: 10.43,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: 1.15,
              wordWrap: 'break-word',
              marginTop: 8,
            }}
          >
            {wrapInline('eyebrow', eyebrow || 'EBOOK')}
          </div>
        ))}

        {/* Spacer to push body text down */}
        <div style={{ flex: 1 }} />

        {/* Body text + Arrow */}
        {showBody && wrapBlock('body', (
          <div
            style={{
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 6,
              display: 'inline-flex',
              marginBottom: 16,
            }}
          >
            <div
              className="cl-rich-text"
              style={{
                width: 210,
                color: c.bodyColor,
                fontSize: 18,
                fontWeight: 350,
                wordWrap: 'break-word',
              }}
            >
              {wrapInline(
                'body',
                <span dangerouslySetInnerHTML={{ __html: body || 'Body text' }} />
              )}
            </div>
            <ArrowIcon
              color={c.arrowColor}
              width={60}
              height={14}
              viewBox="0 0 60 14"
              pathD="M53 1L59 7M59 7L53 13M59 7H1"
              strokeWidth={1.17}
            />
          </div>
        ))}
      </div>

      {/* QR Code container */}
      {wrapBlock('qrCode', (
        <div
          style={{
            width: 213,
            height: 213,
            left: 360,
            top: 17,
            position: 'absolute',
            background: 'white',
            overflow: 'hidden',
          }}
        >
          {qrCodeUrl || hasQrCode ? (
            <img
              src={qrCodeUrl || undefined}
              alt="QR Code"
              data-qr-code="true"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: 7,
              }}
            />
          ) : (
            <div
              style={{
                width: 199.51,
                height: 199.51,
                left: 6.75,
                top: 6.75,
                position: 'absolute',
                background: '#EDEDED',
                overflow: 'hidden',
                border: '0.5px solid #C8C8C8',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  color: '#1E1E1E',
                  fontSize: 6.75,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: 0.74,
                }}
              >
                [place qr code here]
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Bottom bar */}
      <div
        style={{
          width: 590,
          height: 82,
          left: 0,
          top: 248,
          position: 'absolute',
          background: c.bottomBarBg,
          overflow: 'hidden',
          borderTop: `0.5px ${c.bottomBarBorderColor} solid`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingLeft: 26,
          paddingRight: 26,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 117,
            display: 'inline-flex',
          }}
        >
          {/* Powered by pill */}
          <div
            style={{
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              background: c.pillBg,
              borderRadius: 6,
              border: `0.5px ${c.pillBorderColor} solid`,
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 14,
              display: 'flex',
            }}
          >
            <div
              style={{
                color: c.pillTextColor,
                fontSize: 10.43,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 1.15,
                wordWrap: 'break-word',
              }}
            >
              powered by:
            </div>
            <CorityLogo fill={c.logoFill} height={19} />
          </div>

          {/* Footer text */}
          {showFooterText && wrapBlock('footerText', (
            <div
              style={{
                width: 240,
                textAlign: 'right',
                color: c.footerTextColor,
                fontSize: 18,
                fontWeight: 350,
                wordWrap: 'break-word',
              }}
            >
              {wrapInline('footerText', footerText || 'Lorem ipsum')}
            </div>
          ))}
        </div>
      </div>
      {renderOverlay?.()}
    </div>
  )
}
