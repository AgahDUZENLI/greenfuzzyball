import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Avatar from '../components/Avatar'
import Button from '../components/Button'
import Typography from '../components/Typography'
import Input from '../components/Input'
import { getStudents, getStudentProgress, getSessions } from '../services/api'
import { colors, spacing, radius } from '../styles/tokens'
import { Search, Plus, Pencil, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import AddStudentModal from '../components/AddStudentModal'
import EditStudentModal from '../components/EditStudentModal'
import BookSessionModal from '../components/BookSessionModal'
import { useNavigate } from 'react-router-dom'
import useIsMobile from '../hooks/useIsMobile'



const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Kids', value: 'kids' },
  { label: 'Adults', value: 'adults' },
  { label: 'Vets', value: 'veterans' }
]

const CHART_COLORS = [colors.primary, '#9ca3af', '#3b82f6', '#f59e0b']

const levelColor = level =>
  level === 'advanced' ? colors.error
  : level === 'intermediate' ? colors.warning
  : colors.primary

function Students() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [students, setStudents] = useState([])
  const [selected, setSelected] = useState(null)
  const [mobileShowDetail, setMobileShowDetail] = useState(false)
  const [progress, setProgress] = useState([])
  const [sessions, setSessions] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBookModal, setShowBookModal] = useState(false)


  useEffect(() => {
    getStudents()
      .then(res => {
        setStudents(res.data)
        if (res.data.length > 0) setSelected(res.data[0])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) return
    getStudentProgress(selected.user_id)
      .then(res => setProgress(res.data.progress || []))
      .catch(() => setProgress([]))
    getSessions(null, selected.user_id)
      .then(res => setSessions(res.data.sort((a, b) => b.date.localeCompare(a.date))))
      .catch(() => setSessions([]))
  }, [selected])

  const filtered = students.filter(s =>
    (filter === 'all' || s.age_group === filter) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  // Build chart data
  const drillNames = [...new Set(progress.map(p => p.drill_name))]
  const chartData = Object.values(
    progress.reduce((acc, p) => {
      if (!acc[p.session_date]) acc[p.session_date] = { date: p.session_date }
      acc[p.session_date][p.drill_name] = parseFloat(p.rolling_avg)
      return acc
    }, {})
  ).sort((a, b) => a.date.localeCompare(b.date))

  const avgRating = progress.length > 0
    ? (progress.reduce((sum, p) => sum + parseFloat(p.rating), 0) / progress.length).toFixed(1)
    : '—'

  const capitalize = str => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

  const formatSessionDate = dateStr =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography variant="bodySmall" color={colors.gray[400]}>Loading...</Typography>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

        {/* ── Left panel ── */}
        {(!isMobile || !mobileShowDetail) && (
        <div style={{
          width: isMobile ? '100%' : '320px', flexShrink: 0,
          borderRight: `1px solid ${colors.gray[200]}`,
          backgroundColor: 'white',
          display: 'flex', flexDirection: 'column'
        }}>

          {/* Header */}
          <div style={{ padding: `${spacing[6]} ${spacing[5]} ${spacing[3]}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[4] }}>
              <div>
                <Typography variant="h3">Students</Typography>
                <Typography variant="caption" color={colors.gray[400]}>{students.length} athletes</Typography>
              </div>
              <button 
              onClick={() => setShowAddModal(true)}
              style={{
                width: '36px', height: '36px',
                backgroundColor: colors.primary, border: 'none',
                borderRadius: radius.lg, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Plus size={18} color="white" />
              </button>
            </div>

            <div style={{ marginBottom: spacing[3] }}>
              <Input
                icon={<Search size={16} />}
                placeholder="Search students"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: spacing[2] }}>
              {FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: radius.full,
                    border: `1px solid ${filter === f.value ? colors.primary : colors.gray[200]}`,
                    backgroundColor: filter === f.value ? colors.primary : 'white',
                    color: filter === f.value ? 'white' : colors.gray[600],
                    fontSize: '13px', fontWeight: '500',
                    cursor: 'pointer', fontFamily: 'inherit'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.map(student => {
              const isSelected = selected?.user_id === student.user_id
              return (
                <div
                  key={student.user_id}
                  onClick={() => { setSelected(student); setMobileShowDetail(true) }}
                  style={{
                    display: 'flex', alignItems: 'center',
                    gap: spacing[3], padding: `${spacing[3]} ${spacing[5]}`,
                    cursor: 'pointer',
                    backgroundColor: isSelected ? colors.primaryLight : 'transparent',
                    borderLeft: `3px solid ${isSelected ? colors.primary : 'transparent'}`,
                    transition: 'all 0.15s'
                  }}
                >
                  <Avatar name={student.name} size="md" />
                  <div style={{ flex: 1 }}>
                    <Typography variant="body" style={{
                      fontWeight: isSelected ? '600' : '500',
                      color: isSelected ? colors.primary : colors.black
                    }}>
                      {student.name}
                    </Typography>
                    <Typography variant="caption" color={colors.gray[400]}>
                      {capitalize(student.age_group)}
                    </Typography>
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: '600',
                    color: levelColor(student.level),
                    textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    {student.level?.slice(0, 3)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        )}

        {/* ── Right panel ── */}
        {(!isMobile || mobileShowDetail) && (
        selected ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? spacing[4] : spacing[8], backgroundColor: colors.gray[50] }}>

            {isMobile && (
              <button
                onClick={() => setMobileShowDetail(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: spacing[1],
                  border: 'none', background: 'none', cursor: 'pointer',
                  color: colors.gray[500], fontSize: '14px', fontWeight: '500',
                  fontFamily: 'inherit', padding: 0, marginBottom: spacing[4]
                }}
              >
                <ChevronLeft size={16} /> Back to students
              </button>
            )}

            {/* Profile header */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: isMobile ? spacing[4] : 0,
              marginBottom: spacing[6]
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
                <Avatar name={selected.name} size="lg" />
                <div>
                  <Typography variant="h2" mb={spacing[1]}>{selected.name}</Typography>
                  <Typography variant="bodySmall" color={colors.gray[500]}>
                    {capitalize(selected.age_group)} · {capitalize(selected.level)}
                  </Typography>
                </div>
              </div>
              <div style={{ display: 'flex', gap: spacing[3] }}>
                <Button variant="outline" onClick={() => setShowEditModal(true)}>
                  <Pencil size={14} /> Edit
                 </Button>

                <Button onClick={() => setShowBookModal(true)}>
                  <Plus size={14} /> New Session
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: spacing[4], marginBottom: spacing[5] }}>
              {[
                { label: 'Sessions', value: sessions.length },
                { label: 'Avg rating', value: avgRating, green: true },
                { label: 'Level', value: capitalize(selected.level) }
              ].map((stat, i) => (
                <Card key={i}>
                  <Typography variant="h2" mb={spacing[1]} style={{ color: stat.green ? colors.primary : colors.black }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color={colors.gray[400]}>{stat.label}</Typography>
                </Card>
              ))}
            </div>

            {/* Contact */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: spacing[4], marginBottom: spacing[5] }}>
              {[
                { label: 'PHONE', value: selected.phone, placeholder: '— — ——————' },
                { label: 'EMAIL', value: selected.email, placeholder: '————————@———' }
              ].map(({ label, value, placeholder }) => (
                <Card key={label}>
                  <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>{label}</Typography>
                  <Typography variant="body" color={value ? colors.black : colors.gray[300]}>
                    {value || placeholder}
                  </Typography>
                </Card>
              ))}
            </div>

            {/* Progress chart */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[5] }}>
                <Typography variant="h4">Progress over time</Typography>
                <div style={{ display: 'flex', gap: spacing[4] }}>
                  {drillNames.slice(0, 4).map((name, i) => (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                      <div style={{ width: '20px', height: '2px', backgroundColor: CHART_COLORS[i], borderRadius: '1px' }} />
                      <Typography variant="caption" color={colors.gray[500]}>{name}</Typography>
                    </div>
                  ))}
                </div>
              </div>

              {chartData.length === 0 ? (
                <div style={{ padding: spacing[8], textAlign: 'center' }}>
                  <Typography variant="bodySmall" color={colors.gray[400]}>No progress data yet</Typography>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      tick={{ fontSize: 12, fill: colors.gray[400] }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      domain={[0, 10]}
                      tick={{ fontSize: 12, fill: colors.gray[400] }}
                      axisLine={false} tickLine={false}
                    />
                    <Tooltip contentStyle={{ borderRadius: radius.lg, border: `1px solid ${colors.gray[200]}`, fontSize: '13px' }} />
                    {drillNames.slice(0, 4).map((name, i) => (
                      <Area
                        key={name}
                        type="monotone"
                        dataKey={name}
                        stroke={CHART_COLORS[i]}
                        fill={i === 0 ? `${colors.primary}15` : 'transparent'}
                        strokeWidth={2}
                        strokeDasharray={i > 0 ? '4 4' : undefined}
                        dot={{ r: 4, fill: CHART_COLORS[i], strokeWidth: 0 }}
                        connectNulls
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Sessions */}
            <Card style={{ marginTop: spacing[5] }}>
              <Typography variant="h4" mb={spacing[4]}>Sessions</Typography>

              {sessions.length === 0 ? (
                <div style={{ padding: spacing[8], textAlign: 'center' }}>
                  <Typography variant="bodySmall" color={colors.gray[400]}>No sessions yet</Typography>
                </div>
              ) : (
                <div>
                  {sessions.map(session => (
                    <div
                      key={session.session_id}
                      onClick={() => navigate(`/sessions/${session.session_id}`)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: spacing[3], padding: `${spacing[3]} 0`,
                        borderBottom: `1px solid ${colors.gray[100]}`,
                        cursor: 'pointer'
                      }}
                    >
                      <Typography variant="body" style={{ width: '130px', flexShrink: 0 }}>
                        {formatSessionDate(session.date)}
                      </Typography>

                      <span style={{
                        padding: '4px 12px',
                        borderRadius: radius.full,
                        backgroundColor: session.type === 'group' ? '#fef3c7' : colors.gray[100],
                        color: session.type === 'group' ? '#d97706' : colors.gray[600],
                        fontSize: '13px', fontWeight: '500'
                      }}>
                        {session.type === 'group' ? 'Group' : 'Private'}
                      </span>

                      <div style={{ flex: 1, textAlign: 'right' }}>
                        {session.unrated ? (
                          <Typography variant="caption" color={colors.gray[300]}>No ratings</Typography>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: spacing[2], color: colors.primary, fontSize: '13px', fontWeight: '600' }}>
                            <CheckCircle size={14} color={colors.primary} />
                            Rated
                          </div>
                        )}
                      </div>

                      <ChevronRight size={16} color={colors.gray[400]} />
                    </div>
                  ))}
                </div>
              )}
            </Card>

          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="bodySmall" color={colors.gray[400]}>Select a student</Typography>
          </div>
        ))}

      </div>
      {/* Modal — outside everything so it covers full screen */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onAdded={student => {
            setStudents(prev => [...prev, student])
            setSelected(student)
          }}
        />
      )}

      {showEditModal && selected && (
        <EditStudentModal
          student={selected}
          onClose={() => setShowEditModal(false)}
          onUpdated={updated => {
            setStudents(prev => prev.map(s => s.user_id === updated.user_id ? updated : s))
            setSelected(updated)
          }}
          onDeleted={id => {
            setStudents(prev => prev.filter(s => s.user_id !== id))
            setSelected(students.find(s => s.user_id !== id) || null)
          }}
        />
      )}

      {showBookModal && selected && (
        <BookSessionModal
          student={selected}
          onClose={() => setShowBookModal(false)}
          onBooked={() => {}}
        />
      )}

    </Layout>
  )
}

export default Students