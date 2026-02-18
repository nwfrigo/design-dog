import { Suspense } from 'react'
import { BusinessCardFrontRender } from './render-content'
import { businessCardPixels } from '@/config/print-config'

export default function RenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Parse params on server
  const name = (searchParams.name as string) || 'Your Name'
  const title = (searchParams.title as string) || 'Your Title'
  const email = (searchParams.email as string) || 'email@cority.com'
  const phone = (searchParams.phone as string) || '555-123-4567'

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
        <BusinessCardFrontRender
          name={name}
          title={title}
          email={email}
          phone={phone}
        />
      </Suspense>
    </div>
  )
}
