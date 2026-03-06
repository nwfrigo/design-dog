'use client'

import { CSSProperties } from 'react'
import type { SolutionCategory } from '@/types'
import { solutionCategories } from '@/config/solution-overview-assets'
import { CorityLogo } from '@/components/shared/CorityLogo'

// All solution categories for the pill list
const allCategories: SolutionCategory[] = ['environmental', 'health', 'safety', 'quality', 'sustainability']

export interface Page1CoverProps {
  solution: SolutionCategory
  solutionName: string
  tagline: string
  scale?: number
}

export function Page1Cover({
  solution,
  solutionName,
  tagline,
  scale = 1,
}: Page1CoverProps) {
  const fontFamily = '"Fakt Pro", system-ui, sans-serif'
  const activeSolutionConfig = solutionCategories[solution]

  const containerStyle: CSSProperties = {
    width: 612,
    height: 792,
    position: 'relative',
    background: '#060015',
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  return (
    <div style={containerStyle}>
      {/* Background image placeholder - will be solution-specific */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${activeSolutionConfig.background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          opacity: 1,
        }}
      />

      {/* Cority Logo - top left */}
      <div
        style={{
          position: 'absolute',
          left: 54,
          top: 65,
        }}
      >
        <CorityLogo fill="#FFFFFF" height={26} />
      </div>

      {/* Solution Category Pills - left side */}
      <div
        style={{
          position: 'absolute',
          left: 54,
          top: 159,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 10,
        }}
      >
        {allCategories.map((category) => {
          // For 'converged', all chips are active; otherwise only the matching one
          const isActive = solution === 'converged' || category === solution
          const config = solutionCategories[category]

          return (
            <div
              key={category}
              style={{
                paddingTop: 10.55,
                paddingBottom: 10.55,
                paddingLeft: 10.55,
                paddingRight: 10.55,
                background: isActive ? 'rgba(0, 127, 255, 0.10)' : 'transparent',
                borderRadius: 4.39,
                border: isActive ? '0.44px solid #0080FF' : '0.44px solid #37393D',
                display: 'inline-flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 9.67,
              }}
            >
              <div
                style={{
                  width: 10.55,
                  height: 10.55,
                  background: isActive ? config.color : '#37393D',
                  borderRadius: 1.76,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  color: isActive ? 'white' : '#37393D',
                  fontSize: 8,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: 0.88,
                  whiteSpace: 'nowrap',
                }}
              >
                {config.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Solution Name + Tagline - bottom left, flex container */}
      <div
        style={{
          position: 'absolute',
          left: 54,
          top: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Solution Name */}
        <div
          style={{
            width: 474,
            color: 'white',
            fontSize: 36,
            fontWeight: 350,
            wordWrap: 'break-word',
            lineHeight: 1.2,
          }}
        >
          {solutionName || 'Solution Name'}
        </div>

        {/* Tagline */}
        <div
          style={{
            width: 295,
            color: 'white',
            fontSize: 12,
            fontWeight: 350,
            lineHeight: '16px',
            wordWrap: 'break-word',
          }}
        >
          {tagline || 'Built for Healthcare. Ready for You.'}
        </div>
      </div>
    </div>
  )
}

export default Page1Cover
