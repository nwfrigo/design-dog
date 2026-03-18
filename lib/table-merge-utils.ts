import type { MergedRegion } from '@/types'

export interface CellInfo {
  // 'anchor' = top-left of a merge region (renders with rowSpan/colSpan)
  // 'hidden' = covered by another merge (skip rendering)
  // 'normal' = regular unmerged cell
  type: 'anchor' | 'hidden' | 'normal'
  rowSpan: number
  colSpan: number
  // For hidden cells, points to the anchor that covers them
  anchorRow?: number
  anchorCol?: number
}

/**
 * Build a 2D grid map describing each cell's merge status.
 */
export function buildCellMap(
  rows: number,
  cols: number,
  mergedCells: MergedRegion[] = []
): CellInfo[][] {
  // Initialize all cells as normal
  const map: CellInfo[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ type: 'normal' as const, rowSpan: 1, colSpan: 1 }))
  )

  for (const region of mergedCells) {
    const { row, col, rowSpan, colSpan } = region
    // Mark anchor cell
    if (row < rows && col < cols) {
      map[row][col] = { type: 'anchor', rowSpan, colSpan }
    }
    // Mark hidden cells
    for (let r = row; r < row + rowSpan && r < rows; r++) {
      for (let c = col; c < col + colSpan && c < cols; c++) {
        if (r === row && c === col) continue // skip anchor
        map[r][c] = { type: 'hidden', rowSpan: 1, colSpan: 1, anchorRow: row, anchorCol: col }
      }
    }
  }

  return map
}

export interface SelectionRect {
  minRow: number
  maxRow: number
  minCol: number
  maxCol: number
}

/**
 * Normalize two corner points into a rectangle.
 */
export function getSelectionRect(
  start: { row: number; col: number },
  end: { row: number; col: number }
): SelectionRect {
  return {
    minRow: Math.min(start.row, end.row),
    maxRow: Math.max(start.row, end.row),
    minCol: Math.min(start.col, end.col),
    maxCol: Math.max(start.col, end.col),
  }
}

/**
 * If a selection partially overlaps an existing merge, expand the selection
 * to fully contain it. Iterates until stable.
 */
export function expandSelectionToContainMerges(
  rect: SelectionRect,
  mergedCells: MergedRegion[] = []
): SelectionRect {
  let { minRow, maxRow, minCol, maxCol } = rect
  let changed = true

  while (changed) {
    changed = false
    for (const region of mergedCells) {
      const rEnd = region.row + region.rowSpan - 1
      const cEnd = region.col + region.colSpan - 1

      // Check if the region overlaps the selection at all
      const overlaps =
        region.row <= maxRow && rEnd >= minRow &&
        region.col <= maxCol && cEnd >= minCol

      if (overlaps) {
        // Expand selection to fully contain this region
        if (region.row < minRow) { minRow = region.row; changed = true }
        if (rEnd > maxRow) { maxRow = rEnd; changed = true }
        if (region.col < minCol) { minCol = region.col; changed = true }
        if (cEnd > maxCol) { maxCol = cEnd; changed = true }
      }
    }
  }

  return { minRow, maxRow, minCol, maxCol }
}

/**
 * Migrate legacy mergedRows to mergedCells format.
 * Each merged row becomes a full-width single-row merge.
 */
export function migrateMergedRows(
  mergedRows: number[],
  cols: number
): MergedRegion[] {
  return mergedRows.map(row => ({
    row,
    col: 0,
    rowSpan: 1,
    colSpan: cols,
  }))
}
