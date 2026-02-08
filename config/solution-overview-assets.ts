// Solution Overview PDF Asset Configuration
// Central config for all picklist assets used in the solution overview template

export type SolutionCategory = 'health' | 'safety' | 'environmental' | 'quality' | 'sustainability'

// Solution category configuration (colors, labels, backgrounds)
export const solutionCategories: Record<SolutionCategory, {
  label: string
  color: string
  background: string
}> = {
  health: {
    label: 'Health',
    color: '#00767F',
    background: '/assets/backgrounds/health_so_background_1.png',
  },
  safety: {
    label: 'Safety',
    color: '#FF6B00',
    background: '/assets/solution-overview/bg-safety.png',
  },
  environmental: {
    label: 'Environmental',
    color: '#4CAF50',
    background: '/assets/solution-overview/bg-environmental.png',
  },
  quality: {
    label: 'Quality',
    color: '#9C27B0',
    background: '/assets/solution-overview/bg-quality.png',
  },
  sustainability: {
    label: 'Sustainability',
    color: '#2196F3',
    background: '/assets/solution-overview/bg-sustainability.png',
  },
}

// Hero images for Page 2 (picklist - single placeholder for now)
// Will expand to 20-30 images later
export interface HeroImage {
  id: string
  label: string
  src: string
}

export const heroImages: HeroImage[] = [
  { id: 'placeholder', label: 'Placeholder image', src: '/assets/images/solution_overview_placeholder_hero_1.png' },
]

// CTA button options for Page 3
export interface CtaOption {
  id: string
  label: string
}

export const ctaOptions: CtaOption[] = [
  { id: 'demo', label: 'Request a demo' },
  { id: 'learn', label: 'Learn more' },
  { id: 'start', label: 'Get started' },
  { id: 'contact', label: 'Contact us' },
]

// Placeholder icons for benefits (swap for real icon library later)
// Each icon is referenced by ID and rendered via IconPicker component
export interface BenefitIcon {
  id: string
  label: string
}

export const benefitIcons: BenefitIcon[] = [
  { id: 'pricing', label: 'Pricing' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'admin', label: 'Admin' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'reporting', label: 'Reporting' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'shield', label: 'Shield' },
  { id: 'chart', label: 'Chart' },
  { id: 'users', label: 'Users' },
  { id: 'settings', label: 'Settings' },
  { id: 'check', label: 'Checkmark' },
  { id: 'clock', label: 'Clock' },
  { id: 'document', label: 'Document' },
  { id: 'folder', label: 'Folder' },
  { id: 'globe', label: 'Globe' },
  { id: 'heart', label: 'Heart' },
  { id: 'lightbulb', label: 'Lightbulb' },
  { id: 'lock', label: 'Lock' },
  { id: 'mail', label: 'Mail' },
  { id: 'mobile', label: 'Mobile' },
]

// Footer contact info (locked - not editable by users)
export const footerContactInfo = {
  phone: '+1 (800) 276-9120',
  email: 'info@cority.com',
  website: 'cority.com/solutions',
}

// Default content for new solution overviews
export const defaultSolutionOverviewContent = {
  // Page 1
  solutionName: 'Employee Health Essentials',
  tagline: 'Built for Healthcare. Ready for You.',

  // Page 2
  sectionHeader: 'Streamline Employee Health.\nStrengthen Compliance.',
  introParagraph: 'Employee Health Essentials offers a streamlined, configurable solution for managing employee health across onboarding, clinic visits, compliance, and exposure tracking.\n\nFor faster deployment, lower admin burden, and stronger compliance — all in one package built for healthcare employee health teams.',
  keySolutions: [
    'Clinic Visit Management',
    'Candidate Onboarding',
    'Exposure & Case Management',
    'Immunity & Compliance Tracking',
    'Lab & Drug Test Management',
    'Dashboards & Reporting',
  ] as [string, string, string, string, string, string],
  quoteText: '"Cority\'s self-scheduling tool has transformed our hiring process. It has provided a more efficient way for candidates and employees to schedule appointments at their convenience, reducing administrative workload and improving overall efficiency."',
  quoteName: 'Mimi Alexander',
  quoteTitle: 'RN, Director of Employee Health Services',
  quoteCompany: 'Texas Health Resources',

  // Page 3
  benefits: [
    {
      icon: 'pricing',
      title: 'Affordable, Right-Sized Pricing',
      description: 'Designed to fit mid-market budgets, the Employee Health Essentials Package delivers core health capabilities without the enterprise price tag — making adoption realistic for hospitals under cost pressure.',
    },
    {
      icon: 'workflow',
      title: 'Pre-Configured, Ready-to-Use Workflows',
      description: 'Out-of-the-box workflows for exposures, pre-employment, and immunizations help hospitals go live quickly. Limited but flexible customization options keep costs down while allowing teams to adapt to their specific needs.',
    },
    {
      icon: 'admin',
      title: 'Reduced Administrative Burden',
      description: 'By replacing paper charts and disconnected EHR add-ons, the solution automates scheduling, surveillance, and record-keeping — freeing clinical staff to focus on care instead of clerical work.',
    },
    {
      icon: 'compliance',
      title: 'Built-In Compliance Support',
      description: 'Compliance with OSHA, NHSN, and Joint Commission is embedded into the workflows, reducing the risk of errors, fines, or failed audits while saving teams the hassle of manual tracking.',
    },
    {
      icon: 'reporting',
      title: 'Actionable Reporting & Dashboards',
      description: 'Standardized dashboards and configurable reports give clinicians and executives the visibility they need to track workforce health, demonstrate compliance, and prove ROI.',
    },
  ],
  features: [
    {
      title: 'Clinic Visit',
      description: 'Efficiently manage clinic visits with automated scheduling and documentation workflows - reducing administrative burden while supporting key evaluations like pre-employment, surveillance, wellness, and return-to-work.',
    },
    {
      title: 'Exposure & Case Management',
      description: 'Automate exposure tracking and case management with standard workflows and questionnaires to improve response time and compliance.',
    },
    {
      title: 'Immunity & Compliance Tracking',
      description: 'Track and manage employee immunity and compliance with built-in workflows for vaccinations, surveillance, and regulatory protocols — helping teams stay audit-ready while reducing manual tracking.',
    },
    {
      title: 'Business Intelligence & Analytics',
      description: 'Accurately track metrics and uncover key insights to help you make the best decisions to manage health risks.',
    },
    {
      title: 'Mobile Solutions',
      description: 'Drive better workforce engagement with mobile enabled self-scheduling and access to wellness indicators.',
    },
  ],
}
