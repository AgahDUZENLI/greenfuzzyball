import { useState, useEffect } from 'react'
import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'
import Button from './Button'
import { X, Calendar as CalendarIcon, Check } from 'lucide-react'
import { createSession, getCoachCourts, getSessions, getStudents } from '../services/api'
import { hasConflict, timeToMinutes, formatTime12 } from '../utils/timeUtils'
import StudentCard from './StudentCard'
import DateSelector from './DateSelector'
import TimeSelector from './TimeSelector'
import CourtSelector from './CourtSelector'
import SessionSummary from './SessionSummary'

function BookSessionModal({
  student: initialStudent,
  initialStudents = [],
  initialCourtId = null,
  initialDuration = null,
  initialDrillIds = [],
  onClose,
  onBooked
}) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = tomorrow.toISOString().split('T')[0]

  const preStudents = initialStudents.length > 0 ? initialStudents : (initialStudent ? [initialStudent] : [])

  const [selectedStudents, setSelectedStudents] = useState(preStudents)
  const [allStudents, setAllStudents] = useState([])
  const [studentSearch, setStudentSearch] = useState('')
  const [courts, setCourts] = useState([])
  const [daySessions, setDaySessions] = useState([])
  const [date, setDate] = useState(defaultDate)
  const [timeSlot, setTimeSlot] = useState('09:00')
  const [courtId, setCourtId] = useState(initialCourtId || '')
  const [type, setType] = useState(preStudents.length > 1 ? 'group' : 'private')
  const [duration, setDuration] = useState(initialDuration || 60)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getStudents().then(res => setAllStudents(res.data)).catch(() => setAllStudents([]))
  }, [])

  useEffect(() => {
    getCoachCourts()
      .then(res => {
        setCourts(res.data)
        if (!initialCourtId && res.data.length > 0) setCourtId(res.data[0].court_id)
      })
      .catch(() => setCourts([]))
  }, [])

  useEffect(() => {
    getSessions(date)
      .then(res => setDaySessions(res.data))
      .catch(() => setDaySessions([]))
  }, [date])

  useEffect(() => {
    if (selectedStudents.length > 1) setType('group')
  }, [selectedStudents.length])

  const addStudent = (s) => {
    setSelectedStudents(prev => [...prev, s])
    setStudentSearch('')
  }

  const removeStudent = (userId) => {
    setSelectedStudents(prev => prev.filter(s => s.user_id !== userId))
  }

  const conflict = hasConflict(daySessions, timeSlot, duration)

  const handleBook = async () => {
    setError('')
    setLoading(true)
    try {
      const [h, m] = timeSlot.split(':')
      const paddedTime = `${String(h).padStart(2, '0')}:${m || '00'}`
      const res = await createSession({
        date,
        start_time: paddedTime,
        duration_minutes: duration,
        type,
        court_id: courtId || null,
        student_ids: selectedStudents.map(s => s.user_id),
        drill_ids: initialDrillIds
      })
      onBooked && onBooked(res.data)
      onClose()
    } catch {
      setError('Could not book session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedDateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric'
  })

  // Build timeline slots for SessionSummary
  const newSessionMins = timeToMinutes(timeSlot)
  const allSlots = []
  let cur = 8 * 60
  const sorted = [...daySessions].sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time))
  sorted.forEach(s => {
    const sStart = timeToMinutes(s.start_time)
    const sEnd = sStart + (s.duration_minutes || 60)
    if (cur < sStart) allSlots.push({ type: 'free', start: cur, end: sStart })
    allSlots.push({ type: 'session', session: s, start: sStart, end: sEnd })
    cur = sEnd
  })
  const newSlot = { type: 'new', start: newSessionMins, end: newSessionMins + duration }
  const insertAt = allSlots.findIndex(s => s.start > newSessionMins)
  insertAt === -1 ? allSlots.push(newSlot) : allSlots.splice(insertAt, 0, newSlot)
  const last = allSlots[allSlots.length - 1]
  if (last && last.end < 22 * 60) allSlots.push({ type: 'free', start: last.end, end: 22 * 60 })

  const filteredStudents = allStudents
    .filter(s => !selectedStudents.find(sel => sel.user_id === s.user_id))
    .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()))

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 9999, padding: spacing[4]
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        backgroundColor: 'white', borderRadius: radius['2xl'],
        width: '100%', maxWidth: '860px', maxHeight: '90vh',
        overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column'
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          padding: `${spacing[6]} ${spacing[6]} ${spacing[4]}`,
          borderBottom: `1px solid ${colors.gray[100]}`
        }}>
          <div>
            <Typography variant="h3">{initialStudents.length > 0 ? 'Repeat Session' : 'Book Session'}</Typography>
            {selectedStudents.length > 0 && (
              <Typography variant="bodySmall" color={colors.gray[400]}>
                with {selectedStudents.map(s => s.name).join(', ')}
              </Typography>
            )}
          </div>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', border: 'none',
            borderRadius: radius.lg, backgroundColor: colors.gray[100],
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={16} color={colors.gray[500]} />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1 }}>

          {/* Left */}
          <div style={{ padding: spacing[6], borderRight: `1px solid ${colors.gray[100]}` }}>

            {/* Selected students */}
            {selectedStudents.length > 0 && (
              <StudentCard
                students={selectedStudents}
                type={type}
                onTypeChange={setType}
                onRemove={removeStudent}
              />
            )}

            {/* Student search */}
            <div style={{ marginBottom: spacing[5] }}>
              <Typography variant="bodySmall" style={{ fontWeight: '600', marginBottom: spacing[2] }}>
                {selectedStudents.length === 0 ? 'Select Student' : 'Add Another Student'}
              </Typography>
              <input
                autoFocus={selectedStudents.length === 0}
                placeholder="Search students..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                style={{
                  width: '100%', padding: `${spacing[3]} ${spacing[4]}`,
                  border: `1px solid ${colors.gray[200]}`, borderRadius: radius.lg,
                  fontSize: '14px', fontFamily: 'inherit', outline: 'none',
                  boxSizing: 'border-box', marginBottom: spacing[2]
                }}
              />
              <div style={{
                maxHeight: '180px', overflowY: 'auto',
                border: `1px solid ${colors.gray[200]}`, borderRadius: radius.lg
              }}>
                {filteredStudents.map((s, i, arr) => (
                  <div
                    key={s.user_id}
                    onClick={() => addStudent(s)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: spacing[3],
                      padding: `${spacing[3]} ${spacing[4]}`,
                      borderBottom: i < arr.length - 1 ? `1px solid ${colors.gray[100]}` : 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.gray[50]}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      backgroundColor: colors.primaryLight, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: '600', color: colors.primary, flexShrink: 0
                    }}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <Typography variant="bodySmall" style={{ fontWeight: '600' }}>{s.name}</Typography>
                      <Typography variant="caption" color={colors.gray[400]}>
                        {s.age_group} · {s.level}
                      </Typography>
                    </div>
                  </div>
                ))}
                {filteredStudents.length === 0 && (
                  <div style={{ padding: spacing[4], textAlign: 'center' }}>
                    <Typography variant="bodySmall" color={colors.gray[400]}>
                      {allStudents.length === 0 ? 'Loading...' : 'No students found'}
                    </Typography>
                  </div>
                )}
              </div>
            </div>

            <DateSelector
              date={date} onDateChange={setDate}
              duration={duration} onDurationChange={setDuration}
            />
            <TimeSelector
              timeSlot={timeSlot} onTimeChange={setTimeSlot}
              duration={duration} daySessions={daySessions} conflict={conflict}
            />
            <CourtSelector courts={courts} courtId={courtId} onCourtChange={setCourtId} />
            {error && (
              <div style={{
                backgroundColor: colors.errorLight, color: colors.error,
                padding: spacing[3], borderRadius: radius.md, fontSize: '13px'
              }}>
                {error}
              </div>
            )}
          </div>

          {/* Right */}
          <SessionSummary
            allSlots={allSlots}
            student={selectedStudents[0] || null}
            courts={courts}
            courtId={courtId}
            daySessions={daySessions}
            selectedDateLabel={selectedDateLabel}
            onSlotClick={setTimeSlot}
          />
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: `${spacing[4]} ${spacing[6]}`,
          borderTop: `1px solid ${colors.gray[100]}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            {conflict ? (
              <>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.error }} />
                <Typography variant="bodySmall" color={colors.error}>
                  {formatTime12(timeSlot)} conflicts with another session
                </Typography>
              </>
            ) : (
              <>
                <Check size={16} color={colors.primary} />
                <Typography variant="bodySmall" color={colors.primary}>
                  {formatTime12(timeSlot)} is open · no conflicts
                </Typography>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: spacing[3], alignItems: 'center' }}>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', color: colors.gray[500],
              fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
            }}>
              Cancel
            </button>
            <Button onClick={handleBook} disabled={loading || conflict || selectedStudents.length === 0}>
              <CalendarIcon size={16} />
              {loading ? 'Booking...' : 'Book Session'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default BookSessionModal
