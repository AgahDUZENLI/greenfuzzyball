import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import Card from '../../components/Card'
import Typography from '../../components/Typography'
import Avatar from '../../components/Avatar'
import { colors, spacing, radius } from '../../styles/tokens'
import { getMemberSessions } from '../../services/api'
import useIsMobile from '../../hooks/useIsMobile'

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

function SessionRow({ session }) {
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
      <Avatar name={session.coach_name || 'Coach'} size="md" />
      <div style={{ flex: 1 }}>
        <Typography variant="body" style={{ fontWeight: '600' }}>
          {session.coach_name || 'Session'}
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
    </div>
  )
}

function MemberSessions() {
  const isMobile = useIsMobile()

  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMemberSessions()
      .then(res => setSessions(res.data))
      .catch(err => console.error('Member sessions fetch error:', err))
      .finally(() => setLoading(false))
  }, [])

  const todayStr = new Date().toISOString().split('T')[0]

  const upcomingSessions = sessions
    .filter(s => s.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.start_time || '').localeCompare(b.start_time || ''))

  const pastSessions = sessions
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

  return (
    <Layout>
      <div style={{
        padding: isMobile ? spacing[4] : spacing[8],
        overflowY: 'auto',
        height: '100%'
      }}>
        <Typography variant="h2" mb={spacing[6]}>My Sessions</Typography>

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
              <SessionRow key={session.session_id} session={session} />
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
              <SessionRow key={session.session_id} session={session} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default MemberSessions
