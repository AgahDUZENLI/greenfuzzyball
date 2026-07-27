import { useState, useEffect } from 'react'
import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'
import Button from './Button'
import Modal from './Modal'
import PersonSwitcher from './PersonSwitcher'
import { Send } from 'lucide-react'
import { requestSession, getMyJoinRequests } from '../services/api'
import useIsMobile from '../hooks/useIsMobile'

function RequestSessionModal({ people, initialPersonId, onClose, onRequested }) {
  const isMobile = useIsMobile()
  const [personId, setPersonId] = useState(initialPersonId)
  const [coaches, setCoaches] = useState([])
  const [coachesLoading, setCoachesLoading] = useState(true)
  const [coachId, setCoachId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyJoinRequests()
      .then(res => setCoaches(res.data.filter(r => r.status === 'approved')))
      .catch(() => setCoaches([]))
      .finally(() => setCoachesLoading(false))
  }, [])

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
    <Modal title="Request Session" subtitle={selectedPerson ? `For ${selectedPerson.name}` : undefined} onClose={onClose} maxWidth="480px">

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

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: spacing[4], marginBottom: spacing[4] }}>
            <div>
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
            <div>
              <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>TIME (OPTIONAL)</Typography>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = colors.primary}
                onBlur={e => e.target.style.borderColor = colors.gray[200]}
              />
            </div>
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
    </Modal>
  )
}

export default RequestSessionModal
