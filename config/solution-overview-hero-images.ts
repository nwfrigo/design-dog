// Solution Overview Hero Image Library
// Images organized by solution category for the Page 2 hero section

import type { SolutionCategory } from '@/types'

export interface HeroLibraryImage {
  id: string
  url: string
  category: Exclude<SolutionCategory, 'converged'> // converged uses all categories
}

// Base path for hero images
const BASE_PATH = '/assets/solution-overview/hero-images'

// Generate image entries for each category
function generateCategoryImages(category: Exclude<SolutionCategory, 'converged'>, count: number): HeroLibraryImage[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${category}_so__${i + 1}`,
    url: `${BASE_PATH}/${category}_so__${i + 1}.png`,
    category,
  }))
}

// All hero images organized by category
export const solutionOverviewHeroImages: HeroLibraryImage[] = [
  ...generateCategoryImages('environmental', 9),
  ...generateCategoryImages('health', 9),
  ...generateCategoryImages('quality', 9),
  ...generateCategoryImages('safety', 9),
  ...generateCategoryImages('sustainability', 9),
]

// Get images for a specific solution category
// For 'converged', returns all images
// For others, returns that category first, then remaining categories
export function getHeroImagesForSolution(solution: SolutionCategory): HeroLibraryImage[] {
  if (solution === 'converged') {
    return solutionOverviewHeroImages
  }

  const categoryImages = solutionOverviewHeroImages.filter(img => img.category === solution)
  const otherImages = solutionOverviewHeroImages.filter(img => img.category !== solution)

  return [...categoryImages, ...otherImages]
}

// Category labels for display
export const heroCategoryLabels: Record<Exclude<SolutionCategory, 'converged'>, string> = {
  environmental: 'Environmental',
  health: 'Health',
  quality: 'Quality',
  safety: 'Safety',
  sustainability: 'Sustainability',
}
