import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'

const WEEKDAYS = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' }
]

const END_MODES = [
  ['weeks', 'For N weeks'],
  ['until', 'Until date']
]

function RecurrenceSelector({ days, onDaysChange, endMode, onEndModeChange, weeks, onWeeksChange, endDate, onEndDateChange }) {
  const toggleDay = (key) => {
    onDaysChange(days.includes(key) ? days.filter(d => d !== key) : [...days, key])
  }

  return (
    <div>
      <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>REPEATS ON</Typography>
      <div style={{ display: 'flex', gap: spacing[2], marginBottom: spacing[4] }}>
        {WEEKDAYS.map(d => {
          const active = days.includes(d.key)
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => toggleDay(d.key)}
              style={{
                width: '32px', height: '32px', borderRadius: radius.full,
                border: `1.5px solid ${active ? colors.primary : colors.gray[200]}`,
                backgroundColor: active ? colors.primary : 'white',
                color: active ? 'white' : colors.gray[500],
                fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              {d.label}
            </button>
          )
        })}
      </div>

      <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>ENDS</Typography>
      <div style={{
        display: 'inline-flex', backgroundColor: 'white',
        borderRadius: radius.lg, padding: '3px',
        border: `1px solid ${colors.gray[200]}`, marginBottom: spacing[3]
      }}>
        {END_MODES.map(([mode, label]) => (
          <button key={mode} type="button" onClick={() => onEndModeChange(mode)} style={{
            padding: '4px 12px', border: 'none', borderRadius: radius.md,
            cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px',
            fontWeight: endMode === mode ? '600' : '400',
            backgroundColor: endMode === mode ? colors.primary : 'transparent',
            color: endMode === mode ? 'white' : colors.gray[500], transition: 'all 0.15s'
          }}>
            {label}
          </button>
        ))}
      </div>

      {endMode === 'weeks' ? (
        <input
          type="number" min={1} max={26} value={weeks}
          onChange={e => onWeeksChange(Number(e.target.value))}
          style={{
            width: '100%', padding: '12px 16px',
            border: `1.5px solid ${colors.gray[200]}`, borderRadius: radius.lg,
            fontSize: '14px', fontFamily: 'inherit', color: colors.black,
            boxSizing: 'border-box', outline: 'none'
          }}
        />
      ) : (
        <div style={{ padding: '12px 16px', border: `1.5px solid ${colors.gray[200]}`, borderRadius: radius.lg }}>
          <input
            type="date" value={endDate} onChange={e => onEndDateChange(e.target.value)}
            style={{
              border: 'none', outline: 'none', fontSize: '14px',
              fontFamily: 'inherit', color: colors.black,
              width: '100%', backgroundColor: 'transparent'
            }}
          />
        </div>
      )}
    </div>
  )
}

export default RecurrenceSelector
