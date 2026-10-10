export function formatMatchDate(epochMs: number): string {
  if (epochMs === 0) return 'Always on'

  const date = new Date(epochMs)
  const now = new Date()
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  const time = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  if (sameDay) {
    return `Today · ${time}`
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function isLiveWindow(epochMs: number, windowHours = 4): boolean {
  const now = Date.now()
  const start = epochMs - 30 * 60 * 1000
  const end = epochMs + windowHours * 60 * 60 * 1000
  return now >= start && now <= end
}
