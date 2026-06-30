import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'

const ALL_DURATIONS = [30, 45, 60, 75, 90, 105, 120, 150, 180]

const formatDuration = (mins) => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

function DateSelector({ date, onDateChange, duration, onDurationChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4], marginBottom: spacing[4] }}>
      <div>
        <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>DATE</Typography>
        <div style={{ padding: '12px 16px', border: `1.5px solid ${colors.primary}`, borderRadius: radius.lg }}>
          <input type="date" value={date} onChange={e => onDateChange(e.target.value)} style={{
            border: 'none', outline: 'none', fontSize: '14px',
            fontFamily: 'inherit', color: colors.black,
            width: '100%', backgroundColor: 'transparent'
          }} />
        </div>
      </div>
      <div>
        <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>DURATION</Typography>
        <select value={duration} onChange={e => onDurationChange(Number(e.target.value))} style={{
          width: '100%', padding: '12px 16px',
          border: `1.5px solid ${colors.gray[200]}`,
          borderRadius: radius.lg, fontSize: '14px',
          fontFamily: 'inherit', color: colors.black,
          backgroundColor: 'white', cursor: 'pointer',
          outline: 'none', boxSizing: 'border-box'
        }}>
          {ALL_DURATIONS.map(d => (
            <option key={d} value={d}>{formatDuration(d)}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default DateSelector
