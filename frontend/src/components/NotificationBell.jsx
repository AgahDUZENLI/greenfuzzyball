import { useState, useEffect } from 'react'
import { Bell, Check, X } from 'lucide-react'
import { colors, spacing, radius, shadows } from '../styles/tokens'
import Typography from './Typography'
import Card from './Card'
import { getNotifications, markAllNotificationsRead, getCoachJoinRequests, respondToJoinRequest } from '../services/api'
import useIsMobile from '../hooks/useIsMobile'

function joinRequestIdFromLink(link) {
  if (!link) return null
  try {
    return new URL(link, window.location.origin).searchParams.get('joinRequestId')
  } catch {
    return null
  }
}

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
  const [pendingJoinRequestIds, setPendingJoinRequestIds] = useState(new Set())
  const [respondingId, setRespondingId] = useState(null)

  const load = () => {
    getNotifications()
      .then(res => {
        setNotifications(res.data.notifications)
        setUnreadCount(res.data.unread_count)
        if (res.data.notifications.some(n => n.type === 'join_request')) {
          getCoachJoinRequests()
            .then(res2 => setPendingJoinRequestIds(new Set(res2.data.map(r => r.request_id))))
            .catch(() => {})
        }
      })
      .catch(() => {})
  }

  const handleRespond = async (requestId, status) => {
    setRespondingId(requestId)
    try {
      await respondToJoinRequest(requestId, status)
      setPendingJoinRequestIds(prev => {
        const next = new Set(prev)
        next.delete(requestId)
        return next
      })
    } catch {
    } finally {
      setRespondingId(null)
    }
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
              notifications.map((n, i) => {
                const joinRequestId = n.type === 'join_request' ? joinRequestIdFromLink(n.link) : null
                const isPending = joinRequestId && pendingJoinRequestIds.has(joinRequestId)
                return (
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
                    {isPending && (
                      <div style={{ display: 'flex', gap: spacing[2], marginTop: spacing[2] }}>
                        <button
                          onClick={() => handleRespond(joinRequestId, 'approved')}
                          disabled={respondingId === joinRequestId}
                          style={{
                            flex: 1, border: 'none', borderRadius: radius.md,
                            backgroundColor: colors.primaryLight, color: colors.primary,
                            padding: '6px 0', fontSize: '12px', fontWeight: '600',
                            cursor: respondingId === joinRequestId ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing[1]
                          }}
                        >
                          <Check size={13} /> Accept
                        </button>
                        <button
                          onClick={() => handleRespond(joinRequestId, 'rejected')}
                          disabled={respondingId === joinRequestId}
                          style={{
                            flex: 1, border: 'none', borderRadius: radius.md,
                            backgroundColor: colors.errorLight, color: colors.error,
                            padding: '6px 0', fontSize: '12px', fontWeight: '600',
                            cursor: respondingId === joinRequestId ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing[1]
                          }}
                        >
                          <X size={13} /> Decline
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </Card>
        </>
      )}
    </div>
  )
}

export default NotificationBell
