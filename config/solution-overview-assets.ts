// Solution Overview PDF Asset Configuration
// Central config for all picklist assets used in the solution overview template

export type SolutionCategory = 'environmental' | 'health' | 'safety' | 'quality' | 'sustainability' | 'converged'

// Solution category configuration (colors, labels, backgrounds)
// ORDER MATTERS: environmental, health, safety, quality, sustainability, converged
export const solutionCategories: Record<SolutionCategory, {
  label: string
  color: string
  background: string
}> = {
  environmental: {
    label: 'Environmental',
    color: '#49763E',
    background: '/assets/backgrounds/so-backgrounds/environmental_so_background_2.png',
  },
  health: {
    label: 'Health',
    color: '#00767F',
    background: '/assets/backgrounds/so-backgrounds/health_so_background_2.png',
  },
  safety: {
    label: 'Safety',
    color: '#C3B01E',
    background: '/assets/backgrounds/so-backgrounds/safety_so_background_2.png',
  },
  quality: {
    label: 'Quality',
    color: '#006FA3',
    background: '/assets/backgrounds/so-backgrounds/quality_so_background_2.png',
  },
  sustainability: {
    label: 'Sustainability',
    color: '#A61F67',
    background: '/assets/backgrounds/so-backgrounds/sustainability_so_background_2.png',
  },
  converged: {
    label: 'Converged',
    color: '#D35F0B',
    background: '/assets/backgrounds/so-backgrounds/converged_so_background_2.png',
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
  { id: 'placeholder', label: 'Placeholder image', src: '/assets/solution-overview/hero-images/sustainability_so__3.png' },
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

// Benefit icons for Page 3
// Each icon is referenced by ID and rendered via BenefitIcon component in Page3BenefitsFeatures
export interface BenefitIconOption {
  id: string
  label: string
}

export const benefitIcons: BenefitIconOption[] = [
  { id: 'streamline', label: 'Streamline' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'visibility', label: 'Visibility' },
  { id: 'security', label: 'Security' },
  { id: 'time', label: 'Time' },
  { id: 'growth', label: 'Growth' },
  { id: 'integration', label: 'Integration' },
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
  solutionName: 'Solution Name Goes Here',
  tagline: 'Subheader Goes Here',

  // Page 2
  page2Header: 'Heading 1',
  sectionHeader: 'Heading 2',
  introParagraph: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque porta tincidunt tellus, nec tincidunt diam pretium aliquet. Fusce sit amet orci iaculis justo dictum bibendum at venenatis justo. Aenean ac sodales tellus.\n\nAenean nulla augue, posuere in libero in, accumsan tempor erat. Phasellus aliquet diam dui, ac fermentum',
  keySolutions: [
    'Solution Name',
    'Solution Name',
    'Solution Name',
    'Solution Name',
    'Solution Name',
    'Solution Name',
  ] as [string, string, string, string, string, string],
  quoteText: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque porta tincidunt tellus, nec tincidunt, Phasellus aliquet diam dui, ac fermentum"',
  quoteName: 'Firstname Lastname',
  quoteTitle: 'Job title',
  quoteCompany: 'Organization',

  // Page 3 - icons are Lucide icon names
  benefits: [
    {
      icon: 'zap',
      title: 'Item Header Goes Here',
      description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus. Vestibulum vel tristique orci. Donec ornare in velit id ornare.',
    },
    {
      icon: 'clipboard-check',
      title: 'Item Header Goes Here',
      description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus. Vestibulum vel tristique orci. Donec ornare in velit id ornare.',
    },
    {
      icon: 'eye',
      title: 'Item Header Goes Here',
      description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus. Vestibulum vel tristique orci. Donec ornare in velit id ornare.',
    },
    {
      icon: 'shield-check',
      title: 'Item Header Goes Here',
      description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus. Vestibulum vel tristique orci. Donec ornare in velit id ornare.',
    },
    {
      icon: 'clock',
      title: 'Item Header Goes Here',
      description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus. Vestibulum vel tristique orci. Donec ornare in velit id ornare.',
    },
  ],
  features: [
    {
      title: 'Item Header Goes Here',
      description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus.',
    },
    {
      title: 'Item Header Goes Here',
      description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus.',
    },
    {
      title: 'Item Header Goes Here',
      description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus.',
    },
    {
      title: 'Item Header Goes Here',
      description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus.',
    },
    {
      title: 'Item Header Goes Here',
      description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus.',
    },
    {
      title: 'Item Header Goes Here',
      description: 'Maecenas nec ultricies nibh. Fusce non dui nec erat commodo aliquet quis id quam. Donec et venenatis metus.',
    },
  ],
}
