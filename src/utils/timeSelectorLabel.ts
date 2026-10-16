import type { BuiltinMatchSelector } from '../types/api'

export function timeSelectorLabel(timeSelector: BuiltinMatchSelector): string {
  switch (timeSelector) {
    case 'live':
      return 'Live now'
    case 'all-today':
      return 'Today'
    case 'all':
      return 'All events'
  }
}
