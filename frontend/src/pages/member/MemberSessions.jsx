import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import Card from '../../components/Card'
import Typography from '../../components/Typography'
import Avatar from '../../components/Avatar'
import PersonSwitcher from '../../components/PersonSwitcher'
import { colors, spacing, radius } from '../../styles/tokens'
import { getMemberSessions, getChildren, getMySessionRequests, deleteSessionRequest } from '../../services/api'
import useIsMobile from '../../hooks/useIsMobile'
import { X } from 'lucide-react'

const statusMeta = {
  scheduled: { label: 'Confirmed', color: colors.primary, bg: colors.primaryLight },
  cancellation_pending: { label: 'Cancellation Pending', color: colors.warning, bg: colors.warningLight },
  cancelled: { label: 'Cancelled', color: colors.gray[500], bg: colors.gray[100] }
}

function firstName(name) {
  return name ? name.split(' ')[0] : ''
}

function formatTime(t) {
  if (!t) return null
  const [h, m] = String(t).split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 || 12
  return `${display}:${m} ${ampm}`
}

function formatDuration(minutes) {
  if (!minutes) return null
  if (minutes < 60) return `${minutes}min`
  if (minutes % 60 === 0) return `${minutes / 60}h`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}min`
}

function SessionRow({ session, showPerson, onClick }) {
  const meta = statusMeta[session.status] || statusMeta.scheduled
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[4],
        padding: `${spacing[4]} ${spacing[5]}`,
        borderRadius: radius.xl,
        backgroundColor: 'white',
        border: `1px solid ${colors.gray[200]}`,
        cursor: 'pointer',
        opacity: session.status === 'cancelled' ? 0.6 : 1
      }}
    >
      <Avatar name={session.coach_name || 'Coach'} size="md" />
      <div style={{ flex: 1 }}>
        <Typography variant="body" style={{ fontWeight: '600' }}>
          {session.coach_name || 'Session'}
          {showPerson && session.personName && (
            <span style={{ fontWeight: '500', color: colors.gray[400] }}> · {session.personName}</span>
          )}
        </Typography>
        <Typography variant="bodySmall" color={colors.gray[500]}>
          {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
          })}
          {session.start_time ? ` · ${formatTime(session.start_time)}` : ''}
          {session.duration_minutes ? ` · ${formatDuration(session.duration_minutes)}` : ''}
          {session.court_name ? ` · ${session.court_name}` : ''}
        </Typography>
        {session.drills?.length > 0 && (
          <Typography variant="caption" color={colors.gray[400]} style={{ display: 'block', marginTop: spacing[1] }}>
            {session.drills.map(d => d.name).join(', ')}
          </Typography>
        )}
      </div>
      <span style={{
        padding: `2px ${spacing[2]}`,
        borderRadius: radius.full,
        backgroundColor: meta.bg,
        color: meta.color,
        fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap'
      }}>
        {meta.label}
      </span>
    </div>
  )
}

function RequestRow({ request, onDelete, deleting }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[4],
        padding: `${spacing[4]} ${spacing[5]}`,
        borderRadius: radius.xl,
        backgroundColor: 'white',
        border: `1px solid ${colors.gray[200]}`
      }}
    >
      <Avatar name={request.coach_name || 'Coach'} size="md" />
      <div style={{ flex: 1 }}>
        <Typography variant="body" style={{ fontWeight: '600' }}>
          {request.coach_name || 'Session request'}
          <span style={{ fontWeight: '500', color: colors.gray[400] }}> · {request.student_name}</span>
        </Typography>
        <Typography variant="bodySmall" color={colors.gray[500]}>
          {new Date(request.requested_date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
          })}
          {request.requested_time ? ` · ${formatTime(request.requested_time)}` : ''}
          {' · Awaiting coach approval'}
        </Typography>
      </div>
      <button
        onClick={() => onDelete(request.request_id)}
        title="Delete request"
        disabled={deleting}
        style={{
          background: 'none', border: 'none', cursor: deleting ? 'not-allowed' : 'pointer',
          padding: 4, display: 'flex', color: colors.gray[400]
        }}
      >
        <X size={16} />
      </button>
    </div>
  )
}

function MemberSessions() {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const [children, setChildren] = useState([])
  const [selfSessions, setSelfSessions] = useState([])
  const [sessionsByPerson, setSessionsByPerson] = useState({})
  const [sessionRequests, setSessionRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPersonId, setSelectedPersonId] = useState('all')
  const [deletingRequestId, setDeletingRequestId] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [childrenRes, sessionsRes, requestsRes] = await Promise.all([
          getChildren(),
          getMemberSessions(),
          getMySessionRequests()
        ])

        setChildren(childrenRes.data)
        setSelfSessions(sessionsRes.data)
        setSessionRequests(requestsRes.data)

        const kids = childrenRes.data
        if (kids.length > 0) {
          const results = await Promise.all(kids.map(k => getMemberSessions(k.user_id)))
          const sByP = {}
          kids.forEach((k, i) => { sByP[k.user_id] = results[i].data })
          setSessionsByPerson(sByP)
        }
      } catch (err) {
        console.error('Member sessions fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handleDeleteRequest = async (requestId) => {
    setDeletingRequestId(requestId)
    try {
      await deleteSessionRequest(requestId)
      setSessionRequests(prev => prev.filter(r => r.request_id !== requestId))
    } catch (err) {
      console.error('Delete session request error:', err)
    } finally {
      setDeletingRequestId(null)
    }
  }

  const people = [
    { id: 'all', label: 'All' },
    ...(user ? [{ id: user.user_id, label: `${firstName(user.name)} (Me)`, name: user.name }] : []),
    ...children.map(c => ({ id: c.user_id, label: firstName(c.name), name: c.name }))
  ]

  const taggedSessions = [
    ...(user ? selfSessions.map(s => ({ ...s, personId: user.user_id, personName: firstName(user.name) })) : []),
    ...children.flatMap(c => (sessionsByPerson[c.user_id] || []).map(s => ({ ...s, personId: c.user_id, personName: firstName(c.name) })))
  ]

  const visibleSessions = selectedPersonId === 'all'
    ? taggedSessions
    : taggedSessions.filter(s => s.personId === selectedPersonId)

  const pendingRequests = sessionRequests.filter(r => r.status === 'pending')

  const todayStr = new Date().toISOString().split('T')[0]

  const upcomingSessions = visibleSessions
    .filter(s => s.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.start_time || '').localeCompare(b.start_time || ''))

  const pastSessions = visibleSessions
    .filter(s => s.date < todayStr)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.start_time || '').localeCompare(a.start_time || ''))

  if (loading) {
    return (
      <Layout>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', height: '100%'
        }}>
          <Typography variant="bodySmall" color={colors.gray[400]}>Loading...</Typography>
        </div>
      </Layout>
    )
  }

  const showPerson = selectedPersonId === 'all' && children.length > 0

  return (
    <Layout>
      <div style={{
        padding: isMobile ? spacing[4] : spacing[8],
        overflowY: 'auto',
        height: '100%'
      }}>
        <Typography variant="h2" mb={spacing[6]}>My Sessions</Typography>

        {children.length > 0 && (
          <div style={{ marginBottom: spacing[6] }}>
            <PersonSwitcher people={people} selectedId={selectedPersonId} onSelect={setSelectedPersonId} />
          </div>
        )}

        {pendingRequests.length > 0 && (
          <>
            <Typography variant="h3" mb={spacing[4]}>Requested</Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], marginBottom: spacing[6] }}>
              {pendingRequests.map(request => (
                <RequestRow
                  key={request.request_id}
                  request={request}
                  onDelete={handleDeleteRequest}
                  deleting={deletingRequestId === request.request_id}
                />
              ))}
            </div>
          </>
        )}

        <Typography variant="h3" mb={spacing[4]}>Upcoming</Typography>
        {upcomingSessions.length === 0 ? (
          <Card style={{ padding: spacing[6], textAlign: 'center', marginBottom: spacing[6] }}>
            <Typography variant="bodySmall" color={colors.gray[400]}>
              No upcoming sessions
            </Typography>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], marginBottom: spacing[6] }}>
            {upcomingSessions.map(session => (
              <SessionRow
                key={session.session_id}
                session={session}
                showPerson={showPerson}
                onClick={() => navigate(`/member/sessions/${session.session_id}`)}
              />
            ))}
          </div>
        )}

        <Typography variant="h3" mb={spacing[4]}>Past</Typography>
        {pastSessions.length === 0 ? (
          <Card style={{ padding: spacing[6], textAlign: 'center' }}>
            <Typography variant="bodySmall" color={colors.gray[400]}>
              No past sessions yet
            </Typography>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {pastSessions.map(session => (
              <SessionRow
                key={session.session_id}
                session={session}
                showPerson={showPerson}
                onClick={() => navigate(`/member/sessions/${session.session_id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default MemberSessions
