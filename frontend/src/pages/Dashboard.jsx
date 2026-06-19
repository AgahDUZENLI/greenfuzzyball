import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import Card from '../components/Card'
import StatCard from '../components/StatCard'
import Button from '../components/Button'
import Typography from '../components/Typography'
import Badge from '../components/Badge'
import Avatar from '../components/Avatar'
import EmptyState from '../components/EmptyState'
import { getStudents, getSessions, getDrills } from '../services/api'
import { colors, spacing } from '../styles/tokens'
import { Users, Calendar, Dumbbell, Clock, ChevronRight, Plus } from 'lucide-react'

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [students, setStudents] = useState([])
  const [sessions, setSessions] = useState([])
  const [drills, setDrills] = useState([])
  const [loading, setLoading] = useState(true)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

useEffect(() => {
  const fetchData = async () => {
    try {
      const [studentsRes, sessionsRes, drillsRes] = await Promise.all([
        getStudents(),
        getSessions(),
        getDrills()
      ])
      console.log('Sessions:', sessionsRes.data)  // ← add this
      console.log('Students:', studentsRes.data)  // ← add this
      setStudents(studentsRes.data)
      setSessions(sessionsRes.data)
      setDrills(drillsRes.data)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [])

  // Sessions this month
  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const sessionsThisMonth = sessions.filter(s => {
    const d = new Date(s.date)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })

  // Today's sessions
  const todayStr = new Date().toISOString().split('T')[0]
  const todaySessions = sessions.filter(s => s.date === todayStr)

  // Recent sessions (last 5)
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  // Week ahead
  const weekDays = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const daySessions = sessions.filter(s => s.date === dateStr)
    weekDays.push({
      label: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      count: daySessions.length,
      date: dateStr
    })
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <Typography variant="bodySmall">Loading...</Typography>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ padding: spacing[8] }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: spacing[8]
        }}>
          <div>
            <Typography variant="h2" mb={spacing[1]}>
              {greeting}, {user?.name?.split(' ')[0]}
            </Typography>
            <Typography variant="bodySmall">{today}</Typography>
          </div>
          <Button onClick={() => navigate('/sessions')}>
            <Plus size={16} /> New Session
          </Button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: spacing[4],
          marginBottom: spacing[8]
        }}>
          <StatCard
            label="Total Students"
            value={students.length}
            icon={<Users size={20} color={colors.primary} />}
          />
          <StatCard
            label="Sessions this month"
            value={sessionsThisMonth.length}
            icon={<Calendar size={20} color={colors.primary} />}
          />
          <StatCard
            label="Drills in library"
            value={drills.length}
            icon={<Dumbbell size={20} color={colors.primary} />}
          />
          <StatCard
            label="Total sessions"
            value={sessions.length}
            icon={<Clock size={20} color={colors.primary} />}
          />
        </div>

        {/* Main content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: spacing[6]
        }}>

          {/* Recent Sessions */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing[4]
            }}>
              <Typography variant="h4">Recent Sessions</Typography>
              <button
                onClick={() => navigate('/sessions')}
                style={{
                  background: 'none', border: 'none',
                  color: colors.primary, fontSize: '14px',
                  fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                See all
              </button>
            </div>

            {recentSessions.length === 0 ? (
              <EmptyState
                icon={<Calendar size={40} color={colors.gray[300]} />}
                message="No sessions yet"
                action="Create your first session"
                onAction={() => navigate('/sessions')}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                {recentSessions.map((session, i) => (
                  <Card
                    key={session.session_id}
                    onClick={() => navigate('/sessions')}
                    style={{ padding: `${spacing[4]} ${spacing[5]}` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
                      {/* Date */}
                      <div style={{ minWidth: '60px' }}>
                        <Typography variant="h4" style={{ color: colors.primary }}>
                          {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Typography>
                      </div>

                      {/* Badge */}
                      <Badge
                        label={session.type === 'private' ? 'Private' : 'Group'}
                        variant={session.type}
                      />

                      {/* Notes */}
                      <Typography variant="body" style={{ flex: 1, color: colors.gray[600] }}>
                        {session.notes || session.session_location || '—'}
                      </Typography>

                      <ChevronRight size={16} color={colors.gray[400]} />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Week Ahead */}
          <div>
            <Typography variant="h4" mb={spacing[4]}>Week Ahead</Typography>
            <Card style={{ padding: 0 }}>
              {weekDays.map((day, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: `${spacing[4]} ${spacing[5]}`,
                    borderBottom: i < 6 ? `1px solid ${colors.gray[100]}` : 'none'
                  }}
                >
                  <Typography
                    variant="body"
                    color={i === 0 ? colors.primary : colors.gray[700]}
                    style={{ fontWeight: i === 0 ? '600' : '400' }}
                  >
                    {day.label}
                  </Typography>
                  {day.count > 0 ? (
                    <Typography variant="bodySmall" color={colors.primary} style={{ fontWeight: '600' }}>
                      {day.count} {day.count === 1 ? 'session' : 'sessions'}
                    </Typography>
                  ) : (
                    <Typography variant="caption">—</Typography>
                  )}
                </div>
              ))}
            </Card>

            {/* Quick links */}
            <Typography variant="h4" mb={spacing[4]} style={{ marginTop: spacing[6] }}>
              Quick Actions
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              <Button fullWidth variant="secondary" onClick={() => navigate('/students')}>
                <Users size={16} /> View Students
              </Button>
              <Button fullWidth variant="secondary" onClick={() => navigate('/drills')}>
                <Dumbbell size={16} /> Drill Library
              </Button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}

export default Dashboard