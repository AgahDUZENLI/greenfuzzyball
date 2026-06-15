import Layout from '../components/Layout'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <Layout>
      <div style={{ padding: '32px' }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
              {greeting}, {user?.name?.split(' ')[0]}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>{today}</p>
          </div>
          <Button onClick={() => navigate('/sessions')}>
            + New Session
          </Button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {[
            { label: 'Total Students', value: '—', icon: '👥' },
            { label: 'Sessions this month', value: '—', icon: '📅' },
            { label: 'Drills in library', value: '—', icon: '🎾' },
            { label: 'Hours this week', value: '—', icon: '⏱️' }
          ].map((stat, i) => (
            <Card key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>{stat.label}</div>
                </div>
                <span style={{ fontSize: '20px', color: '#16a34a' }}>{stat.icon}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Today's Sessions + Week Ahead */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

          {/* Today's Sessions */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Today's Sessions</h2>
              <button
                onClick={() => navigate('/sessions')}
                style={{
                  background: 'none', border: 'none',
                  color: '#16a34a', fontSize: '14px',
                  fontWeight: '600', cursor: 'pointer'
                }}
              >
                See all
              </button>
            </div>
            <Card style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{
                padding: '20px',
                color: '#9ca3af',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                No sessions today
              </div>
            </Card>
          </div>

          {/* Week Ahead */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              Week Ahead
            </h2>
            <Card style={{ padding: '0' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 20px',
                  borderBottom: i < 6 ? '1px solid #f3f4f6' : 'none'
                }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>{day}</span>
                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>—</span>
                </div>
              ))}
            </Card>
          </div>

        </div>
      </div>
    </Layout>
  )
}

export default Dashboard