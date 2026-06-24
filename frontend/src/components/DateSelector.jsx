import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'

function DateSelector({ date, onDateChange, duration, onDurationChange, durations }) {
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
          {durations.map(d => (
            <option key={d} value={d}>
              {d === 30 ? '30 min' : d === 60 ? '1 hour' : d === 90 ? '1.5 hours' : '2 hours'}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default DateSelector
