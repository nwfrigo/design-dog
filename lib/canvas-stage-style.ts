/**
 * Shared visual constants for the editor Stage (the design-preview surface).
 */

/**
 * Hairline edge around the design canvas — a 1px outset ring at the stage's
 * visual edge. Subtle enough to vanish against dark templates, gives separation
 * on light ones.
 *
 * Single source for both ScaledStage (standard templates) and CustomSizeStage
 * (custom-size's bespoke stage), so the canvas edge can't drift between them.
 */
export const STAGE_EDGE_SHADOW = '0 0 0 1px rgba(0,0,0,0.08)'
