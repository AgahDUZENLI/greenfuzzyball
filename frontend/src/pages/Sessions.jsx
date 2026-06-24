import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Typography from '../components/Typography'
import { getStudents, getSessions } from '../services/api'
import { colors, spacing, radius } from '../styles/tokens'
import { ChevronLeft, ChevronRight, Plus, Clock, CheckCircle, Calendar as CalendarIcon } from 'lucide-react'
import BookSessionModal from '../components/BookSessionModal'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function Sessions() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [showBookModal, setShowBookModal] = useState(false)
  const [bookStudent, setBookStudent] = useState(null)
  const [students, setStudents] = useState([])
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStudents().then(res => setStudents(res.data))
    getSessions()
      .then(res => setSessions(res.data))
      .finally(() => setLoading(false))
  }, [])

  const filteredSessions = sessions.filter(s => {
    const d = new Date(s.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const todayStr = new Date().toISOString().split('T')[0]
  const upcoming = filteredSessions.filter(s => s.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date))
  const past = filteredSessions.filter(s => s.date < todayStr).sort((a, b) => b.date.localeCompare(a.date))

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const formatDateLabel = (dateStr) => {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    if (dateStr === today) return { main: 'Today', sub: new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
    if (dateStr === tomorrowStr) return { main: 'Tomorrow', sub: new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
    return {
      main: new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
      sub: new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const formatTime = (t) => {
    if (!t) return null
    const [h, m] = String(t).split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
  }
  
  const SessionRow = ({ session, isUpcoming }) => {
    const dateLabel = formatDateLabel(session.date)
    const time = formatTime(session.start_time)
    return (
      <div
        key={session.session_id}
        onClick={() => setSelectedSession(session)}
        style={{
          display: 'grid',
          gridTemplateColumns: '140px 120px 1fr 80px 160px 40px',
          padding: `${spacing[4]} ${spacing[6]}`,
          borderBottom: `1px solid ${colors.gray[100]}`,
          alignItems: 'center',
          cursor: 'pointer',
          borderLeft: isUpcoming ? `3px solid ${colors.primary}` : '3px solid transparent'
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.gray[50]}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        {/* Date */}
        <div>
          <Typography variant="body" style={{ fontWeight: '600' }}>{dateLabel.main}</Typography>
          <Typography variant="caption" color={colors.gray[400]}>{dateLabel.sub}</Typography>
        </div>
       {/* Type */}
        <span style={{
          display: 'inline-block', padding: '4px 12px',
          borderRadius: radius.full,
          backgroundColor: session.type === 'group' ? '#fef3c7' : colors.gray[100],
          color: session.type === 'group' ? '#d97706' : colors.gray[600],
          fontSize: '13px', fontWeight: '500', width: 'fit-content'
        }}>
          {session.type === 'group' ? 'Group' : 'Private'}
        </span>

        {/* Students */}
        <Typography variant="body" color={colors.gray[700]}>
          {session.student_names?.slice(0, 3).join(', ')}
          {session.student_names?.length > 3 ? ` +${session.student_names.length - 3}` : ''}
        </Typography>
        {/* Drills */}
        <Typography variant="body" color={colors.gray[400]}>
          {session.drill_count || '—'}
        </Typography>

        {/* Status */}
        {isUpcoming ? (
          time ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: spacing[2],
              color: colors.primary, fontSize: '13px', fontWeight: '600'
            }}>
              <Clock size={14} color={colors.primary} />
              {time}
            </div>
          ) : <span />
        ) : (
          session.avg_rating ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: spacing[2],
              color: colors.primary, fontSize: '13px', fontWeight: '600'
            }}>
              <CheckCircle size={14} color={colors.primary} />
              Avg {parseFloat(session.avg_rating).toFixed(1)}
            </div>
          ) : (
            <Typography variant="caption" color={colors.gray[300]}>No ratings</Typography>
          )
        )}

        <ChevronRight size={16} color={colors.gray[400]} />
      </div>
    )
  }

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* Top panel */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: `${spacing[5]} ${spacing[8]}`,
          borderBottom: `1px solid ${colors.gray[200]}`,
          backgroundColor: 'white', flexShrink: 0
        }}>
          <Typography variant="h3">Sessions</Typography>

          <div style={{
            display: 'flex', alignItems: 'center', gap: spacing[3],
            border: `1px solid ${colors.gray[200]}`,
            borderRadius: radius.xl, padding: `${spacing[2]} ${spacing[4]}`
          }}>
            <button onClick={prevMonth} style={{
              border: 'none', background: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0
            }}>
              <ChevronLeft size={16} color={colors.gray[500]} />
            </button>
            <Typography variant="body" style={{ fontWeight: '600', minWidth: '100px', textAlign: 'center' }}>
              {MONTHS[currentMonth]} {currentYear}
            </Typography>
            <button onClick={nextMonth} style={{
              border: 'none', background: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0
            }}>
              <ChevronRight size={16} color={colors.gray[500]} />
            </button>
          </div>

          <Button onClick={() => setShowBookModal(true)}>
            <Plus size={16} /> New Session
          </Button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Upcoming */}
      {upcoming.length > 0 && (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', gap: spacing[3],
            padding: `${spacing[4]} ${spacing[6]}`,
            backgroundColor: colors.gray[50]
          }}>
            <CalendarIcon size={14} color={colors.primary} />
            <Typography variant="label" color={colors.primary}>UPCOMING</Typography>
            <span style={{
              backgroundColor: colors.primary, color: 'white',
              borderRadius: radius.full, fontSize: '11px', fontWeight: '700',
              padding: '2px 8px'
            }}>
              {upcoming.length}
            </span>
          </div>

          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '140px 120px 1fr 80px 160px 40px',
            padding: `${spacing[2]} ${spacing[6]}`,
            borderBottom: `1px solid ${colors.gray[200]}`,
          }}>
            {['DATE', 'TYPE', 'STUDENTS', 'DRILLS', 'STATUS', ''].map(col => (
              <Typography key={col} variant="label" color={colors.gray[400]}>{col}</Typography>
            ))}
          </div>
          {upcoming.map(s => <SessionRow key={s.session_id} session={s} isUpcoming={true} />)}
        </>
      )}

      {/* Past */}
      {past.length > 0 && (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', gap: spacing[3],
            padding: `${spacing[4]} ${spacing[6]}`,
            backgroundColor: colors.gray[50],
            marginTop: upcoming.length > 0 ? spacing[4] : 0
          }}>
            <Clock size={14} color={colors.gray[400]} />
            <Typography variant="label" color={colors.gray[500]}>PAST</Typography>
          </div>

          {past.map(s => <SessionRow key={s.session_id} session={s} isUpcoming={false} />)}
        </>
      )}

      {filteredSessions.length === 0 && (
        <div style={{ padding: spacing[16], textAlign: 'center' }}>
          <Typography variant="bodySmall" color={colors.gray[400]}>No sessions this month</Typography>
        </div>
      )}
        </div>
      </div>

      {showBookModal && (
        <BookSessionModal
          students={students}
          onClose={() => setShowBookModal(false)}
          onBooked={session => {
            setSessions(prev => [...prev, session])
            setShowBookModal(false)
          }}
        />
      )}
    </Layout>
  )
}

export default Sessions