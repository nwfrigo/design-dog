'use client'

import { CSSProperties } from 'react'
import { getIconByName } from '@/components/IconPickerModal'

export interface CardData {
  icon: string
  title: string
  description: string
}

export interface CardsModuleProps {
  cards: [CardData, CardData, CardData]
  scale?: number
}

export function CardsModule({
  cards,
  scale = 1,
}: CardsModuleProps) {
  const fontFamily = '"Fakt Pro", system-ui, sans-serif'

  const containerStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    gap: 12,
    fontFamily,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  }

  const cardStyle: CSSProperties = {
    flex: '1 1 0',
    padding: 12,
    background: '#F9F9F9',
    borderRadius: 6,
    border: '0.5px solid #D9D8D6',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  }

  const iconContainerStyle: CSSProperties = {
    width: 17,
    height: 17,
  }

  const titleStyle: CSSProperties = {
    color: 'black',
    fontSize: 12,
    fontWeight: 350,
    lineHeight: '16px',
    wordWrap: 'break-word',
  }

  const descriptionStyle: CSSProperties = {
    color: 'black',
    fontSize: 8,
    fontWeight: 350,
    lineHeight: '12px',
    wordWrap: 'break-word',
  }

  return (
    <div style={containerStyle}>
      {cards.map((card, index) => {
        const IconComponent = getIconByName(card.icon)
        return (
          <div key={index} style={cardStyle}>
            <div style={iconContainerStyle}>
              {IconComponent && (
                <IconComponent size={17} strokeWidth={1.5} color="black" />
              )}
            </div>
            <div style={titleStyle}>{card.title}</div>
            <div style={descriptionStyle}>{card.description}</div>
          </div>
        )
      })}
    </div>
  )
}

export default CardsModule
