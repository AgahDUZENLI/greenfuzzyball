import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Avatar from '../components/Avatar'
import Button from '../components/Button'
import Typography from '../components/Typography'
import DrillsSection from '../components/DrillsSection'
import PerformanceSection from '../components/PerformanceSection'
import EditSessionModal from '../components/EditSessionModal'
import BookSessionModal from '../components/BookSessionModal'
import { useSessionDetail } from '../hooks/useSessionDetail'
import { colors, spacing, radius } from '../styles/tokens'
import { ArrowLeft, ChevronRight, FileText, Check, Pencil, RefreshCw } from 'lucide-react'
import useIsMobile from '../hooks/useIsMobile'

function SessionDetail() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const d = useSessionDetail(sessionId)
  const isMobile = useIsMobile()

  if (d.loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography variant="bodySmall" color={colors.gray[400]}>Loading...</Typography>
      </div>
    </Layout>
  )

  if (!d.session) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography variant="bodySmall" color={colors.gray[400]}>Session not found</Typography>
      </div>
    </Layout>
  )

  const s = d.session

  return (
    <Layout>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: isMobile ? 'auto' : 'hidden'
      }}>

        {/* Breadcrumb */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? spacing[3] : 0,
          padding: isMobile ? `${spacing[3]} ${spacing[4]}` : `${spacing[4]} ${spacing[6]}`,
          borderBottom: `1px solid ${colors.gray[100]}`,
          backgroundColor: 'white', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
            <button onClick={() => navigate(-1)} style={{
              border: 'none', background: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', padding: spacing[1]
            }}>
              <ArrowLeft size={18} color={colors.gray[600]} />
            </button>
            <span onClick={() => navigate('/sessions')}
              style={{ color: colors.primary, fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
              Sessions
            </span>
            <ChevronRight size={14} color={colors.gray[400]} />
            <span style={{ color: colors.gray[500], fontSize: '14px' }}>
              {new Date(s.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div style={{ display: 'flex', gap: spacing[2] }}>
            <Button variant="outline" onClick={() => d.setShowRepeatModal(true)}>
              <RefreshCw size={14} /> Repeat
            </Button>
            <Button variant="outline" onClick={() => d.setShowEditModal(true)}>
              <Pencil size={14} /> Edit
            </Button>
          </div>
        </div>

        {/* Content */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          flex: 1,
          overflow: isMobile ? 'visible' : 'hidden'
        }}>

          {/* Main */}
          <div style={{ flex: 1, overflowY: isMobile ? 'visible' : 'auto', padding: isMobile ? spacing[4] : spacing[6] }}>

            {/* Hero card */}
            <div style={{
              backgroundColor: colors.black, borderRadius: radius['2xl'],
              padding: spacing[6], marginBottom: spacing[6],
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: isMobile ? spacing[4] : spacing[8]
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[2] }}>
                  <Typography variant="h2" style={{ color: 'white' }}>{d.dateLabel}</Typography>
                  <span style={{
                    backgroundColor: d.isPast ? colors.gray[700] : colors.primary,
                    color: 'white', fontSize: '12px', fontWeight: '600',
                    padding: '4px 12px', borderRadius: radius.full
                  }}>
                    {d.isPast ? 'Completed' : 'Upcoming'}
                  </span>
                </div>
                <Typography variant="bodySmall" color={colors.gray[400]}>
                  {d.startTime && d.endTime ? `${d.startTime} – ${d.endTime}` : ''}
                  {s.duration_minutes ? ` · ${s.duration_minutes} min` : ''}
                  {` · ${s.type === 'group' ? 'Group' : 'Private'}`}
                  {s.court_name ? ` · ${s.court_name}` : ''}
                </Typography>
              </div>

              <div style={{ display: 'flex', gap: spacing[8] }}>
                <div style={{ textAlign: 'center' }}>
                  <Typography variant="caption" color={colors.gray[400]}
                    style={{ display: 'block', marginBottom: spacing[1] }}>DRILLS</Typography>
                  <Typography variant="h2" style={{ color: 'white' }}>
                    {s.drills?.length || 0}
                  </Typography>
                </div>
                {d.isPast && d.computedAvg && (
                  <div style={{ textAlign: 'center' }}>
                    <Typography variant="caption" color={colors.gray[400]}
                      style={{ display: 'block', marginBottom: spacing[1] }}>AVG RATING</Typography>
                    <Typography variant="h2" style={{ color: colors.primary }}>
                      {d.computedAvg}
                    </Typography>
                  </div>
                )}
              </div>
            </div>

            {/* Drills */}
            <DrillsSection
              drills={s.drills}
              allDrills={d.allDrills}
              isPast={d.isPast}
              showDrillPicker={d.showDrillPicker}
              drillSearch={d.drillSearch}
              pickerRef={d.pickerRef}
              onTogglePicker={() => d.setShowDrillPicker(v => !v)}
              onSearchChange={d.setDrillSearch}
              onAdd={d.handleAddDrill}
              onRemove={d.handleRemoveDrill}
            />

            {/* Performance (past sessions only) */}
            {d.isPast && (
              <PerformanceSection
                drills={s.drills}
                students={s.students}
                ratings={d.ratings}
                editMode={d.editMode}
                savingRatings={d.savingRatings}
                ratingsSaved={d.ratingsSaved}
                onSetRating={d.setRating}
                onSetRatingNote={d.setRatingNote}
                onEnterEditMode={d.enterEditMode}
                onCancelEdit={d.cancelEdit}
                onSaveRatings={d.handleSaveRatings}
              />
            )}

          </div>

          {/* Right panel */}
          <div style={{
            width: isMobile ? '100%' : '300px', flexShrink: 0,
            borderLeft: isMobile ? 'none' : `1px solid ${colors.gray[100]}`,
            borderTop: isMobile ? `1px solid ${colors.gray[100]}` : 'none',
            overflowY: isMobile ? 'visible' : 'auto', padding: spacing[6],
            display: 'flex', flexDirection: 'column', gap: spacing[4]
          }}>

            {s.students?.map(student => (
              <div
                key={student.user_id}
                onClick={() => navigate('/students')}
                style={{
                  display: 'flex', alignItems: 'center', gap: spacing[3],
                  padding: spacing[4], border: `1px solid ${colors.gray[200]}`,
                  borderRadius: radius.xl, cursor: 'pointer', backgroundColor: 'white'
                }}
              >
                <Avatar name={student.name} size="md" />
                <div style={{ flex: 1 }}>
                  <Typography variant="body" style={{ fontWeight: '600' }}>{student.name}</Typography>
                  <Typography variant="caption" color={colors.gray[400]}>
                    {student.age_group?.charAt(0).toUpperCase() + student.age_group?.slice(1)}
                    {' · '}
                    {student.level?.charAt(0).toUpperCase() + student.level?.slice(1)}
                  </Typography>
                </div>
                <ChevronRight size={16} color={colors.gray[400]} />
              </div>
            ))}

            <div style={{
              padding: spacing[5], border: `1px solid ${colors.gray[200]}`,
              borderRadius: radius.xl, backgroundColor: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[3] }}>
                <FileText size={16} color={colors.primary} />
                <Typography variant="h4">Coach notes</Typography>
              </div>
              <textarea
                value={d.sessionNotes}
                onChange={e => d.setSessionNotes(e.target.value)}
                placeholder="Add notes for this session..."
                rows={4}
                style={{
                  width: '100%', border: `1px solid ${colors.gray[200]}`,
                  borderRadius: radius.md, padding: spacing[3],
                  fontSize: '13px', fontFamily: 'inherit', color: colors.gray[700],
                  resize: 'vertical', outline: 'none', lineHeight: '1.5',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = colors.primary}
                onBlur={e => e.target.style.borderColor = colors.gray[200]}
              />
              <button
                onClick={d.handleSaveNotes}
                disabled={d.savingNotes}
                style={{
                  marginTop: spacing[3],
                  display: 'flex', alignItems: 'center', gap: spacing[2],
                  padding: `${spacing[2]} ${spacing[4]}`,
                  border: 'none',
                  backgroundColor: d.notesSaved ? colors.success : colors.primary,
                  color: 'white', borderRadius: radius.md,
                  fontSize: '13px', fontWeight: '600', fontFamily: 'inherit',
                  cursor: d.savingNotes ? 'not-allowed' : 'pointer'
                }}
              >
                {d.notesSaved ? <><Check size={13} /> Saved</> : d.savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>

          </div>
        </div>
      </div>

      {d.showEditModal && (
        <EditSessionModal
          session={s}
          onClose={() => d.setShowEditModal(false)}
          onUpdated={d.handleSessionUpdated}
        />
      )}

      {d.showRepeatModal && (
        <BookSessionModal
          initialStudents={s.students || []}
          initialCourtId={s.court_id ? String(s.court_id) : null}
          initialDuration={s.duration_minutes}
          initialDrillIds={(s.drills || []).map(drill => drill.drill_id)}
          onClose={() => d.setShowRepeatModal(false)}
          onBooked={() => d.setShowRepeatModal(false)}
        />
      )}
    </Layout>
  )
}

export default SessionDetail
