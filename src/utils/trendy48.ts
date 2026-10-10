export function buildTrendy48WatchUrl(
  watchUrl: string,
  mirror?: { source: string; streamNo?: number },
): string {
  const url = new URL(watchUrl)
  if (mirror?.source) {
    url.searchParams.set('source', mirror.source)
  }
  if (mirror?.streamNo != null) {
    url.searchParams.set('stream', String(mirror.streamNo))
  }
  return url.toString()
}
