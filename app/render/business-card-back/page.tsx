import { Suspense } from 'react'
import { BusinessCardBackRender } from './render-content'
import { businessCardPixels } from '@/config/print-config'

export default function RenderPage() {
  // Back is static - no params needed

  return (
    <div style={{
      width: businessCardPixels.baseWidth,
      height: businessCardPixels.baseHeight,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: '#060015',
    }}>
      <Suspense fallback={<div style={{ width: businessCardPixels.baseWidth, height: businessCardPixels.baseHeight, background: '#060015' }}>Loading...</div>}>
        <BusinessCardBackRender />
      </Suspense>
    </div>
  )
}
