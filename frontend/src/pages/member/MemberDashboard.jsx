import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import Card from '../../components/Card'
import StatCard from '../../components/StatCard'
import Typography from '../../components/Typography'
import Avatar from '../../components/Avatar'
import { colors, spacing, radius } from '../../styles/tokens'
import { Calendar, Target, ChevronRight, Clock } from 'lucide-react'
import { getMemberSessions, getMemberProgress } from '../../services/api'
import useIsMobile from '../../hooks/useIsMobile'

function formatTime(t) {
  if (!t) return null
  const [h, m] = String(t).split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 || 12
  return `${display}:${m} ${ampm}`
}

function MemberDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [sessions, setSessions] = useState([])
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, progressRes] = await Promise.all([
          getMemberSessions(),
          getMemberProgress()
        ])
        setSessions(sessionsRes.data)
        setProgress(progressRes.data)
      } catch (err) {
        console.error('Member dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const todayStr = new Date().toISOString().split('T')[0]

  const upcomingSessions = sessions
    .filter(s => s.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.start_time || '').localeCompare(b.start_time || ''))

  const pastSessions = sessions.filter(s => s.date < todayStr)

  const recentProgress = [...progress]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  const latestAvgRating = recentProgress.length
    ? (recentProgress.reduce((sum, p) => sum + Number(p.rolling_avg || p.rating || 0), 0) / recentProgress.length).toFixed(1)
    : '—'

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

        {/* Header */}
        <div style={{ marginBottom: spacing[8] }}>
          <Typography variant="h2" mb={spacing[1]}>
            Welcome back, {user?.name?.split(' ')[0]}
          </Typography>
          <Typography variant="bodySmall">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric'
            })}
          </Typography>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: spacing[4],
          marginBottom: spacing[6]
        }}>
          <StatCard label="Upcoming sessions" value={upcomingSessions.length} icon={<Calendar size={20} color={colors.primary} />} />
          <StatCard label="Sessions completed" value={pastSessions.length} icon={<Clock size={20} color={colors.primary} />} />
          <StatCard label="Recent avg rating" value={latestAvgRating} icon={<Target size={20} color={colors.primary} />} />
        </div>

        {/* Upcoming sessions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing[4]
        }}>
          <Typography variant="h3">Upcoming Sessions</Typography>
          <button
            onClick={() => navigate('/member/sessions')}
            style={{
              background: 'none', border: 'none',
              color: colors.primary, fontSize: '14px',
              fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            See all
          </button>
        </div>

        {upcomingSessions.length === 0 ? (
          <Card style={{ padding: spacing[6], textAlign: 'center', marginBottom: spacing[6] }}>
            <Typography variant="bodySmall" color={colors.gray[400]}>
              No upcoming sessions
            </Typography>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], marginBottom: spacing[6] }}>
            {upcomingSessions.map(session => (
              <div
                key={session.session_id}
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
                      month: 'short', day: 'numeric'
                    })}
                    {session.start_time ? ` · ${formatTime(session.start_time)}` : ''}
                    {session.court_name ? ` · ${session.court_name}` : ''}
                  </Typography>
                </div>
                <ChevronRight size={16} color={colors.gray[400]} />
              </div>
            ))}
          </div>
        )}

        {/* Recent progress */}
        <Typography variant="h3" mb={spacing[4]}>Recent Progress</Typography>

        <Card style={{ padding: 0 }}>
          {recentProgress.length === 0 ? (
            <div style={{ padding: spacing[5], textAlign: 'center' }}>
              <Typography variant="bodySmall" color={colors.gray[400]}>
                No ratings yet
              </Typography>
            </div>
          ) : (
            recentProgress.map((p, i) => (
              <div
                key={`${p.date}-${p.drill_name}-${i}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${spacing[3]} ${spacing[4]}`,
                  borderBottom: i < recentProgress.length - 1
                    ? `1px solid ${colors.gray[100]}`
                    : 'none'
                }}
              >
                <div>
                  <Typography variant="bodySmall" style={{ fontWeight: '600' }}>
                    {p.drill_name}
                  </Typography>
                  <Typography variant="caption" color={colors.gray[400]}>
                    {new Date(p.date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric'
                    })}
                  </Typography>
                </div>
                <Typography variant="body" style={{ fontWeight: '700', color: colors.primary }}>
                  {p.rating}
                </Typography>
              </div>
            ))
          )}
        </Card>

      </div>
    </Layout>
  )
}

export default MemberDashboard
