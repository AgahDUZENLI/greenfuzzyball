import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'
import Avatar from './Avatar'
import Button from './Button'
import RatingInput from './RatingInput'
import { Check } from 'lucide-react'

function PerformanceSection({
  drills,
  students,
  ratings,
  editMode,
  savingRatings,
  ratingsSaved,
  onSetRating,
  onSetRatingNote,
  onEnterEditMode,
  onCancelEdit,
  onSaveRatings,
}) {
  return (
    <>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: spacing[4], marginTop: spacing[6]
      }}>
        <Typography variant="h4">Performance</Typography>

        {editMode ? (
          <div style={{ display: 'flex', gap: spacing[2] }}>
            <Button variant="outline" onClick={onCancelEdit} disabled={savingRatings}>
              Cancel
            </Button>
            <Button onClick={onSaveRatings} disabled={savingRatings} style={{ minWidth: '130px' }}>
              {savingRatings ? 'Saving...' : <><Check size={14} /> Save Ratings</>}
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={onEnterEditMode}>
            {ratingsSaved ? <><Check size={14} /> Saved</> : 'Edit Ratings'}
          </Button>
        )}
      </div>

      {drills?.length === 0 ? (
        <div style={{
          padding: spacing[8],
          border: `1px solid ${colors.gray[200]}`,
          borderRadius: radius.xl,
          textAlign: 'center'
        }}>
          <Typography variant="bodySmall" color={colors.gray[400]}>
            No drills were planned for this session.
          </Typography>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
          {drills?.map(drill => (
            <div
              key={drill.drill_id}
              style={{
                backgroundColor: 'white',
                borderRadius: radius.xl,
                padding: spacing[5],
                border: `1px solid ${colors.gray[200]}`
              }}
            >
              <Typography variant="body" style={{ fontWeight: '600', marginBottom: spacing[1] }}>
                {drill.name}
              </Typography>
              {drill.description && (
                <Typography variant="caption" color={colors.gray[400]}
                  style={{ display: 'block', marginBottom: spacing[4] }}>
                  {drill.description}
                </Typography>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                {students?.map(student => {
                  const key = `${student.user_id}-${drill.drill_id}`
                  const r = ratings[key] || {}
                  return (
                    <div key={student.user_id}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[4] }}>

                      {students.length > 1 && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: spacing[2],
                          minWidth: '110px', paddingTop: '7px'
                        }}>
                          <Avatar name={student.name} size="xs" />
                          <Typography variant="caption"
                            style={{ fontWeight: '600', color: colors.gray[700] }}>
                            {student.name}
                          </Typography>
                        </div>
                      )}

                      {/* View mode */}
                      {!editMode && (
                        <div style={{ flex: 1 }}>
                          {r.rating ? (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                                <div style={{
                                  flex: 1, height: '6px',
                                  backgroundColor: colors.gray[100],
                                  borderRadius: radius.full, overflow: 'hidden'
                                }}>
                                  <div style={{
                                    width: `${r.rating * 10}%`, height: '100%',
                                    backgroundColor: colors.primary,
                                    borderRadius: radius.full
                                  }} />
                                </div>
                                <div style={{
                                  width: '36px', height: '36px', borderRadius: '50%',
                                  border: `2px solid ${colors.gray[200]}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontWeight: '700', fontSize: '15px', color: colors.black,
                                  flexShrink: 0
                                }}>
                                  {r.rating}
                                </div>
                              </div>
                              {r.notes && (
                                <Typography variant="caption" color={colors.gray[400]}
                                  style={{ display: 'block', marginTop: '6px', fontStyle: 'italic' }}>
                                  "{r.notes}"
                                </Typography>
                              )}
                            </>
                          ) : (
                            <Typography variant="caption" color={colors.gray[300]}
                              style={{ paddingTop: '7px', display: 'block' }}>
                              Not rated
                            </Typography>
                          )}
                        </div>
                      )}

                      {/* Edit mode */}
                      {editMode && (
                        <div style={{ flex: 1 }}>
                          <RatingInput
                            value={r.rating || null}
                            onChange={val => onSetRating(student.user_id, drill.drill_id, val)}
                          />
                          <input
                            placeholder="Add a note..."
                            value={r.notes || ''}
                            onChange={e => onSetRatingNote(student.user_id, drill.drill_id, e.target.value)}
                            style={{
                              marginTop: spacing[2],
                              width: '100%', border: 'none',
                              borderBottom: `1px solid ${colors.gray[200]}`,
                              outline: 'none', padding: '4px 0',
                              fontSize: '12px', color: colors.gray[600],
                              fontFamily: 'inherit', backgroundColor: 'transparent'
                            }}
                          />
                        </div>
                      )}

                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default PerformanceSection
