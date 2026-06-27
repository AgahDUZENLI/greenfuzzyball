import { colors, spacing, radius, shadows } from '../styles/tokens'
import Typography from './Typography'
import { Plus, X, Search } from 'lucide-react'

function DrillsSection({
  drills,
  allDrills,
  isPast,
  showDrillPicker,
  drillSearch,
  pickerRef,
  onTogglePicker,
  onSearchChange,
  onAdd,
  onRemove
}) {
  const available = allDrills.filter(
    d => !drills?.find(sd => String(sd.drill_id) === String(d.drill_id))
  )
  const filtered = available.filter(d =>
    d.name.toLowerCase().includes(drillSearch.toLowerCase())
  )

  return (
    <>
      <Typography variant="h4" style={{ marginBottom: spacing[4] }}>
        {isPast ? 'Drills' : 'Session Plan'}
      </Typography>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
        {drills?.length === 0 && (
          <div style={{
            padding: spacing[8],
            border: `2px dashed ${colors.gray[200]}`,
            borderRadius: radius.xl,
            textAlign: 'center'
          }}>
            <Typography variant="bodySmall" color={colors.gray[400]}>
              No drills planned yet. Add drills below.
            </Typography>
          </div>
        )}

        {drills?.map(drill => (
          <div
            key={drill.drill_id}
            style={{
              backgroundColor: 'white',
              borderRadius: radius.xl,
              padding: spacing[5],
              border: `1px solid ${colors.gray[200]}`,
              display: 'flex', alignItems: 'center', gap: spacing[4]
            }}
          >
            <div style={{ flex: 1 }}>
              <Typography variant="body" style={{ fontWeight: '600', marginBottom: spacing[1] }}>
                {drill.name}
              </Typography>
              {drill.description && (
                <Typography variant="caption" color={colors.gray[400]}>
                  {drill.description}
                </Typography>
              )}
            </div>
            <button
              onClick={() => onRemove(drill.drill_id)}
              style={{
                border: 'none', background: 'none', cursor: 'pointer',
                padding: spacing[1], display: 'flex', alignItems: 'center',
                color: colors.gray[400], borderRadius: radius.md
              }}
              onMouseEnter={e => e.currentTarget.style.color = colors.error}
              onMouseLeave={e => e.currentTarget.style.color = colors.gray[400]}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Drill picker */}
      <div style={{ position: 'relative', marginTop: spacing[4] }} ref={pickerRef}>
        <button
          onClick={onTogglePicker}
          style={{
            display: 'flex', alignItems: 'center', gap: spacing[2],
            padding: `${spacing[3]} ${spacing[4]}`,
            border: `1.5px dashed ${colors.primary}`,
            borderRadius: radius.xl,
            backgroundColor: 'transparent',
            color: colors.primary, fontSize: '14px', fontWeight: '600',
            cursor: 'pointer', fontFamily: 'inherit'
          }}
        >
          <Plus size={16} /> Add Drill
        </button>

        {showDrillPicker && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0,
            width: '340px', backgroundColor: 'white',
            border: `1px solid ${colors.gray[200]}`,
            borderRadius: radius.xl,
            boxShadow: shadows.lg,
            zIndex: 100, overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: spacing[2],
              padding: spacing[3],
              borderBottom: `1px solid ${colors.gray[100]}`
            }}>
              <Search size={14} color={colors.gray[400]} />
              <input
                autoFocus
                placeholder="Search drills..."
                value={drillSearch}
                onChange={e => onSearchChange(e.target.value)}
                style={{
                  border: 'none', outline: 'none', width: '100%',
                  fontSize: '13px', fontFamily: 'inherit', color: colors.black
                }}
              />
            </div>

            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: spacing[4], textAlign: 'center' }}>
                  <Typography variant="caption" color={colors.gray[400]}>
                    {available.length === 0 ? 'All drills already added' : 'No drills match'}
                  </Typography>
                </div>
              ) : filtered.map(drill => (
                <button
                  key={drill.drill_id}
                  onClick={() => onAdd(drill)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: `${spacing[3]} ${spacing[4]}`,
                    border: 'none', background: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', borderBottom: `1px solid ${colors.gray[50]}`
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.gray[50]}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ fontSize: '13px', fontWeight: '600', color: colors.black }}>
                    {drill.name}
                  </div>
                  {drill.description && (
                    <div style={{ fontSize: '12px', color: colors.gray[400], marginTop: '2px' }}>
                      {drill.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default DrillsSection
