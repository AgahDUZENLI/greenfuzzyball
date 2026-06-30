import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'
import { Calendar as CalendarIcon, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react'
import { hasConflict, timeToMinutes, minutesToTime, formatTime12 } from '../utils/timeUtils'

const QUICK_PICKS = ['09:00', '10:00', '11:30', '13:00', '14:30', '16:00', '18:00', '18:30']

function TimeSelector({ timeSlot, onTimeChange, duration, daySessions, conflict }) {
  const adjustTime = (delta) => {
    const mins = timeToMinutes(timeSlot) + delta
    onTimeChange(minutesToTime(Math.max(0, Math.min(23 * 60 + 30, mins))))
  }

  const endTime = minutesToTime(Math.min(timeToMinutes(timeSlot) + (duration || 60), 23 * 60 + 59))

  return (
    <div style={{ marginBottom: spacing[4] }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] }}>
        <Typography variant="label">START TIME</Typography>
        <Typography variant="caption" color={colors.primary}>Any time · 30-min steps</Typography>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: spacing[3], padding: '12px 16px',
          border: `1.5px solid ${conflict ? colors.error : colors.primary}`,
          borderRadius: radius.lg, flex: 1,
          backgroundColor: conflict ? colors.errorLight : 'white'
        }}>
          <CalendarIcon size={18} color={conflict ? colors.error : colors.primary} />
          <input type="time" value={timeSlot} onChange={e => onTimeChange(e.target.value)} style={{
            border: 'none', outline: 'none', fontSize: '22px', fontWeight: '700',
            fontFamily: 'inherit', color: conflict ? colors.error : colors.black,
            flex: 1, backgroundColor: 'transparent'
          }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[30, -30].map(delta => (
              <button key={delta} onClick={() => adjustTime(delta)} style={{
                border: 'none', backgroundColor: colors.gray[100],
                borderRadius: '4px', cursor: 'pointer', padding: '2px 6px'
              }}>
                {delta > 0
                  ? <ChevronUp size={14} color={colors.gray[500]} />
                  : <ChevronDown size={14} color={colors.gray[500]} />}
              </button>
            ))}
          </div>
        </div>
        <ArrowRight size={16} color={colors.gray[400]} style={{ flexShrink: 0 }} />
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '10px 14px', border: `1.5px solid ${colors.gray[200]}`,
          borderRadius: radius.lg, backgroundColor: colors.gray[50], minWidth: '90px'
        }}>
          <Typography variant="caption" color={colors.gray[400]} style={{ marginBottom: '2px' }}>ENDS AT</Typography>
          <span style={{ fontSize: '18px', fontWeight: '700', color: colors.gray[600], fontFamily: 'inherit' }}>
            {formatTime12(endTime)}
          </span>
        </div>
      </div>

      <div style={{ marginTop: spacing[3] }}>
        <Typography variant="caption" color={colors.gray[400]} style={{ marginBottom: spacing[2], display: 'block' }}>
          QUICK PICKS
        </Typography>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing[2] }}>
          {QUICK_PICKS.map(t => {
            const busy = hasConflict(daySessions, t, duration)
            const selected = timeSlot === t
            return (
              <button key={t} onClick={() => { if (!busy) onTimeChange(t) }} style={{
                padding: '10px 8px',
                border: `1.5px solid ${selected ? colors.primary : busy ? colors.errorLight : colors.gray[200]}`,
                borderRadius: radius.lg,
                backgroundColor: selected ? colors.primary : busy ? '#fff5f5' : 'white',
                color: selected ? 'white' : busy ? colors.error : colors.black,
                fontSize: '13px', fontWeight: selected ? '700' : '500',
                cursor: busy ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                textDecoration: busy ? 'line-through' : 'none',
                transition: 'all 0.15s'
              }}>
                {t.startsWith('0') ? t.slice(1) : t}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: spacing[4], marginTop: spacing[2] }}>
          {[
            { color: 'white', border: colors.gray[200], label: 'Free' },
            { color: '#fff5f5', border: colors.errorLight, label: 'Busy' },
            { color: colors.primary, border: colors.primary, label: 'Selected' }
          ].map(({ color, border, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: color, border: `1.5px solid ${border}`, borderRadius: '3px' }} />
              <Typography variant="caption" color={colors.gray[400]}>{label}</Typography>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TimeSelector
