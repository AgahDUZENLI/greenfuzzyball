import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'
import { MapPin, Plus, Pencil } from 'lucide-react'

function CourtSelector({ courts, courtId, onCourtChange, onAddNew, onEdit }) {
  const selectedCourt = courts.find(c => c.court_id === courtId)

  return (
    <div style={{ marginBottom: spacing[4] }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] }}>
        <Typography variant="label" style={{ display: 'block' }}>COURT / LOCATION</Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          {selectedCourt?.is_own && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: colors.gray[400], fontSize: '12px', fontWeight: '600', fontFamily: 'inherit'
              }}
            >
              <Pencil size={12} /> Edit
            </button>
          )}
          {onAddNew && (
            <button
              type="button"
              onClick={onAddNew}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: colors.primary, fontSize: '12px', fontWeight: '600', fontFamily: 'inherit'
              }}
            >
              <Plus size={12} /> Add new location
            </button>
          )}
        </div>
      </div>
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
