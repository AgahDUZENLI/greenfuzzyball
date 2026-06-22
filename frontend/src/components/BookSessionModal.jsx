import { useState, useEffect } from 'react'
import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'
import Avatar from './Avatar'
import Button from './Button'
import { X, MapPin, Calendar as CalendarIcon } from 'lucide-react'
import { createSession, getCourts } from '../services/api'

const TIME_SLOTS = ['9:00', '10:00', '11:30', '14:00', '15:30', '16:30', '17:30', '18:00']

const DURATIONS = [
  { label: '30 min', value: 30 },
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 },
  { label: '2 hours', value: 120 }
]

function BookSessionModal({ student, onClose, onBooked }) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = tomorrow.toISOString().split('T')[0]

  const [courts, setCourts] = useState([])
  const [date, setDate] = useState(defaultDate)
  const [duration, setDuration] = useState(60)
  const [timeSlot, setTimeSlot] = useState('10:00')
  const [courtId, setCourtId] = useState('')
  const [type, setType] = useState('private')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getCourts('Houston')
      .then(res => {
        setCourts(res.data)
        if (res.data.length > 0) setCourtId(res.data[0].court_id)
      })
      .catch(() => setCourts([]))
  }, [])

  const handleBook = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await createSession({
        date,
        start_time: timeSlot,
        duration_minutes: duration,
        type,
        court_id: courtId || null,
        student_ids: [student.user_id],
        drill_ids: []
      })
      onBooked && onBooked(res.data)
      onClose()
    } catch {
      setError('Could not book session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const capitalize = str => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 9999
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: radius['2xl'],
          width: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: `${spacing[6]} ${spacing[6]} ${spacing[4]}`
        }}>
          <div>
            <Typography variant="h3">Book Session</Typography>
            <Typography variant="bodySmall" color={colors.gray[400]}>
              with {student.name}
            </Typography>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px',
              border: 'none', borderRadius: radius.lg,
              backgroundColor: colors.gray[100],
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={16} color={colors.gray[500]} />
          </button>
        </div>

        <div style={{ padding: `0 ${spacing[6]} ${spacing[6]}` }}>

          {/* Student card */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: spacing[3], padding: spacing[4],
            backgroundColor: colors.primaryLight,
            borderRadius: radius.xl, marginBottom: spacing[5],
            border: `1.5px solid ${colors.primary}20`
          }}>
            <Avatar name={student.name} size="md" />
            <div style={{ flex: 1 }}>
              <Typography variant="body" style={{ fontWeight: '600' }}>
                {student.name}
              </Typography>
              <Typography variant="caption" color={colors.gray[500]}>
                {capitalize(student.age_group)} · {capitalize(student.level)}
              </Typography>
            </div>
            {/* Type toggle */}
            <div style={{
              display: 'flex', backgroundColor: 'white',
              borderRadius: radius.lg, padding: '3px',
              border: `1px solid ${colors.gray[200]}`
            }}>
              {['private', 'group'].map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  style={{
                    padding: '4px 12px', border: 'none',
                    borderRadius: radius.md, cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: '13px',
                    fontWeight: type === t ? '600' : '400',
                    backgroundColor: type === t ? colors.primary : 'transparent',
                    color: type === t ? 'white' : colors.gray[500],
                    transition: 'all 0.15s', textTransform: 'capitalize'
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              backgroundColor: colors.errorLight, color: colors.error,
              padding: spacing[3], borderRadius: radius.md,
              marginBottom: spacing[4], fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          {/* Date + Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4], marginBottom: spacing[4] }}>
            <div>
              <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>DATE</Typography>
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: spacing[3], padding: '12px 16px',
                border: `1.5px solid ${colors.primary}`,
                borderRadius: radius.lg
              }}>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{
                    border: 'none', outline: 'none',
                    fontSize: '15px', fontFamily: 'inherit',
                    color: colors.black, flex: 1,
                    backgroundColor: 'transparent'
                  }}
                />
              </div>
            </div>
            <div>
              <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>DURATION</Typography>
              <select
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                style={{
                  width: '100%', padding: '12px 16px',
                  border: `1.5px solid ${colors.gray[200]}`,
                  borderRadius: radius.lg, fontSize: '15px',
                  fontFamily: 'inherit', color: colors.black,
                  backgroundColor: 'white', cursor: 'pointer',
                  outline: 'none', boxSizing: 'border-box'
                }}
              >
                {DURATIONS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Time slots */}
          <div style={{ marginBottom: spacing[4] }}>
            <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>TIME SLOT</Typography>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: spacing[2]
            }}>
              {TIME_SLOTS.map(t => {
                const isSelected = timeSlot === t
                return (
                  <button
                    key={t}
                    onClick={() => setTimeSlot(t)}
                    style={{
                      padding: '12px 8px',
                      border: `1.5px solid ${isSelected ? colors.primary : colors.gray[200]}`,
                      borderRadius: radius.lg,
                      backgroundColor: isSelected ? colors.primary : 'white',
                      color: isSelected ? 'white' : colors.black,
                      fontSize: '14px',
                      fontWeight: isSelected ? '700' : '500',
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 0.15s'
                    }}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Court / Location */}
          <div style={{ marginBottom: spacing[6] }}>
            <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>COURT / LOCATION</Typography>
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: spacing[3], padding: '12px 16px',
              border: `1.5px solid ${colors.gray[200]}`,
              borderRadius: radius.lg, backgroundColor: 'white'
            }}>
              <MapPin size={16} color={colors.gray[400]} />
              <select
                value={courtId}
                onChange={e => setCourtId(e.target.value)}
                style={{
                  border: 'none', outline: 'none',
                  fontSize: '15px', fontFamily: 'inherit',
                  color: colors.black, flex: 1,
                  backgroundColor: 'transparent', cursor: 'pointer'
                }}
              >
                {courts.map(c => (
                  <option key={c.court_id} value={c.court_id}>
                    {c.name} {c.area ? `· ${c.area}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none',
                color: colors.gray[500], fontSize: '14px',
                fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              Cancel
            </button>
            <Button onClick={handleBook} disabled={loading}>
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