import { Suspense } from 'react'
import { StackerPdfRender } from './render-content'
import type { StackerModule } from '@/types'

export default function StackerPdfRenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Parse modules JSON
  let modules: StackerModule[] = []
  try {
    const modulesJson = searchParams.modules as string
    if (modulesJson) {
      const parsed = JSON.parse(decodeURIComponent(modulesJson))
      if (Array.isArray(parsed)) {
        modules = parsed
      }
    }
  } catch (e) {
    console.error('Failed to parse modules JSON:', e)
  }

  // Parse module spacing
  let moduleSpacing: Record<string, number> = {}
  try {
    const spacingJson = searchParams.moduleSpacing as string
    if (spacingJson) {
      const parsed = JSON.parse(decodeURIComponent(spacingJson))
      if (parsed && typeof parsed === 'object') {
        moduleSpacing = parsed
      }
    }
  } catch (e) {
    console.error('Failed to parse moduleSpacing JSON:', e)
  }

  // If no modules provided, use default placeholder
  if (modules.length === 0) {
    modules = [
      {
        id: 'logo-chip-default',
        type: 'logo-chip',
        showChips: true,
        activeCategories: ['safety'],
      },
      {
        id: 'header-default',
        type: 'header',
        heading: 'Document Title',
        headingSize: 'h1',
        subheader: 'Subheader text',
        showSubheader: true,
        cta: 'Learn More',
        ctaUrl: '',
        showCta: false,
      },
      {
        id: 'footer-default',
        type: 'footer',
        stat1Value: '27,000+',
        stat1Label: 'Global Customers',
        stat2Value: '100+',
        stat2Label: 'Countries',
        stat3Value: '1M+',
        stat3Label: 'Daily Users',
        stat4Value: '200K+',
        stat4Label: 'Daily Actions',
        stat5Value: '15+',
        stat5Label: 'Years',
      },
    ]
  }

  return (
    <div
      style={{
        width: 612,
        height: 'auto',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <StackerPdfRender modules={modules} moduleSpacing={moduleSpacing} />
      </Suspense>
    </div>
  )
}
