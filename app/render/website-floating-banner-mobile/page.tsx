import { Suspense } from 'react'
import { RenderContent } from './render-content'

export default function WebsiteFloatingBannerMobilePage() {
  return (
    <div style={{
      width: 580,
      height: 80,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
    }}>
      <Suspense fallback={<div style={{ width: 580, height: 80 }}>Loading...</div>}>
        <RenderContent />
      </Suspense>
    </div>
  )
}
