import { Suspense } from 'react'
import { SolutionOverviewPdfRender } from './render-content'
import type { SolutionCategory } from '@/types'

export default function SolutionOverviewPdfRenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Parse URL params
  const page = (searchParams.page as '1' | '2' | '3' | 'all') || '1'
  const solution = (searchParams.solution as SolutionCategory) || 'health'
  const solutionName = (searchParams.solutionName as string) || 'Employee Health Essentials'
  const tagline = (searchParams.tagline as string) || 'Built for Healthcare. Ready for You.'

  // Page 2 params
  const heroImageId = (searchParams.heroImageId as string) || 'placeholder'
  const heroImageUrl = (searchParams.heroImageUrl as string) || null
  const heroImagePositionX = parseFloat((searchParams.heroImagePositionX as string) || '0')
  const heroImagePositionY = parseFloat((searchParams.heroImagePositionY as string) || '0')
  const heroImageZoom = parseFloat((searchParams.heroImageZoom as string) || '1')
  const heroImageGrayscale = (searchParams.heroImageGrayscale as string) === 'true'
  const page2Header = (searchParams.page2Header as string) || 'Employee Health Essentials'
  const sectionHeader = (searchParams.sectionHeader as string) || 'Streamline Employee Health.\nStrengthen Compliance.'
  const introParagraph = (searchParams.introParagraph as string) || 'Employee Health Essentials offers a streamlined, configurable solution for managing employee health across onboarding, clinic visits, compliance, and exposure tracking.\n\nFor faster deployment, lower admin burden, and stronger compliance — all in one package built for healthcare employee health teams.'

  // Parse key solutions - JSON array or default values
  let keySolutions: string[]
  try {
    const parsed = JSON.parse((searchParams.keySolutions as string) || '[]')
    keySolutions = Array.isArray(parsed) && parsed.length > 0
      ? parsed as string[]
      : ['Clinic Visit Management', 'Candidate Onboarding', 'Exposure & Case Management', 'Immunity & Compliance Tracking']
  } catch {
    keySolutions = ['Clinic Visit Management', 'Candidate Onboarding', 'Exposure & Case Management', 'Immunity & Compliance Tracking']
  }

  const quoteText = (searchParams.quoteText as string) || '"Cority\'s self-scheduling tool has transformed our hiring process. It has provided a more efficient way for candidates and employees to schedule appointments at their convenience, reducing administrative workload and improving overall efficiency."'
  const quoteName = (searchParams.quoteName as string) || 'Mimi Alexander'
  const quoteTitle = (searchParams.quoteTitle as string) || 'RN, Director of Employee Health Services'
  const quoteCompany = (searchParams.quoteCompany as string) || 'Texas Health Resources'

  // Page 3 params
  let benefits
  try {
    benefits = JSON.parse((searchParams.benefits as string) || '[]')
  } catch {
    benefits = [
      { icon: 'streamline', title: 'Streamlined Operations', description: 'Reduce administrative burden with automated workflows and self-service scheduling.' },
      { icon: 'compliance', title: 'Enhanced Compliance', description: 'Stay ahead of regulatory requirements with built-in compliance tracking and reporting.' },
      { icon: 'visibility', title: 'Complete Visibility', description: 'Real-time dashboards and analytics provide insights into employee health trends.' },
    ]
  }

  let features
  try {
    features = JSON.parse((searchParams.features as string) || '[]')
  } catch {
    features = [
      { title: 'Self-Service Scheduling', description: 'Employees book appointments at their convenience.' },
      { title: 'Automated Reminders', description: 'Reduce no-shows with email and SMS notifications.' },
      { title: 'Compliance Dashboards', description: 'Track vaccination and screening compliance in real-time.' },
      { title: 'Integration Ready', description: 'Connect with your existing HR and payroll systems.' },
    ]
  }

  const screenshotUrl = (searchParams.screenshotUrl as string) || null
  const screenshotPositionX = parseFloat((searchParams.screenshotPositionX as string) || '0')
  const screenshotPositionY = parseFloat((searchParams.screenshotPositionY as string) || '0')
  const screenshotZoom = parseFloat((searchParams.screenshotZoom as string) || '1')
  const screenshotGrayscale = (searchParams.screenshotGrayscale as string) === 'true'
  const ctaOption = (searchParams.ctaOption as 'demo' | 'learn' | 'start' | 'contact') || 'demo'
  const ctaUrl = (searchParams.ctaUrl as string) || ''

  return (
    <div
      style={{
        width: 612,
        height: page === 'all' ? 'auto' : 792,
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <SolutionOverviewPdfRender
          page={page}
          solution={solution}
          solutionName={solutionName}
          tagline={tagline}
          heroImageId={heroImageId}
          heroImageUrl={heroImageUrl}
          heroImagePosition={{ x: heroImagePositionX, y: heroImagePositionY }}
          heroImageZoom={heroImageZoom}
          heroImageGrayscale={heroImageGrayscale}
          page2Header={page2Header}
          sectionHeader={sectionHeader}
          introParagraph={introParagraph}
          keySolutions={keySolutions}
          quoteText={quoteText}
          quoteName={quoteName}
          quoteTitle={quoteTitle}
          quoteCompany={quoteCompany}
          benefits={benefits}
          features={features}
          screenshotUrl={screenshotUrl}
          screenshotPosition={{ x: screenshotPositionX, y: screenshotPositionY }}
          screenshotZoom={screenshotZoom}
          screenshotGrayscale={screenshotGrayscale}
          ctaOption={ctaOption}
          ctaUrl={ctaUrl}
        />
      </Suspense>
    </div>
  )
}
