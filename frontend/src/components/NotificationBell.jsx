import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { colors, spacing, radius, shadows } from '../styles/tokens'
import Typography from './Typography'
import Card from './Card'
import { getNotifications, markAllNotificationsRead } from '../services/api'
import useIsMobile from '../hooks/useIsMobile'

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function NotificationBell() {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const load = () => {
    getNotifications()
      .then(res => {
        setNotifications(res.data.notifications)
        setUnreadCount(res.data.unread_count)
      })
      .catch(() => {})
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 60000)
    return () => clearInterval(id)
  }, [])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next && unreadCount > 0) {
      markAllNotificationsRead().then(() => setUnreadCount(0)).catch(() => {})
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={toggle}
        style={{
          position: 'relative',
          width: '40px', height: '40px',
          border: `1px solid ${colors.gray[200]}`,
          borderRadius: radius.lg,
          backgroundColor: 'white',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <Bell size={18} color={colors.gray[600]} />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute', top: '8px', right: '8px',
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: colors.error, border: '1.5px solid white'
          }} />
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
          <Card style={isMobile ? {
            position: 'fixed', top: '56px', left: spacing[4], right: spacing[4],
            width: 'auto', padding: 0, zIndex: 999,
            maxHeight: '360px', overflowY: 'auto',
            boxShadow: shadows.lg
          } : {
            position: 'absolute', top: '48px', right: 0,
            width: '320px', padding: 0, zIndex: 999,
            maxHeight: '360px', overflowY: 'auto',
            boxShadow: shadows.lg
          }}>
            <div style={{ padding: `${spacing[4]} ${spacing[4]} ${spacing[3]}`, borderBottom: `1px solid ${colors.gray[100]}` }}>
              <Typography variant="h4">Notifications</Typography>
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: spacing[6], textAlign: 'center' }}>
                <Typography variant="bodySmall" color={colors.gray[400]}>
                  No notifications yet
                </Typography>
              </div>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={n.notification_id}
                  style={{
                    padding: `${spacing[3]} ${spacing[4]}`,
                    borderBottom: i < notifications.length - 1 ? `1px solid ${colors.gray[100]}` : 'none'
                  }}
                >
                  <Typography variant="bodySmall">{n.message}</Typography>
                  <Typography variant="caption" color={colors.gray[400]}>
                    {timeAgo(n.created_at)}
                  </Typography>
                </div>
              ))
            )}
          </Card>
        </>
      )}
    </div>
  )
}

export default NotificationBell
