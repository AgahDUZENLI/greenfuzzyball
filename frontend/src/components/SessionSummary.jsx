import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'
import Avatar from './Avatar'
import { Plus, Check } from 'lucide-react'
import { formatTime12, minutesToTime, timeToMinutes } from '../utils/timeUtils'

function SessionSummary({ allSlots, student, courts, courtId, daySessions, selectedDateLabel, onSlotClick }) {
  return (
    <div style={{ padding: spacing[6], backgroundColor: colors.gray[50] }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] }}>
        <div>
          <Typography variant="h4">{selectedDateLabel}</Typography>
          <Typography variant="caption" color={colors.gray[400]}>
            Your day · {daySessions.length} booked
          </Typography>
        </div>
        {daySessions.length > 0 && (
          <span style={{
            backgroundColor: daySessions.length >= 4 ? colors.errorLight : '#fef3c7',
            color: daySessions.length >= 4 ? colors.error : '#d97706',
            padding: '4px 12px', borderRadius: radius.full,
            fontSize: '12px', fontWeight: '600'
          }}>
            {daySessions.length >= 4 ? 'Full' : 'Half full'}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
        {allSlots.map((slot, i) => {
          const startLabel = minutesToTime(slot.start)
          const endLabel = minutesToTime(slot.end)
          const mins = slot.end - slot.start

          if (slot.type === 'free') return (
            <div key={i} style={{ display: 'flex', gap: spacing[3], alignItems: 'center' }}>
              <Typography variant="caption" color={colors.gray[300]} style={{ minWidth: '40px', textAlign: 'right' }}>
                {startLabel}
              </Typography>
              <div onClick={() => onSlotClick(startLabel)} style={{
                flex: 1, padding: `${spacing[3]} ${spacing[4]}`,
                border: `1.5px dashed ${colors.gray[200]}`, borderRadius: radius.lg,
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', cursor: 'pointer', backgroundColor: 'white'
              }}>
                <Typography variant="bodySmall" color={colors.gray[400]}>
                  Free · {mins >= 60 ? `${mins / 60}h open` : `${mins}min open`}
                </Typography>
                <Plus size={14} color={colors.gray[400]} />
              </div>
            </div>
          )

          if (slot.type === 'new') {
            const selectedCourt = courts.find(c => c.court_id === courtId)
            return (
              <div key={i} style={{ display: 'flex', gap: spacing[3], alignItems: 'center' }}>
                <Typography variant="caption" color={colors.primary} style={{ minWidth: '40px', textAlign: 'right', fontWeight: '700' }}>
                  {startLabel}
                </Typography>
                <div style={{
                  flex: 1, padding: `${spacing[3]} ${spacing[4]}`,
                  border: `2px solid ${colors.primary}`, borderRadius: radius.lg,
                  backgroundColor: colors.primaryLight,
                  display: 'flex', alignItems: 'center', gap: spacing[3]
                }}>
                  {student && <Avatar name={student.name} size="sm" />}
                  <div style={{ flex: 1 }}>
                    <Typography variant="body" style={{ fontWeight: '600', color: colors.primary }}>
                      {student ? `${student.name} · New` : 'New Session'}
                    </Typography>
                    <Typography variant="caption" color={colors.gray[500]}>
                      {formatTime12(startLabel)} – {formatTime12(endLabel)}
                      {selectedCourt ? ` · ${selectedCourt.name}` : ''}
                    </Typography>
                  </div>
                  <Check size={18} color={colors.primary} />
                </div>
              </div>
            )
          }

          const s = slot.session
          return (
            <div key={i} style={{ display: 'flex', gap: spacing[3], alignItems: 'center' }}>
              <Typography variant="caption" color={colors.gray[400]} style={{ minWidth: '40px', textAlign: 'right' }}>
                {startLabel}
              </Typography>
              <div style={{
                flex: 1, padding: `${spacing[3]} ${spacing[4]}`,
                border: `1px solid ${colors.gray[200]}`,
                borderLeft: `3px solid ${s.type === 'group' ? '#f59e0b' : colors.black}`,
                borderRadius: radius.lg, backgroundColor: 'white',
                display: 'flex', alignItems: 'center', gap: spacing[3]
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {s.student_names?.slice(0, 3).map(name => <Avatar key={name} name={name} size="sm" />)}
                </div>
                <div style={{ flex: 1 }}>
                  <Typography variant="body" style={{ fontWeight: '600', fontSize: '13px' }}>
                    {s.student_names?.slice(0, 2).join(', ')}
                    {s.student_names?.length > 2 ? ` +${s.student_names.length - 2}` : ''}
                  </Typography>
                  <Typography variant="caption" color={colors.gray[400]}>
                    {formatTime12(String(s.start_time).slice(0, 5))} – {formatTime12(minutesToTime(timeToMinutes(String(s.start_time).slice(0, 5)) + (s.duration_minutes || 60)))}
                    {s.court_name ? ` · ${s.court_name}` : ''}
                  </Typography>
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: '600',
                  color: s.type === 'group' ? '#d97706' : colors.gray[600],
                  backgroundColor: s.type === 'group' ? '#fef3c7' : colors.gray[100],
                  padding: '3px 8px', borderRadius: radius.full
                }}>
                  {s.type === 'group' ? 'Group' : 'Private'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SessionSummary
