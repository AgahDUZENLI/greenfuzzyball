import { useState, useEffect } from 'react'
import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'
import Button from './Button'
import Modal from './Modal'
import PersonSwitcher from './PersonSwitcher'
import TimeSelector from './TimeSelector'
import { Send } from 'lucide-react'
import { requestSession, getMyJoinRequests, getCoachAvailability } from '../services/api'
import { hasConflict, formatTime12 } from '../utils/timeUtils'

const DAY_ABBR = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' }

function RequestSessionModal({ people, initialPersonId, onClose, onRequested }) {
  const [personId, setPersonId] = useState(initialPersonId)
  const [coaches, setCoaches] = useState([])
  const [coachesLoading, setCoachesLoading] = useState(true)
  const [coachId, setCoachId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [availability, setAvailability] = useState(null)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)

  useEffect(() => {
    getMyJoinRequests()
      .then(res => setCoaches(res.data.filter(r => r.status === 'approved')))
      .catch(() => setCoaches([]))
      .finally(() => setCoachesLoading(false))
  }, [])

  // Load the selected coach's availability + booked times for the chosen date
  useEffect(() => {
    if (!coachId || !date) {
      setAvailability(null)
      return
    }
    setAvailabilityLoading(true)
    getCoachAvailability(coachId, date)
      .then(res => setAvailability(res.data))
      .catch(() => setAvailability(null))
      .finally(() => setAvailabilityLoading(false))
  }, [coachId, date])

  const duration = availability?.session_duration?.[0] || 60
  const busyBlocks = availability?.busy_blocks || []
  const conflict = availability ? hasConflict(busyBlocks, time, duration) : false

  // Default the coach to whichever coach is already linked to the selected person
  useEffect(() => {
    const person = people.find(p => p.id === personId)
    if (person?.coach_id && coaches.some(c => c.coach_id === person.coach_id)) {
      setCoachId(person.coach_id)
    } else {
      setCoachId(coaches[0]?.coach_id || '')
    }
  }, [personId, coaches, people])

  const selectedPerson = people.find(p => p.id === personId)

  const handleSubmit = async () => {
    if (!coachId) return setError('Pick a coach')
    if (!date) return setError('Pick a date')
    setError('')
    setLoading(true)
    try {
      const res = await requestSession({
        coach_id: coachId,
        student_id: personId,
        requested_date: date,
        requested_time: time || null,
        notes: notes || null
      })
      onRequested(res.data)
      onClose()
    } catch {
      setError('Could not send request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectStyle = {
    width: '100%', padding: '12px 16px',
    border: `1.5px solid ${colors.gray[200]}`, borderRadius: radius.lg,
    fontSize: '15px', fontFamily: 'inherit', color: colors.black,
    outline: 'none', boxSizing: 'border-box', backgroundColor: 'white'
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    border: `1.5px solid ${colors.gray[200]}`, borderRadius: radius.lg,
    fontSize: '15px', fontFamily: 'inherit', color: colors.black,
    outline: 'none', boxSizing: 'border-box'
  }

  return (
    <Modal
      title="Request Session"
      subtitle={selectedPerson ? `For ${selectedPerson.name}` : undefined}
      onClose={onClose}
      maxWidth="480px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: colors.gray[500],
            fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
          }}>
            Cancel
          </button>
          {coaches.length > 0 && (
            <Button onClick={handleSubmit} disabled={loading}>
              <Send size={16} />
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
          )}
        </div>
      }
    >

      {error && (
        <div style={{
          backgroundColor: colors.errorLight, color: colors.error,
          padding: spacing[3], borderRadius: radius.md,
          marginBottom: spacing[4], fontSize: '13px'
        }}>
          {error}
        </div>
      )}

      {people.length > 1 && (
        <div style={{ marginBottom: spacing[4] }}>
          <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>WHO'S THIS FOR</Typography>
          <PersonSwitcher people={people} selectedId={personId} onSelect={setPersonId} />
        </div>
      )}

      {coachesLoading ? (
        <Typography variant="bodySmall" color={colors.gray[400]}>Loading coaches...</Typography>
      ) : coaches.length === 0 ? (
        <Typography variant="bodySmall" color={colors.gray[400]}>
          You're not connected with a coach yet.
        </Typography>
      ) : (
        <>
          <div style={{ marginBottom: spacing[4] }}>
            <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>COACH</Typography>
            <select value={coachId} onChange={e => setCoachId(e.target.value)} style={selectStyle}>
              {coaches.map(c => (
                <option key={c.coach_id} value={c.coach_id}>{c.coach_name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: spacing[2] }}>
            <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>DATE</Typography>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = colors.primary}
              onBlur={e => e.target.style.borderColor = colors.gray[200]}
            />
          </div>

          {availability && (
            <Typography variant="caption" color={colors.gray[400]} style={{ display: 'block', marginBottom: spacing[3] }}>
              Coach available {(availability.coaching_days || []).map(d => DAY_ABBR[d] || d).join(', ')}
              {availability.availability_start && availability.availability_end &&
                ` · ${formatTime12(String(availability.availability_start).slice(0, 5))} – ${formatTime12(String(availability.availability_end).slice(0, 5))}`}
            </Typography>
          )}

          <div style={{ marginBottom: spacing[4] }}>
            {!date ? (
              <Typography variant="bodySmall" color={colors.gray[400]}>Pick a date to see the coach's open times.</Typography>
            ) : availabilityLoading ? (
              <Typography variant="bodySmall" color={colors.gray[400]}>Loading availability...</Typography>
            ) : (
              <TimeSelector
                timeSlot={time}
                onTimeChange={setTime}
                duration={duration}
                daySessions={busyBlocks}
                conflict={conflict}
              />
            )}
          </div>

          <div style={{ marginBottom: spacing[6] }}>
            <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>NOTES</Typography>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Anything your coach should know..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={e => e.target.style.borderColor = colors.primary}
              onBlur={e => e.target.style.borderColor = colors.gray[200]}
            />
          </div>
        </>
      )}

    </Modal>
  )
}

export default RequestSessionModal
