// In-memory cache of the last successful data load for a given page/key,
// so navigating back to a page can render its previous content immediately
// instead of flashing a loading spinner while it refetches in the background.
const store = new Map()

export function getPageCache(key) {
  return store.get(key)
}

export function setPageCache(key, value) {
  store.set(key, value)
}
