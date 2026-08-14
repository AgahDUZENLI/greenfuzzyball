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
import PersonSwitcher from '../../components/PersonSwitcher'
import NotificationBell from '../../components/NotificationBell'
import RequestSessionModal from '../../components/RequestSessionModal'
import CancelSessionModal from '../../components/CancelSessionModal'
import { colors, spacing, radius } from '../../styles/tokens'
import { Calendar as CalendarIcon, Target, Clock, Plus, CheckCircle, XCircle } from 'lucide-react'
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts'
import {
  getMemberSessions, getMemberProgress, getChildren,
  getMyJoinRequests, getMySessionRequests
} from '../../services/api'
import useIsMobile from '../../hooks/useIsMobile'
import { getPageCache, setPageCache } from '../../utils/pageCache'
import { localDateStr } from '../../utils/timeUtils'

const CHILD_COLORS = ['#8b5cf6', '#3b82f6', '#ec4899', '#06b6d4']

function firstName(name) {
  return name ? name.split(' ')[0] : ''
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}

function formatTime(t) {
  if (!t) return null
  const [h, m] = String(t).split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 || 12
  return `${display}:${m} ${ampm}`
}

function formatShortDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  })
}

function MemberDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const cached = getPageCache('member-dashboard')
  const [children, setChildren] = useState(() => cached?.children ?? [])
  const [selfSessions, setSelfSessions] = useState(() => cached?.selfSessions ?? [])
  const [selfProgress, setSelfProgress] = useState(() => cached?.selfProgress ?? [])
  const [sessionsByPerson, setSessionsByPerson] = useState(() => cached?.sessionsByPerson ?? {})
  const [progressByPerson, setProgressByPerson] = useState(() => cached?.progressByPerson ?? {})
  const [sessionRequests, setSessionRequests] = useState(() => cached?.sessionRequests ?? [])
  const [selfCoach, setSelfCoach] = useState(() => cached?.selfCoach ?? null)
  const [loading, setLoading] = useState(() => !cached)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedPersonId, setSelectedPersonId] = useState(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)

  const refreshSessionRequests = () => {
    getMySessionRequests().then(res => setSessionRequests(res.data)).catch(() => {})
  }

  const fetchAll = async () => {
    try {
      const [childrenRes, joinReqRes, sessionsRes, progressRes, sessionReqRes] = await Promise.all([
        getChildren(),
        getMyJoinRequests(),
        getMemberSessions(),
        getMemberProgress(),
        getMySessionRequests()
      ])

      setChildren(childrenRes.data)
      setSelfSessions(sessionsRes.data)
      setSelfProgress(progressRes.data)
      setSessionRequests(sessionReqRes.data)

      const approved = joinReqRes.data.find(r => r.status === 'approved')
      setSelfCoach(approved ? { coach_id: approved.coach_id, coach_name: approved.coach_name } : null)

      const kids = childrenRes.data
      let sByP = {}, pByP = {}
      if (kids.length > 0) {
        const results = await Promise.all(
          kids.map(k => Promise.all([getMemberSessions(k.user_id), getMemberProgress(k.user_id)]))
        )
        kids.forEach((k, i) => {
          sByP[k.user_id] = results[i][0].data
          pByP[k.user_id] = results[i][1].data
        })
        setSessionsByPerson(sByP)
        setProgressByPerson(pByP)
      }

      setPageCache('member-dashboard', {
        children: childrenRes.data,
        selfSessions: sessionsRes.data,
        selfProgress: progressRes.data,
        sessionRequests: sessionReqRes.data,
        selfCoach: approved ? { coach_id: approved.coach_id, coach_name: approved.coach_name } : null,
        sessionsByPerson: sByP,
        progressByPerson: pByP
      })
    } catch (err) {
      console.error('Member dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const todayStr = localDateStr()

  const people = user ? [
    { id: user.user_id, label: `${firstName(user.name)} (Me)`, name: user.name, isSelf: true, coach_id: selfCoach?.coach_id, coach_name: selfCoach?.coach_name },
    ...children.map(c => ({ id: c.user_id, label: firstName(c.name), name: c.name, isSelf: false, coach_id: c.coach_id, coach_name: c.coach_name }))
  ] : []

  const effectiveSelectedId = selectedPersonId || user?.user_id

  // Family-wide calendar dots (cancelled sessions are grayed out by Calendar itself) + legend
  const calendarSessions = [
    ...selfSessions.map(s => ({ date: s.date, status: s.status, color: colors.primary })),
    ...children.flatMap((c, i) =>
      (sessionsByPerson[c.user_id] || []).map(s => ({ date: s.date, status: s.status, color: CHILD_COLORS[i % CHILD_COLORS.length] }))
    ),
    ...sessionRequests.filter(r => r.status === 'pending').map(r => ({ date: r.requested_date, status: 'pending', color: colors.warning }))
  ]

  const legend = [
    { color: colors.primary, label: `${firstName(user?.name)} · confirmed` },
    ...children.map((c, i) => ({ color: CHILD_COLORS[i % CHILD_COLORS.length], label: `${firstName(c.name)} · confirmed` })),
    { color: colors.warning, label: 'Pending' },
    { color: colors.gray[300], label: 'Cancelled' }
  ]

  const taggedFamilySessions = [
    ...selfSessions.map(s => ({ ...s, personName: firstName(user?.name) })),
    ...children.flatMap(c => (sessionsByPerson[c.user_id] || []).map(s => ({ ...s, personName: firstName(c.name) })))
  ]

  // Family-wide banners
  const nextSession = taggedFamilySessions
    .filter(s => s.date >= todayStr && s.status !== 'cancelled')
    .sort((a, b) => a.date.localeCompare(b.date) || (a.start_time || '').localeCompare(b.start_time || ''))[0]

  const nextPending = sessionRequests
    .filter(r => r.status === 'pending')
    .sort((a, b) => a.requested_date.localeCompare(b.requested_date) || (a.requested_time || '').localeCompare(b.requested_time || ''))[0]

  // Switcher-scoped data
  const isSelf = effectiveSelectedId === user?.user_id
  const currentSessions = isSelf ? selfSessions : (sessionsByPerson[effectiveSelectedId] || [])
  const currentProgress = isSelf ? selfProgress : (progressByPerson[effectiveSelectedId] || [])

  const totalSessions = currentSessions.length
  const avgRating = currentProgress.length
    ? (currentProgress.reduce((sum, p) => sum + Number(p.rating), 0) / currentProgress.length).toFixed(1)
    : '—'

  const latestSession = currentSessions
    .filter(s => s.date < todayStr)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.start_time || '').localeCompare(a.start_time || ''))[0]

  const chartData = Object.values(
    currentProgress.reduce((acc, p) => {
      if (!acc[p.date]) acc[p.date] = { date: p.date, total: 0, count: 0 }
      acc[p.date].total += Number(p.rating)
      acc[p.date].count += 1
      return acc
    }, {})
  ).map(d => ({ date: d.date, avg: d.total / d.count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const latestByDrill = {}
  ;[...currentProgress].sort((a, b) => b.date.localeCompare(a.date)).forEach(p => {
    if (!(p.drill_name in latestByDrill)) latestByDrill[p.drill_name] = p.rating
  })
  const topDrillRows = Object.entries(latestByDrill).slice(0, 2)

  // Family Schedule — always keyed off the selected calendar day (defaults today)
  const scheduleDate = selectedDate || todayStr
  const familyScheduleRows = [
    ...selfSessions.filter(s => s.date === scheduleDate).map(s => ({ ...s, personName: firstName(user?.name), kind: 'session', status: s.status || 'scheduled' })),
    ...children.flatMap(c => (sessionsByPerson[c.user_id] || [])
      .filter(s => s.date === scheduleDate)
      .map(s => ({ ...s, personName: firstName(c.name), kind: 'session', status: s.status || 'scheduled' }))),
    ...sessionRequests
      .filter(r => r.requested_date === scheduleDate && r.status === 'pending')
      .map(r => ({ ...r, personName: r.student_name, kind: 'request', status: 'pending', start_time: r.requested_time }))
  ].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))

  const scheduleStatusMeta = {
    pending: { label: 'Pending', color: colors.warning, bg: colors.warningLight },
    scheduled: { label: 'Confirmed', color: colors.primary, bg: colors.primaryLight },
    cancellation_pending: { label: 'Cancellation Pending', color: colors.warning, bg: colors.warningLight },
    cancelled: { label: 'Cancelled', color: colors.gray[500], bg: colors.gray[100] }
  }

  const scheduleDateLabel = new Date(scheduleDate + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  })

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

        {/* Main column */}
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
            marginBottom: isMobile ? spacing[4] : spacing[6]
          }}>
            <div>
              <Typography variant="h2" mb={spacing[1]}>
                Good morning, {firstName(user?.name)}
              </Typography>
              <Typography variant="bodySmall">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric'
                })}
              </Typography>
            </div>
            <div style={{ display: 'flex', gap: spacing[3], alignItems: 'center', justifyContent: isMobile ? 'flex-end' : 'flex-start' }}>
              <NotificationBell />
              <Button onClick={() => setShowRequestModal(true)}>
                <Plus size={16} /> Request Session
              </Button>
            </div>
          </div>

          {/* Person switcher */}
          <div style={{ marginBottom: spacing[3] }}>
            <PersonSwitcher people={people} selectedId={effectiveSelectedId} onSelect={setSelectedPersonId} />
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: spacing[4],
            marginBottom: isMobile ? spacing[4] : spacing[6]
          }}>
            <StatCard label="Total sessions" value={totalSessions} icon={<CalendarIcon size={20} color={colors.primary} />} />
            <StatCard label="Avg rating" value={avgRating} icon={<Target size={20} color={colors.primary} />} />
          </div>

          {/* Calendar */}
          <div style={{ marginBottom: isMobile ? spacing[4] : spacing[6] }}>
            <Calendar
              sessions={calendarSessions}
              legend={legend}
              selectedDate={selectedDate}
              onDayClick={setSelectedDate}
            />
          </div>

          {/* Next session banner */}
          {nextSession && (
            <div style={{
              backgroundColor: colors.black,
              borderRadius: radius.xl,
              padding: isMobile ? `${spacing[3]} ${spacing[4]}` : `${spacing[4]} ${spacing[5]}`,
              marginBottom: isMobile ? spacing[3] : spacing[4],
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: spacing[4]
            }}>
              <div style={{ minWidth: '110px' }}>
                <Typography variant="caption" color={colors.gray[400]} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Next Session
                </Typography>
                <div style={{ fontSize: '15px', fontWeight: '700', color: 'white' }}>
                  {formatShortDate(nextSession.date)}
                </div>
              </div>
              <Avatar name={nextSession.coach_name || nextSession.personName || 'Coach'} size="md" />
              <div style={{ flex: 1 }}>
                <Typography variant="body" style={{ color: 'white', fontWeight: '600' }}>
                  {nextSession.coach_name ? `Coach ${nextSession.coach_name}` : 'Session'}
                </Typography>
                <Typography variant="bodySmall" color={colors.gray[400]}>
                  {nextSession.personName}
                  {nextSession.start_time ? ` · ${formatTime(nextSession.start_time)}` : ''}
                  {nextSession.court_name ? ` · ${nextSession.court_name}` : ''}
                  {nextSession.type ? ` · ${capitalize(nextSession.type)}` : ''}
                </Typography>
              </div>
              <span style={{
                backgroundColor: nextSession.status === 'cancellation_pending' ? colors.warning : colors.primary,
                color: 'white',
                padding: '4px 12px', borderRadius: radius.full,
                fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap'
              }}>
                {nextSession.status === 'cancellation_pending' ? 'Cancellation Pending' : 'Confirmed'}
              </span>
            </div>
          )}

          {/* Pending request banner */}
          {nextPending && (
            <div style={{
              border: `1px solid ${colors.warning}`,
              backgroundColor: colors.warningLight,
              borderRadius: radius.xl,
              padding: `${spacing[3]} ${spacing[5]}`,
              marginBottom: isMobile ? spacing[4] : spacing[6],
              display: 'flex',
              alignItems: 'center',
              gap: spacing[3]
            }}>
              <Clock size={16} color={colors.warning} />
              <Typography variant="bodySmall" style={{ color: colors.warning, fontWeight: '600' }}>
                Request pending · {formatShortDate(nextPending.requested_date)}
                {nextPending.requested_time ? ` · ${formatTime(nextPending.requested_time)}` : ''} · awaiting coach approval
              </Typography>
            </div>
          )}

          {/* Sessions for selected day */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing[4]
          }}>
            <Typography variant="h3">{scheduleDateLabel} Schedule</Typography>
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

          {familyScheduleRows.length === 0 ? (
            <Card style={{ padding: spacing[6], textAlign: 'center', marginBottom: isMobile ? spacing[4] : spacing[6] }}>
              <Typography variant="bodySmall" color={colors.gray[400]}>
                No sessions scheduled
              </Typography>
            </Card>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: spacing[3],
              marginBottom: isMobile ? spacing[4] : spacing[6]
            }}>
              {familyScheduleRows.map(row => {
                const meta = scheduleStatusMeta[row.status] || scheduleStatusMeta.scheduled
                const canCancel = row.kind === 'session' && row.status === 'scheduled'
                return (
                  <div
                    key={row.session_id || row.request_id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: spacing[3],
                      padding: `${spacing[3]} ${spacing[4]}`,
                      borderRadius: radius.xl,
                      backgroundColor: 'white',
                      border: `1px solid ${colors.gray[200]}`,
                      opacity: row.status === 'cancelled' ? 0.6 : 1
                    }}
                  >
                    <Avatar name={row.personName} size="sm" />
                    <div style={{ flex: 1 }}>
                      <Typography variant="bodySmall" style={{ fontWeight: '600' }}>
                        {row.personName}{row.start_time ? ` · ${formatTime(row.start_time)}` : ''}
                      </Typography>
                      <Typography variant="caption" color={colors.gray[400]}>
                        {row.kind === 'request' ? 'Requested, pending' : `${meta.label}${row.court_name ? ` · ${row.court_name}` : ''}`}
                      </Typography>
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
                    {canCancel && (
                      <button
                        onClick={() => setCancelTarget(row)}
                        title="Cancel session"
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: 2, display: 'flex', color: colors.gray[400], flexShrink: 0
                        }}
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Latest session */}
          <Typography variant="h3" mb={spacing[4]}>Latest Session</Typography>
          {!latestSession ? (
            <Card style={{ padding: spacing[6], textAlign: 'center' }}>
              <Typography variant="bodySmall" color={colors.gray[400]}>
                No sessions yet
              </Typography>
            </Card>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[4],
              padding: `${spacing[4]} ${spacing[5]}`,
              borderRadius: radius.xl,
              backgroundColor: 'white',
              border: `1px solid ${colors.gray[200]}`
            }}>
              <Avatar name={latestSession.coach_name || 'Coach'} size="md" />
              <div style={{ flex: 1 }}>
                <Typography variant="body" style={{ fontWeight: '600' }}>
                  {latestSession.coach_name || 'Session'}
                </Typography>
                <Typography variant="bodySmall" color={colors.gray[500]}>
                  {formatShortDate(latestSession.date)}
                  {latestSession.type ? ` · ${capitalize(latestSession.type)}` : ''}
                  {latestSession.court_name ? ` · ${latestSession.court_name}` : ''}
                </Typography>
              </div>
            </div>
          )}

        </div>

        {/* Right column */}
        <div style={{
          width: isMobile ? '100%' : '300px',
          flexShrink: 0,
          backgroundColor: 'white',
          borderLeft: isMobile ? 'none' : `1px solid ${colors.gray[100]}`,
          borderTop: isMobile ? `1px solid ${colors.gray[100]}` : 'none',
          overflowY: isMobile ? 'visible' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? spacing[4] : spacing[6],
          padding: isMobile ? spacing[4] : spacing[6]
        }}>

          {/* Rating over time */}
          <Card style={{ padding: 0 }}>
            <div style={{
              padding: `${spacing[4]} ${spacing[4]} ${spacing[3]}`,
              borderBottom: `1px solid ${colors.gray[100]}`
            }}>
              <Typography variant="h4">Rating over time</Typography>
            </div>
            <div style={{ padding: spacing[4] }}>
              {chartData.length === 0 ? (
                <Typography variant="bodySmall" color={colors.gray[400]}>No ratings yet</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={100}>
                  <AreaChart data={chartData}>
                    <Tooltip
                      contentStyle={{ borderRadius: radius.lg, border: `1px solid ${colors.gray[200]}`, fontSize: '12px' }}
                      labelFormatter={d => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      formatter={v => [Number(v).toFixed(1), 'Avg rating']}
                    />
                    <Area
                      type="monotone"
                      dataKey="avg"
                      stroke={colors.primary}
                      fill={`${colors.primary}15`}
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              {topDrillRows.length > 0 && (
                <div style={{ marginTop: spacing[3] }}>
                  {topDrillRows.map(([name, rating]) => (
                    <div key={name} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: `${spacing[2]} 0`
                    }}>
                      <Typography variant="bodySmall" color={colors.gray[600]}>{name}</Typography>
                      <Typography variant="bodySmall" style={{ fontWeight: '700' }}>{Number(rating).toFixed(1)}</Typography>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* My kids */}
          <Card style={{ padding: 0 }}>
            <div style={{
              padding: `${spacing[4]} ${spacing[4]} ${spacing[3]}`,
              borderBottom: `1px solid ${colors.gray[100]}`
            }}>
              <Typography variant="h4">My kids</Typography>
            </div>
            {people.map((p, i) => (
              <div
                key={p.id}
                onClick={() => setSelectedPersonId(p.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: spacing[3],
                  padding: `${spacing[3]} ${spacing[4]}`,
                  borderBottom: i < people.length - 1 ? `1px solid ${colors.gray[100]}` : 'none',
                  cursor: 'pointer'
                }}
              >
                <Avatar name={p.name} size="sm" />
                <Typography variant="bodySmall" style={{ flex: 1, fontWeight: '500' }}>{p.label}</Typography>
                {p.id === effectiveSelectedId && <CheckCircle size={16} color={colors.primary} />}
              </div>
            ))}
          </Card>

        </div>

      </div>

      {showRequestModal && people.length > 0 && (
        <RequestSessionModal
          people={people}
          initialPersonId={effectiveSelectedId}
          onClose={() => setShowRequestModal(false)}
          onRequested={refreshSessionRequests}
        />
      )}

      {cancelTarget && (
        <CancelSessionModal
          session={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onCancelled={fetchAll}
        />
      )}
    </Layout>
  )
}

export default MemberDashboard
