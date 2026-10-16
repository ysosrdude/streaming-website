import { motion } from 'motion/react'
import { scaleIn } from '../../motion/presets'

interface EmbedPlayerProps {
  embedUrl: string
  title: string
}

export function EmbedPlayer({ embedUrl, title }: EmbedPlayerProps) {
  return (
    <motion.div
      className="player-shell"
      variants={scaleIn}
      initial="hidden"
      animate="visible"
    >
      <iframe
        className="player-frame"
        src={embedUrl}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        loading="lazy"
      />
    </motion.div>
  )
}
