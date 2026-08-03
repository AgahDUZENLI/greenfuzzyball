import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import Card from '../../components/Card'
import StatCard from '../../components/StatCard'
import Button from '../../components/Button'
import Typography from '../../components/Typography'
import Avatar from '../../components/Avatar'
import Calendar from '../../components/Calendar'
import {
  getStudents, getSessions, getDrills,
  getCoachSessionRequests, respondToSessionRequest,
  getCoachCancellationRequests, respondToCancellation
} from '../../services/api'
import { colors, spacing, radius, shadows } from '../../styles/tokens'
import { Users, Calendar as CalendarIcon, Dumbbell, Clock, ChevronRight, Plus, Check, X } from 'lucide-react'
import BookSessionModal from '../../components/BookSessionModal'
import NotificationBell from '../../components/NotificationBell'
import useIsMobile from '../../hooks/useIsMobile'
import { getPageCache, setPageCache } from '../../utils/pageCache'

function formatTime(t) {
  if (!t) return null
  const [h, m] = String(t).split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 || 12
  return { hour: `${display}:${m}`, ampm }
}

function formatDuration(minutes) {
  if (!minutes) return null
  if (minutes < 60) return `${minutes}min`
  if (minutes % 60 === 0) return `${minutes / 60}h`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}min`
}

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const cached = getPageCache('dashboard')
  const [students, setStudents] = useState(() => cached?.students ?? [])
  const [sessions, setSessions] = useState(() => cached?.sessions ?? [])
  const [drills, setDrills] = useState(() => cached?.drills ?? [])
  const [loading, setLoading] = useState(() => !cached)

  const todayStr = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(todayStr)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const [showBookModal, setShowBookModal] = useState(false)
  const [bookStudent, setBookStudent] = useState(null)

  const [sessionRequests, setSessionRequests] = useState([])
  const [respondingReqId, setRespondingReqId] = useState(null)

  const [cancellationRequests, setCancellationRequests] = useState([])
  const [respondingCancelId, setRespondingCancelId] = useState(null)

  useEffect(() => {
    getCoachSessionRequests()
      .then(res => setSessionRequests(res.data))
      .catch(() => setSessionRequests([]))
    getCoachCancellationRequests()
      .then(res => setCancellationRequests(res.data))
      .catch(() => setCancellationRequests([]))
  }, [])

  const handleRespondSessionRequest = async (requestId, status) => {
    setRespondingReqId(requestId)
    try {
      await respondToSessionRequest(requestId, status)
      setSessionRequests(prev => prev.filter(r => r.request_id !== requestId))
      if (status === 'approved') {
        const res = await getSessions()
        setSessions(res.data)
      }
    } catch {
    } finally {
      setRespondingReqId(null)
    }
  }

  const handleRespondCancellation = async (sessionId, status) => {
    setRespondingCancelId(sessionId)
    try {
      await respondToCancellation(sessionId, status)
      setCancellationRequests(prev => prev.filter(r => r.session_id !== sessionId))
      const res = await getSessions()
      setSessions(res.data)
    } catch {
    } finally {
      setRespondingCancelId(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, sessionsRes, drillsRes] = await Promise.all([
          getStudents(),
          getSessions(),
          getDrills()
        ])
        setStudents(studentsRes.data)
        setSessions(sessionsRes.data)
        setDrills(drillsRes.data)
        setPageCache('dashboard', { students: studentsRes.data, sessions: sessionsRes.data, drills: drillsRes.data })
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const sessionsThisMonth = sessions.filter(s => {
    const d = new Date(s.date)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })

  const selectedSessions = sessions
    .filter(s => s.date === selectedDate)
    .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))

  const selectedPendingRequests = sessionRequests.filter(r => r.requested_date === selectedDate)

  const firstActiveSession = selectedSessions.find(s => s.status !== 'cancelled')

  const selectedDayItems = [
    ...selectedSessions.map(s => ({ kind: 'session', ...s })),
    ...selectedPendingRequests.map(r => ({ kind: 'request', ...r }))
  ].sort((a, b) => {
    const ta = a.kind === 'session' ? a.start_time : a.requested_time
    const tb = b.kind === 'session' ? b.start_time : b.requested_time
    return (ta || '').localeCompare(tb || '')
  })

  const selectedDateLabel = selectedDate === todayStr
    ? "Today's Sessions"
    : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
      })

  const unratedSessions = sessions.filter(s =>
    s.unrated && new Date(s.date) < new Date()
  ).slice(0, 5)

  const recentStudents = (() => {
    const seen = new Set()
    const result = []
    ;[...sessions]
      .filter(s => new Date(s.date) < new Date())
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach(s => {
        s.student_names?.forEach(name => {
          if (!seen.has(name) && result.length < 5) {
            seen.add(name)
            const student = students.find(st => st.name === name)
            result.push({ name, id: student?.user_id })
          }
        })
      })
    return result
  })()

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
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        height: '100%',
        overflow: isMobile ? 'auto' : 'hidden'
      }}>

        {/* Middle column — main scrollable content */}
        <div style={{
          flex: 1,
          overflowY: isMobile ? 'visible' : 'auto',
          padding: isMobile ? spacing[4] : spacing[8]
        }}>

          {/* Header */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'flex-start',
            gap: isMobile ? spacing[3] : 0,
            marginBottom: spacing[8]
          }}>
            <div>
              <Typography variant="h2" mb={spacing[1]}>
                {greeting}, {user?.name?.split(' ')[0]} 👋
              </Typography>
              <Typography variant="bodySmall">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric'
                })}
              </Typography>
            </div>
            <div style={{ display: 'flex', gap: spacing[3], alignItems: 'center', justifyContent: isMobile ? 'flex-end' : 'flex-start' }}>
              <NotificationBell />
              <Button onClick={() => setShowBookModal(true)}>
                <Plus size={16} /> New Session
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: spacing[4],
            marginBottom: spacing[6]
          }}>
            <StatCard label="Total Students" value={students.length} icon={<Users size={20} color={colors.primary} />} />
            <StatCard label="Sessions this month" value={sessionsThisMonth.length} icon={<CalendarIcon size={20} color={colors.primary} />} />
            <StatCard label="Drills in library" value={drills.length} icon={<Dumbbell size={20} color={colors.primary} />} />
            <StatCard label="Total sessions" value={sessions.length} icon={<Clock size={20} color={colors.primary} />} />
          </div>

          {/* Calendar — full width */}
          <div style={{ marginBottom: spacing[6] }}>
            <Calendar
              sessions={[
                ...sessions,
                ...sessionRequests.map(r => ({ date: r.requested_date, status: 'pending' }))
              ]}
              selectedDate={selectedDate}
              onDayClick={setSelectedDate}
              legend={[
                { color: colors.primary, label: 'Scheduled' },
                { color: colors.warning, label: 'Pending' },
                { color: colors.gray[300], label: 'Cancelled' }
              ]}
            />
          </div>

          {/* Sessions for selected day */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing[4]
          }}>
            <Typography variant="h3">{selectedDateLabel}</Typography>
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

          {selectedDayItems.length === 0 ? (
            <Card style={{ padding: spacing[6], textAlign: 'center' }}>
              <Typography variant="bodySmall" color={colors.gray[400]}>
                No sessions on this day
              </Typography>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              {selectedDayItems.map(item => {
                if (item.kind === 'request') {
                  const time = formatTime(item.requested_time)
                  return (
                    <div
                      key={`req-${item.request_id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing[4],
                        padding: `${spacing[4]} ${spacing[5]}`,
                        borderRadius: radius.xl,
                        backgroundColor: 'white',
                        border: `1px dashed ${colors.gray[300]}`,
                        boxShadow: shadows.sm
                      }}
                    >
                      {/* Time */}
                      {time && (
                        <div style={{ minWidth: '52px', textAlign: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: colors.black, lineHeight: 1 }}>{time.hour}</div>
                          <div style={{ fontSize: '11px', color: colors.gray[400], textTransform: 'uppercase' }}>{time.ampm}</div>
                        </div>
                      )}

                      {/* Avatar */}
                      <Avatar name={item.student_name || 'S'} size="md" />

                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <Typography variant="body" style={{ fontWeight: '600', color: colors.black }}>
                          {item.student_name || 'Session request'}
                        </Typography>
                        <Typography variant="bodySmall" color={colors.gray[500]}>
                          via {item.member_name}
                        </Typography>
                      </div>

                      {/* Action */}
                      <span style={{
                        display: 'inline-block', padding: '4px 12px',
                        borderRadius: radius.full,
                        backgroundColor: colors.warningLight, color: colors.warning,
                        fontSize: '13px', fontWeight: '500', flexShrink: 0
                      }}>
                        Pending
                      </span>
                      <button
                        onClick={() => handleRespondSessionRequest(item.request_id, 'approved')}
                        disabled={respondingReqId === item.request_id}
                        style={{
                          width: '32px', height: '32px', border: 'none', borderRadius: radius.md,
                          backgroundColor: colors.primaryLight, color: colors.primary,
                          cursor: respondingReqId === item.request_id ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleRespondSessionRequest(item.request_id, 'rejected')}
                        disabled={respondingReqId === item.request_id}
                        style={{
                          width: '32px', height: '32px', border: 'none', borderRadius: radius.md,
                          backgroundColor: colors.errorLight, color: colors.error,
                          cursor: respondingReqId === item.request_id ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )
                }

                const session = item
                const time = formatTime(session.start_time)
                const isCancelled = session.status === 'cancelled'
                const isFirst = session.session_id === firstActiveSession?.session_id

                return (
                  <div
                    key={session.session_id}
                    onClick={() => navigate(`/sessions/${session.session_id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[4],
                      padding: `${spacing[4]} ${spacing[5]}`,
                      borderRadius: radius.xl,
                      backgroundColor: isFirst ? colors.black : 'white',
                      border: isFirst ? 'none' : `1px solid ${colors.gray[200]}`,
                      boxShadow: isFirst ? 'none' : shadows.sm,
                      cursor: 'pointer',
                      opacity: isCancelled ? 0.6 : 1
                    }}
                  >
                    {/* Time */}
                    {time && (
                      <div style={{ minWidth: '52px', textAlign: 'center' }}>
                        <div style={{
                          fontSize: '18px', fontWeight: '700',
                          color: isFirst ? 'white' : colors.black,
                          lineHeight: 1
                        }}>{time.hour}</div>
                        <div style={{
                          fontSize: '11px',
                          color: colors.gray[400],
                          textTransform: 'uppercase'
                        }}>{time.ampm}</div>
                      </div>
                    )}

                    {/* Avatar */}
                    <Avatar
                      name={session.student_names?.[0] || (session.type === 'group' ? 'G' : 'P')}
                      size="md"
                    />

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <Typography
                        variant="body"
                        style={{ fontWeight: '600', color: isFirst ? 'white' : colors.black }}
                      >
                        {session.student_names?.length > 0
                          ? session.student_names.slice(0, 2).join(', ') +
                            (session.student_names.length > 2
                              ? ` +${session.student_names.length - 2}`
                              : '')
                          : session.session_location || 'Session'
                        }
                      </Typography>
                      <Typography
                        variant="bodySmall"
                        color={isFirst ? colors.gray[400] : colors.gray[500]}
                      >
                        {session.type === 'group' ? 'Group' : 'Private'}
                        {session.duration_minutes ? ` · ${formatDuration(session.duration_minutes)}` : ''}
                        {session.session_location ? ` · ${session.session_location}` : ''}
                      </Typography>
                    </div>

                    {/* Action */}
                    {isCancelled ? (
                      <span style={{
                        display: 'inline-block', padding: '4px 12px',
                        borderRadius: radius.full,
                        backgroundColor: colors.gray[100], color: colors.gray[500],
                        fontSize: '13px', fontWeight: '500', flexShrink: 0
                      }}>
                        Cancelled
                      </span>
                    ) : isFirst ? (
                      <Button onClick={e => { e.stopPropagation(); navigate(`/sessions/${session.session_id}`) }}>Start</Button>
                    ) : (
                      <ChevronRight size={16} color={colors.gray[400]} />
                    )}
                  </div>
                )
              })}
            </div>
          )}

        </div>

        {/* Right column — todo panel */}
        <div style={{
          width: isMobile ? '100%' : '300px',
          flexShrink: 0,
          backgroundColor: 'white',
          borderLeft: isMobile ? 'none' : `1px solid ${colors.gray[100]}`,
          borderTop: isMobile ? `1px solid ${colors.gray[100]}` : 'none',
          overflowY: isMobile ? 'visible' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[6],
          padding: spacing[6]
        }}>

          {/* Session Requests */}
          <Card style={{ padding: 0 }}>
            <div style={{
              padding: `${spacing[4]} ${spacing[4]} ${spacing[3]}`,
              borderBottom: `1px solid ${colors.gray[100]}`
            }}>
              <Typography variant="h4">Session Requests</Typography>
            </div>
            {sessionRequests.length === 0 ? (
              <div style={{ padding: spacing[5], textAlign: 'center' }}>
                <Typography variant="bodySmall" color={colors.gray[400]}>
                  No pending requests
                </Typography>
              </div>
            ) : (
              sessionRequests.map((req, i) => (
                <div
                  key={req.request_id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: spacing[3],
                    padding: `${spacing[3]} ${spacing[4]}`,
                    borderBottom: i < sessionRequests.length - 1 ? `1px solid ${colors.gray[100]}` : 'none'
                  }}
                >
                  <Avatar name={req.student_name} size="sm" />
                  <div style={{ flex: 1 }}>
                    <Typography variant="bodySmall" style={{ fontWeight: '600' }}>{req.student_name}</Typography>
                    <Typography variant="caption" color={colors.gray[400]}>
                      {new Date(req.requested_date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric'
                      })}
                      {req.requested_time ? ` · ${req.requested_time.slice(0, 5)}` : ''} · via {req.member_name}
                    </Typography>
                  </div>
                  <button
                    onClick={() => handleRespondSessionRequest(req.request_id, 'approved')}
                    disabled={respondingReqId === req.request_id}
                    style={{
                      width: '32px', height: '32px', border: 'none', borderRadius: radius.md,
                      backgroundColor: colors.primaryLight, color: colors.primary,
                      cursor: respondingReqId === req.request_id ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleRespondSessionRequest(req.request_id, 'rejected')}
                    disabled={respondingReqId === req.request_id}
                    style={{
                      width: '32px', height: '32px', border: 'none', borderRadius: radius.md,
                      backgroundColor: colors.errorLight, color: colors.error,
                      cursor: respondingReqId === req.request_id ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </Card>

          {/* Cancellation Requests */}
          <Card style={{ padding: 0 }}>
            <div style={{
              padding: `${spacing[4]} ${spacing[4]} ${spacing[3]}`,
              borderBottom: `1px solid ${colors.gray[100]}`
            }}>
              <Typography variant="h4">Cancellation Requests</Typography>
            </div>
            {cancellationRequests.length === 0 ? (
              <div style={{ padding: spacing[5], textAlign: 'center' }}>
                <Typography variant="bodySmall" color={colors.gray[400]}>
                  No pending cancellations
                </Typography>
              </div>
            ) : (
              cancellationRequests.map((session, i) => (
                <div
                  key={session.session_id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: spacing[3],
                    padding: `${spacing[3]} ${spacing[4]}`,
                    borderBottom: i < cancellationRequests.length - 1 ? `1px solid ${colors.gray[100]}` : 'none'
                  }}
                >
                  <Avatar name={session.student_names?.[0] || 'S'} size="sm" />
                  <div style={{ flex: 1 }}>
                    <Typography variant="bodySmall" style={{ fontWeight: '600' }}>
                      {session.student_names?.length > 0 ? session.student_names.join(', ') : 'Session'}
                    </Typography>
                    <Typography variant="caption" color={colors.gray[400]}>
                      {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric'
                      })}
                      {session.start_time ? ` · ${session.start_time.slice(0, 5)}` : ''}
                      {session.cancellation_reason ? ` · "${session.cancellation_reason}"` : ''}
                    </Typography>
                  </div>
                  <button
                    onClick={() => handleRespondCancellation(session.session_id, 'approved')}
                    disabled={respondingCancelId === session.session_id}
                    style={{
                      width: '32px', height: '32px', border: 'none', borderRadius: radius.md,
                      backgroundColor: colors.primaryLight, color: colors.primary,
                      cursor: respondingCancelId === session.session_id ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleRespondCancellation(session.session_id, 'rejected')}
                    disabled={respondingCancelId === session.session_id}
                    style={{
                      width: '32px', height: '32px', border: 'none', borderRadius: radius.md,
                      backgroundColor: colors.errorLight, color: colors.error,
                      cursor: respondingCancelId === session.session_id ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </Card>

          {/* Needs Rating */}
          <Card style={{ padding: 0 }}>
            <div style={{
              padding: `${spacing[4]} ${spacing[4]} ${spacing[3]}`,
              borderBottom: `1px solid ${colors.gray[100]}`
            }}>
              <Typography variant="h4">Needs Rating</Typography>
            </div>
            {unratedSessions.length === 0 ? (
              <div style={{
                padding: spacing[5],
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2]
              }}>
                <span style={{ fontSize: '28px' }}>✓</span>
                <Typography variant="bodySmall" color={colors.gray[400]}>
                  All caught up!
                </Typography>
              </div>
            ) : (
              unratedSessions.map((session, i) => (
                <div
                  key={session.session_id}
                  onClick={() => navigate(`/sessions/${session.session_id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[3],
                    padding: `${spacing[3]} ${spacing[4]}`,
                    borderBottom: i < unratedSessions.length - 1
                      ? `1px solid ${colors.gray[100]}`
                      : 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '8px', height: '8px',
                    borderRadius: '50%',
                    backgroundColor: colors.warning,
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <Typography variant="bodySmall" style={{ fontWeight: '600' }}>
                      {session.student_names?.slice(0, 2).join(', ') || 'Session'}
                      {session.student_names?.length > 2
                        ? ` +${session.student_names.length - 2}`
                        : ''}
                    </Typography>
                    <Typography variant="caption" color={colors.gray[400]}>
                      {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric'
                      })} · {session.type}
                    </Typography>
                  </div>
                  <ChevronRight size={14} color={colors.gray[400]} />
                </div>
              ))
            )}
          </Card>

          {/* Recent Students */}
          <Card style={{ padding: 0 }}>
            <div style={{
              padding: `${spacing[4]} ${spacing[4]} ${spacing[3]}`,
              borderBottom: `1px solid ${colors.gray[100]}`
            }}>
              <Typography variant="h4">Recent Students</Typography>
            </div>
            {recentStudents.length === 0 ? (
              <div style={{ padding: spacing[5], textAlign: 'center' }}>
                <Typography variant="bodySmall" color={colors.gray[400]}>
                  No students yet
                </Typography>
              </div>
            ) : (
              recentStudents.map((student, i) => (
                <div
                  key={student.name}
                  onClick={() => navigate(student.id ? `/students?studentId=${student.id}` : '/students')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[3],
                    padding: `${spacing[3]} ${spacing[4]}`,
                    borderBottom: i < recentStudents.length - 1
                      ? `1px solid ${colors.gray[100]}`
                      : 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Avatar name={student.name} size="sm" />
                  <Typography variant="bodySmall" style={{ flex: 1, fontWeight: '500' }}>
                    {student.name}
                  </Typography>
                  <ChevronRight size={14} color={colors.gray[400]} />
                </div>
              ))
            )}
          </Card>

        </div>

      </div>

      {showBookModal && (
      <BookSessionModal
        student={bookStudent}
        students={students}
        onClose={() => { setShowBookModal(false); setBookStudent(null) }}
        onBooked={() => {
          setShowBookModal(false)
          setBookStudent(null)
          getSessions().then(res => setSessions(res.data))
        }}
      />
    )}

    </Layout>
  )
}

export default Dashboard