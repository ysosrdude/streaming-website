import { AnimatePresence, motion } from 'motion/react'
import { useLocation, useOutlet } from 'react-router-dom'
import { pageMotion } from '../../motion/presets'

function routeStageKey(pathname: string): string {
  if (pathname === '/' || pathname.startsWith('/sport/')) return 'browse'
  if (pathname.startsWith('/event')) return 'event'
  if (pathname.startsWith('/watch/')) return 'watch'
  return pathname
}

export function AnimatedOutlet() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={routeStageKey(location.pathname)}
        className="route-stage"
        initial={pageMotion.initial}
        animate={pageMotion.animate}
        exit={pageMotion.exit}
        transition={pageMotion.transition}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}
