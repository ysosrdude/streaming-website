import { motion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { easeOut } from '../../motion/presets'
import type { CatalogMatch } from '../../types/catalog'
import { measureGridRowHeight } from '../../utils/gridRows'
import { MatchGrid } from '../matches/MatchGrid'

const COLLAPSED_ROWS = 2

interface PopularSectionProps {
  matches: CatalogMatch[]
  categoryLabels: Map<string, string>
  resetKey: string
}

export function PopularSection({
  matches,
  categoryLabels,
  resetKey,
}: PopularSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null)
  const [fullHeight, setFullHeight] = useState<number | null>(null)
  const gridWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setExpanded(false)
  }, [resetKey])

  useLayoutEffect(() => {
    const grid = gridWrapRef.current?.querySelector('.match-grid')
    if (!grid || !(grid instanceof HTMLElement)) {
      setCollapsedHeight(null)
      setFullHeight(null)
      return
    }

    const measure = () => {
      setCollapsedHeight(measureGridRowHeight(grid, COLLAPSED_ROWS))
      setFullHeight(measureGridRowHeight(grid, 999))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(grid)
    return () => observer.disconnect()
  }, [matches])

  const canExpand =
    collapsedHeight !== null &&
    collapsedHeight > 0 &&
    fullHeight !== null &&
    fullHeight > collapsedHeight + 2

  const isClipped = canExpand && !expanded
  const clipHeight =
    isClipped && collapsedHeight !== null ? collapsedHeight : null

  return (
    <section
      className="content-section popular-section"
      aria-labelledby="popular-heading"
    >
      <div className="section-heading">
        <h2 id="popular-heading">Popular</h2>
        {canExpand ? (
          <button
            type="button"
            className="section-heading__action"
            aria-expanded={expanded}
            aria-controls="popular-grid"
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? 'Show less' : `View all (${matches.length})`}
          </button>
        ) : null}
      </div>

      <motion.div
        id="popular-grid"
        ref={gridWrapRef}
        className={`popular-section__grid-wrap${isClipped ? ' popular-section__grid-wrap--clipped' : ''}`}
        initial={false}
        animate={{
          maxHeight: clipHeight ?? 'none',
        }}
        transition={
          clipHeight !== null || expanded
            ? { duration: 0.45, ease: easeOut }
            : { duration: 0 }
        }
        style={{ overflow: isClipped ? 'hidden' : undefined }}
      >
        <MatchGrid matches={matches} categoryLabels={categoryLabels} />
      </motion.div>
    </section>
  )
}
