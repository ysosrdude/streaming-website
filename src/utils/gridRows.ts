/** Pixel height spanning the first `rowCount` rows of a CSS grid container. */
export function measureGridRowHeight(
  grid: HTMLElement,
  rowCount: number,
): number | null {
  const items = [...grid.children] as HTMLElement[]
  if (items.length === 0) return null

  const rowTops = [...new Set(items.map((item) => item.offsetTop))].sort(
    (a, b) => a - b,
  )
  if (rowTops.length < rowCount) {
    const last = items[items.length - 1]
    return last.offsetTop + last.offsetHeight
  }

  const lastRowTop = rowTops[rowCount - 1]
  const lastInRow = items
    .filter((item) => item.offsetTop === lastRowTop)
    .reduce((a, b) => (a.offsetTop + a.offsetHeight > b.offsetTop + b.offsetHeight ? a : b))

  return lastInRow.offsetTop + lastInRow.offsetHeight
}
