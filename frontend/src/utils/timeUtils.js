export function timeToMinutes(t) {
  if (!t) return 0
  const [h, m] = String(t).split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(mins) {
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function formatTime12(t) {
  if (!t) return ''
  const [h, m] = String(t).split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

export function hasConflict(sessions, startTime, duration) {
  const start = timeToMinutes(startTime)
  const end = start + duration
  return sessions.some(s => {
    const sStart = timeToMinutes(s.start_time)
    const sEnd = sStart + (s.duration_minutes || 60)
    return start < sEnd && end > sStart
  })
}
