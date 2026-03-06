import { Suspense } from 'react'
import { SolutionOverviewPdfRender } from './render-content'
import type { SolutionCategory } from '@/types'
import { parseString, parseStringOrNull, parseNumber, parseBoolFalse, parseEnum } from '@/lib/render-params'

export default function SolutionOverviewPdfRenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Parse URL params
  const page = parseEnum<'1' | '2' | '3' | 'all'>(searchParams, 'page', '1')
  const solution = parseString(searchParams, 'solution', 'health') as SolutionCategory
  const solutionName = parseString(searchParams, 'solutionName', 'Employee Health Essentials')
  const tagline = parseString(searchParams, 'tagline', 'Built for Healthcare. Ready for You.')

  // Page 2 params
  const heroImageId = parseString(searchParams, 'heroImageId', 'placeholder')
  const heroImageUrl = parseStringOrNull(searchParams, 'heroImageUrl')
  const heroImagePositionX = parseNumber(searchParams, 'heroImagePositionX', 0)
  const heroImagePositionY = parseNumber(searchParams, 'heroImagePositionY', 0)
  const heroImageZoom = parseNumber(searchParams, 'heroImageZoom', 1)
  const heroImageGrayscale = parseBoolFalse(searchParams, 'heroImageGrayscale')
  const page2Header = parseString(searchParams, 'page2Header', 'Employee Health Essentials')
  const sectionHeader = parseString(searchParams, 'sectionHeader', 'Streamline Employee Health.\nStrengthen Compliance.')
  const introParagraph = parseString(searchParams, 'introParagraph', 'Employee Health Essentials offers a streamlined, configurable solution for managing employee health across onboarding, clinic visits, compliance, and exposure tracking.\n\nFor faster deployment, lower admin burden, and stronger compliance — all in one package built for healthcare employee health teams.')

  // Parse key solutions - JSON array or default values
  let keySolutions: string[]
  try {
    const parsed = JSON.parse(parseString(searchParams, 'keySolutions', '[]'))
    keySolutions = Array.isArray(parsed) && parsed.length > 0
      ? parsed as string[]
      : ['Clinic Visit Management', 'Candidate Onboarding', 'Exposure & Case Management', 'Immunity & Compliance Tracking']
  } catch {
    keySolutions = ['Clinic Visit Management', 'Candidate Onboarding', 'Exposure & Case Management', 'Immunity & Compliance Tracking']
  }

  const quoteText = parseString(searchParams, 'quoteText', '"Cority\'s self-scheduling tool has transformed our hiring process. It has provided a more efficient way for candidates and employees to schedule appointments at their convenience, reducing administrative workload and improving overall efficiency."')
  const quoteName = parseString(searchParams, 'quoteName', 'Mimi Alexander')
  const quoteTitle = parseString(searchParams, 'quoteTitle', 'RN, Director of Employee Health Services')
  const quoteCompany = parseString(searchParams, 'quoteCompany', 'Texas Health Resources')

  // Page 2 footer stats
  const stat1Value = parseString(searchParams, 'stat1Value', '20+')
  const stat1Label = parseString(searchParams, 'stat1Label', 'Awards')
  const stat2Value = parseString(searchParams, 'stat2Value', '350+')
  const stat2Label = parseString(searchParams, 'stat2Label', 'Experts')
  const stat3Value = parseString(searchParams, 'stat3Value', '100%')
  const stat3Label = parseString(searchParams, 'stat3Label', 'Deployment')
  const stat4Value = parseString(searchParams, 'stat4Value', '2M+')
  const stat4Label = parseString(searchParams, 'stat4Label', 'End Users')
  const stat5Value = parseString(searchParams, 'stat5Value', '1.2K')
  const stat5Label = parseString(searchParams, 'stat5Label', 'Clients')

  // Page 3 params - benefits array or defaults
  let benefits
  try {
    const parsedBenefits = JSON.parse(parseString(searchParams, 'benefits', '[]'))
    benefits = Array.isArray(parsedBenefits) && parsedBenefits.length > 0
      ? parsedBenefits
      : [
          { icon: 'streamline', title: 'Streamlined Operations', description: 'Reduce administrative burden with automated workflows and self-service scheduling.' },
          { icon: 'compliance', title: 'Enhanced Compliance', description: 'Stay ahead of regulatory requirements with built-in compliance tracking and reporting.' },
          { icon: 'visibility', title: 'Complete Visibility', description: 'Real-time dashboards and analytics provide insights into employee health trends.' },
        ]
  } catch {
    benefits = [
      { icon: 'streamline', title: 'Streamlined Operations', description: 'Reduce administrative burden with automated workflows and self-service scheduling.' },
      { icon: 'compliance', title: 'Enhanced Compliance', description: 'Stay ahead of regulatory requirements with built-in compliance tracking and reporting.' },
      { icon: 'visibility', title: 'Complete Visibility', description: 'Real-time dashboards and analytics provide insights into employee health trends.' },
    ]
  }

  // Page 3 params - features array or defaults
  let features
  try {
    const parsedFeatures = JSON.parse(parseString(searchParams, 'features', '[]'))
    features = Array.isArray(parsedFeatures) && parsedFeatures.length > 0
      ? parsedFeatures
      : [
          { title: 'Self-Service Scheduling', description: 'Employees book appointments at their convenience.' },
          { title: 'Automated Reminders', description: 'Reduce no-shows with email and SMS notifications.' },
          { title: 'Compliance Dashboards', description: 'Track vaccination and screening compliance in real-time.' },
          { title: 'Integration Ready', description: 'Connect with your existing HR and payroll systems.' },
        ]
  } catch {
    features = [
      { title: 'Self-Service Scheduling', description: 'Employees book appointments at their convenience.' },
      { title: 'Automated Reminders', description: 'Reduce no-shows with email and SMS notifications.' },
      { title: 'Compliance Dashboards', description: 'Track vaccination and screening compliance in real-time.' },
      { title: 'Integration Ready', description: 'Connect with your existing HR and payroll systems.' },
    ]
  }

  const screenshotUrl = parseStringOrNull(searchParams, 'screenshotUrl')
  const screenshotPositionX = parseNumber(searchParams, 'screenshotPositionX', 0)
  const screenshotPositionY = parseNumber(searchParams, 'screenshotPositionY', 0)
  const screenshotZoom = parseNumber(searchParams, 'screenshotZoom', 1)
  const screenshotGrayscale = parseBoolFalse(searchParams, 'screenshotGrayscale')
  const ctaOption = parseEnum<'demo' | 'learn' | 'start' | 'contact'>(searchParams, 'ctaOption', 'demo')
  const ctaUrl = parseString(searchParams, 'ctaUrl', '')

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
          stat1Value={stat1Value}
          stat1Label={stat1Label}
          stat2Value={stat2Value}
          stat2Label={stat2Label}
          stat3Value={stat3Value}
          stat3Label={stat3Label}
          stat4Value={stat4Value}
          stat4Label={stat4Label}
          stat5Value={stat5Value}
          stat5Label={stat5Label}
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
