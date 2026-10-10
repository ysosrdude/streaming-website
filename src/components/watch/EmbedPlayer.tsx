interface EmbedPlayerProps {
  embedUrl: string
  title: string
}

export function EmbedPlayer({ embedUrl, title }: EmbedPlayerProps) {
  return (
    <div className="player-shell">
      <iframe
        className="player-frame"
        src={embedUrl}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        loading="lazy"
      />
    </div>
  )
}
