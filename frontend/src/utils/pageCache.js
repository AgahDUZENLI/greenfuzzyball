// Cache of the last successful data load for a given page/key, so navigating
// back to a page can render its previous content immediately instead of
// flashing a loading spinner while it refetches in the background.
//
// Backed by localStorage rather than an in-memory object: standalone mobile
// PWAs get killed and relaunched by the OS under memory pressure whenever
// they're backgrounded, which wipes anything living only in the JS heap.
// localStorage is disk-backed and survives that restart.
const PREFIX = 'pageCache:'

export function getPageCache(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

export function setPageCache(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable — the cache is a nice-to-have, not critical.
  }
}
