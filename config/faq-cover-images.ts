// FAQ Cover Image Library
// Images organized by solution category for the FAQ cover page

import type { SolutionCategory } from '@/types'

export interface FaqCoverLibraryImage {
  id: string
  url: string
  category: Exclude<SolutionCategory, 'converged'> // converged uses all categories
}

// Base path for FAQ cover images
const BASE_PATH = '/assets/faq/cover-images'

// Images follow naming convention: {category}_faq_{number}.png
export const faqCoverImages: FaqCoverLibraryImage[] = [
  // Environmental
  { id: 'environmental_faq_1', url: `${BASE_PATH}/environmental_faq_1.png`, category: 'environmental' },
  { id: 'environmental_faq_2', url: `${BASE_PATH}/environmental_faq_2.png`, category: 'environmental' },
  { id: 'environmental_faq_3', url: `${BASE_PATH}/environmental_faq_3.png`, category: 'environmental' },
  // Health
  { id: 'health_faq_1', url: `${BASE_PATH}/health_faq_1.png`, category: 'health' },
  { id: 'health_faq_2', url: `${BASE_PATH}/health_faq_2.png`, category: 'health' },
  { id: 'health_faq_3', url: `${BASE_PATH}/health_faq_3.png`, category: 'health' },
  // Quality
  { id: 'quality_faq_1', url: `${BASE_PATH}/quality_faq_1.png`, category: 'quality' },
  { id: 'quality_faq_2', url: `${BASE_PATH}/quality_faq_2.png`, category: 'quality' },
  { id: 'quality_faq_3', url: `${BASE_PATH}/quality_faq_3.png`, category: 'quality' },
  // Safety
  { id: 'safety_faq_1', url: `${BASE_PATH}/safety_faq_1.png`, category: 'safety' },
  { id: 'safety_faq_2', url: `${BASE_PATH}/safety_faq_2.png`, category: 'safety' },
  { id: 'safety_faq_3', url: `${BASE_PATH}/safety_faq_3.png`, category: 'safety' },
  // Sustainability
  { id: 'sustainability_faq_1', url: `${BASE_PATH}/sustainability_faq_1.png`, category: 'sustainability' },
  { id: 'sustainability_faq_2', url: `${BASE_PATH}/sustainability_faq_2.png`, category: 'sustainability' },
  { id: 'sustainability_faq_3', url: `${BASE_PATH}/sustainability_faq_3.png`, category: 'sustainability' },
]

// Get images for a specific solution category
// For 'converged', returns all images
// For others, returns that category first, then remaining categories
export function getFaqCoverImagesForSolution(solution: SolutionCategory): FaqCoverLibraryImage[] {
  if (solution === 'converged') {
    return faqCoverImages
  }

  const categoryImages = faqCoverImages.filter(img => img.category === solution)
  const otherImages = faqCoverImages.filter(img => img.category !== solution)

  return [...categoryImages, ...otherImages]
}

// Category labels for display
export const faqCoverCategoryLabels: Record<Exclude<SolutionCategory, 'converged'>, string> = {
  environmental: 'Environmental',
  health: 'Health',
  quality: 'Quality',
  safety: 'Safety',
  sustainability: 'Sustainability',
}
