import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react'
import { FEED_PROVIDERS } from '../feeds'

const STORAGE_KEY = 'streamhub:selected-providers'

function readStoredIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return FEED_PROVIDERS.map((p) => p.id)
    const parsed = JSON.parse(raw) as string[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return FEED_PROVIDERS.map((p) => p.id)
    }
    const valid = new Set(FEED_PROVIDERS.map((p) => p.id))
    const filtered = parsed.filter((id) => valid.has(id))
    return filtered.length > 0 ? filtered : FEED_PROVIDERS.map((p) => p.id)
  } catch {
    return FEED_PROVIDERS.map((p) => p.id)
  }
}

let storedIds = readStoredIds()
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return storedIds
}

function persist(ids: string[]) {
  storedIds = ids
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  for (const listener of listeners) listener()
}

interface ProviderSelectionContextValue {
  providers: typeof FEED_PROVIDERS
  selectedIds: string[]
  isSelected: (id: string) => boolean
  toggle: (id: string) => void
  selectAll: () => void
}

const ProviderSelectionContext =
  createContext<ProviderSelectionContextValue | null>(null)

export function ProviderSelectionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const selectedIds = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const toggle = useCallback((id: string) => {
    const set = new Set(readStoredIds())
    if (set.has(id)) {
      if (set.size <= 1) return
      set.delete(id)
    } else {
      set.add(id)
    }
    persist([...set])
  }, [])

  const selectAll = useCallback(() => {
    persist(FEED_PROVIDERS.map((p) => p.id))
  }, [])

  const value = useMemo(
    () => ({
      providers: FEED_PROVIDERS,
      selectedIds,
      isSelected: (id: string) => selectedIds.includes(id),
      toggle,
      selectAll,
    }),
    [selectedIds, toggle, selectAll],
  )

  return (
    <ProviderSelectionContext.Provider value={value}>
      {children}
    </ProviderSelectionContext.Provider>
  )
}

export function useProviderSelection() {
  const ctx = useContext(ProviderSelectionContext)
  if (!ctx) {
    throw new Error('useProviderSelection must be used within ProviderSelectionProvider')
  }
  return ctx
}
