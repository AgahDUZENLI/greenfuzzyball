self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {
  // No offline caching yet — passthrough so the app qualifies as installable.
})

self.addEventListener('push', (event) => {
  let data = { title: 'Green Fuzzy Ball', body: 'You have a new notification', link: '/' }
  try {
    if (event.data) data = { ...data, ...event.data.json() }
  } catch {
    // fall back to defaults if payload isn't JSON
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { link: data.link || '/' }
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const link = event.notification.data?.link || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        clientList[0].postMessage({ type: 'PUSH_NAVIGATE', link })
        return clientList[0].focus()
      }
      return self.clients.openWindow(link)
    })
  )
})
