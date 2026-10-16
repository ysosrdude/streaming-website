import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { easeOut } from '../../motion/presets'
import { homePath } from '../../routes/paths'

export function Header() {
  return (
    <motion.header
      className="site-header"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <div className="site-header__rail" aria-hidden>
        <span className="site-header__rail-id">CH·01</span>
        <span className="site-header__rail-divider" />
        <span>Multi-feed guide</span>
        <span className="site-header__rail-live">On air</span>
      </div>
      <div className="site-header__inner">
        <Link to={homePath('live')} className="brand">
          <span className="brand__mark" aria-hidden>
            <span className="brand__mark-sweep" />
            <span className="brand__mark-core" />
          </span>
          <span className="brand__text">
            <span className="brand__name">StreamHub</span>
            <span className="brand__sub">
              <span className="brand__live-dot" aria-hidden />
              Pick a stream
            </span>
          </span>
        </Link>
      </div>
    </motion.header>
  )
}
