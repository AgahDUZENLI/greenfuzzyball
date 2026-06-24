import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'
import Avatar from './Avatar'
import { X } from 'lucide-react'

const capitalize = str => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

function StudentCard({ students, type, onTypeChange, onRemove }) {
  return (
    <div style={{ marginBottom: spacing[5] }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2], marginBottom: spacing[3] }}>
        {students.map(student => (
          <div key={student.user_id} style={{
            display: 'flex', alignItems: 'center', gap: spacing[3],
            padding: spacing[3], backgroundColor: colors.primaryLight,
            borderRadius: radius.xl, border: `1.5px solid ${colors.primary}20`
          }}>
            <Avatar name={student.name} size="sm" />
            <div style={{ flex: 1 }}>
              <Typography variant="bodySmall" style={{ fontWeight: '600' }}>{student.name}</Typography>
              <Typography variant="caption" color={colors.gray[500]}>
                {capitalize(student.age_group)} · {capitalize(student.level)}
              </Typography>
            </div>
            <button onClick={() => onRemove(student.user_id)} style={{
              width: '24px', height: '24px', border: 'none',
              borderRadius: '50%', backgroundColor: 'white',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <X size={12} color={colors.gray[400]} />
            </button>
          </div>
        ))}
      </div>
      <div style={{
        display: 'inline-flex', backgroundColor: 'white',
        borderRadius: radius.lg, padding: '3px',
        border: `1px solid ${colors.gray[200]}`
      }}>
        {['private', 'group'].map(t => (
          <button key={t} onClick={() => onTypeChange(t)} style={{
            padding: '4px 12px', border: 'none', borderRadius: radius.md,
            cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px',
            fontWeight: type === t ? '600' : '400',
            backgroundColor: type === t ? colors.primary : 'transparent',
            color: type === t ? 'white' : colors.gray[500], transition: 'all 0.15s'
          }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}

export default StudentCard
