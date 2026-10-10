import { badgeImageUrl } from '../../utils/assets'

interface TeamBadgeProps {
  badgeId: string
  name: string
  apiBaseUrl?: string
  size?: 'sm' | 'md'
}

export function TeamBadge({
  badgeId,
  name,
  apiBaseUrl,
  size = 'md',
}: TeamBadgeProps) {
  return (
    <img
      className={`team-badge team-badge--${size}`}
      src={badgeImageUrl(badgeId, apiBaseUrl)}
      alt=""
      loading="lazy"
      decoding="async"
      title={name}
    />
  )
}
