import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'
import { MapPin } from 'lucide-react'

function CourtSelector({ courts, courtId, onCourtChange }) {
  return (
    <div style={{ marginBottom: spacing[4] }}>
      <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>COURT / LOCATION</Typography>
      <div style={{
        display: 'flex', alignItems: 'center', gap: spacing[3],
        padding: '12px 16px', border: `1.5px solid ${colors.gray[200]}`, borderRadius: radius.lg
      }}>
        <MapPin size={16} color={colors.gray[400]} />
        <select value={courtId} onChange={e => onCourtChange(e.target.value)} style={{
          border: 'none', outline: 'none', fontSize: '14px',
          fontFamily: 'inherit', color: colors.black,
          flex: 1, backgroundColor: 'transparent', cursor: 'pointer'
        }}>
          {courts.map(c => (
            <option key={c.court_id} value={c.court_id}>
              {c.name}{c.area ? ` · ${c.area}` : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default CourtSelector
