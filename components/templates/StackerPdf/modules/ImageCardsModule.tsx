'use client'

import { CSSProperties } from 'react'

export interface ImageCardData {
  imageUrl: string | null
  imagePan: { x: number; y: number }
  imageZoom: number
  eyebrow: string
  showEyebrow: boolean
  title: string
  body: string
}

export interface ImageCardsModuleProps {
  heading: string
  showHeading: boolean
  cards: [ImageCardData, ImageCardData, ImageCardData]
  showCard3: boolean
  grayscale: boolean
  scale?: number
}

export function ImageCardsModule({
  heading,
  showHeading,
  cards,
  showCard3,
  grayscale,
  scale = 1,
}: ImageCardsModuleProps) {
  const fontFamily = '"Fakt Pro", system-ui, sans-serif'

  const containerStyle: CSSProperties = {
    width: '100%',
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
    fontFamily,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  }

  const headingStyle: CSSProperties = {
    alignSelf: 'stretch',
    textAlign: 'center',
    color: 'black',
    fontSize: 18,
    fontWeight: 350,
    wordWrap: 'break-word',
  }

  const cardsRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 12,
  }

  const cardStyle: CSSProperties = {
    overflow: 'hidden',
    borderRadius: 6,
    border: '0.5px solid #D9D8D6',
    display: 'flex',
    flexDirection: 'column',
  }

  const imageStyle = (card: ImageCardData): CSSProperties => ({
    width: 180,
    height: 100,
    backgroundColor: '#f5f5f5',
    backgroundImage: card.imageUrl ? `url(${card.imageUrl})` : undefined,
    backgroundSize: `${card.imageZoom * 100}%`,
    backgroundPosition: `${50 + card.imagePan.x}% ${50 + card.imagePan.y}%`,
    backgroundRepeat: 'no-repeat',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    filter: grayscale ? 'grayscale(100%)' : undefined,
  })

  const contentStyle: CSSProperties = {
    width: 180,
    padding: 12,
    background: '#F9F9F9',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  }

  const eyebrowStyle: CSSProperties = {
    color: 'black',
    fontSize: 8,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 0.88,
    wordWrap: 'break-word',
  }

  const titleStyle: CSSProperties = {
    color: 'black',
    fontSize: 12,
    fontWeight: 350,
    lineHeight: '16px',
    wordWrap: 'break-word',
  }

  const bodyStyle: CSSProperties = {
    color: 'black',
    fontSize: 8,
    fontWeight: 350,
    lineHeight: '12px',
    wordWrap: 'break-word',
  }

  const visibleCards = showCard3 ? cards : cards.slice(0, 2)

  return (
    <div style={containerStyle}>
      {showHeading && heading && (
        <div style={headingStyle}>{heading}</div>
      )}

      <div style={cardsRowStyle}>
        {visibleCards.map((card, index) => (
          <div key={index} style={cardStyle}>
            <div style={imageStyle(card)} />
            <div style={contentStyle}>
              {card.showEyebrow && card.eyebrow && (
                <div style={eyebrowStyle}>{card.eyebrow}</div>
              )}
              <div style={titleStyle}>{card.title}</div>
              <div style={bodyStyle}>{card.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImageCardsModule
