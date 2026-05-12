/**
 * Single source of truth for which templates render the Stage & Bench editor
 * vs. the legacy sidebar-form editor. EditorScreen reads this set and
 * dispatches accordingly. As templates migrate, add their key here.
 *
 * When this set covers every single-page template, the legacy EditorScreen
 * code path becomes unreachable and can be deleted in one cleanup pass.
 */

import type { TemplateType } from '@/types'

export const STAGE_BENCH_TEMPLATES = new Set<TemplateType>([
  'email-dark-gradient',
  'email-image',
  'email-speakers',
  'email-cority-connect-2026',
  'website-floating-banner-mobile',
  'website-floating-banner',
  'email-cority-customer-exchange-banner',
  'website-press-release',
  'social-dark-gradient',
  'social-blue-gradient',
  'social-ehs-accelerate',
  'social-image',
  'social-image-meddbase',
  'newsletter-dark-gradient',
  'newsletter-blue-gradient',
  'newsletter-light',
  'website-thumbnail',
  'website-report',
  'website-webinar',
])

export function isStageBenchTemplate(template: TemplateType): boolean {
  return STAGE_BENCH_TEMPLATES.has(template)
}
