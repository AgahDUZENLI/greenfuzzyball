import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import Avatar from '../../components/Avatar'
import Typography from '../../components/Typography'
import PerformanceSection from '../../components/PerformanceSection'
import { getMemberSessionDetail } from '../../services/api'
import { formatTime12 } from '../../utils/timeUtils'
import { colors, spacing, radius } from '../../styles/tokens'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import useIsMobile from '../../hooks/useIsMobile'
import { getPageCache, setPageCache } from '../../utils/pageCache'

const statusMeta = {
  scheduled: { label: 'Confirmed', color: colors.primary },
  cancellation_pending: { label: 'Cancellation Pending', color: colors.warning },
  cancelled: { label: 'Cancelled', color: colors.gray[500] }
}

function calcEndTime(startTime, durationMinutes) {
  if (!startTime) return null
  const [h, m] = String(startTime).split(':').map(Number)
  const total = h * 60 + m + (durationMinutes || 60)
  const eh = Math.floor(total / 60) % 24
  const em = total % 60
  return formatTime12(`${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`)
}

function MemberSessionDetail() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const cached = getPageCache(`member-session/${sessionId}`)
  const [session, setSession] = useState(() => cached?.session ?? null)
  const [loading, setLoading] = useState(() => !cached)

  useEffect(() => {
    const cacheKey = `member-session/${sessionId}`
    if (!getPageCache(cacheKey)) setLoading(true)
    getMemberSessionDetail(sessionId)
      .then(res => {
        setSession(res.data)
        setPageCache(cacheKey, { session: res.data })
      })
      .catch(() => setSession(null))
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography variant="bodySmall" color={colors.gray[400]}>Loading...</Typography>
      </div>
    </Layout>
  )

  if (!session) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography variant="bodySmall" color={colors.gray[400]}>Session not found</Typography>
      </div>
    </Layout>
  )

  const todayStr = new Date().toISOString().split('T')[0]
  const isPast = session.date < todayStr
  const dateLabel = new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  })
  const startTime = formatTime12(session.start_time)
  const endTime = calcEndTime(session.start_time, session.duration_minutes)

  const ratings = {}
  session.ratings?.forEach(r => {
    ratings[`${r.student_id}-${r.drill_id}`] = { rating: r.rating, notes: r.notes || '' }
  })
  const allRatingValues = Object.values(ratings).map(r => r.rating).filter(Boolean)
  const computedAvg = allRatingValues.length > 0
    ? (allRatingValues.reduce((a, b) => a + b, 0) / allRatingValues.length).toFixed(1)
    : null

  const meta = statusMeta[session.status] || statusMeta.scheduled

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: isMobile ? 'auto' : 'hidden' }}>

        {/* Breadcrumb */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: spacing[3],
          padding: isMobile ? `${spacing[3]} ${spacing[4]}` : `${spacing[4]} ${spacing[6]}`,
          borderBottom: `1px solid ${colors.gray[100]}`,
          backgroundColor: 'white', flexShrink: 0
        }}>
          <button onClick={() => navigate(-1)} style={{
            border: 'none', background: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', padding: spacing[1]
          }}>
            <ArrowLeft size={18} color={colors.gray[600]} />
          </button>
          <span onClick={() => navigate('/member/sessions')}
            style={{ color: colors.primary, fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
            Sessions
          </span>
          <ChevronRight size={14} color={colors.gray[400]} />
          <span style={{ color: colors.gray[500], fontSize: '14px' }}>
            {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Content */}
        <div style={{
          flex: 1, overflowY: isMobile ? 'visible' : 'auto',
          padding: isMobile ? spacing[4] : spacing[6]
        }}>

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
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[2], flexWrap: 'wrap' }}>
                <Typography variant="h2" style={{ color: 'white' }}>{dateLabel}</Typography>
                <span style={{
                  backgroundColor: meta.color, color: 'white', fontSize: '12px', fontWeight: '600',
                  padding: '4px 12px', borderRadius: radius.full
                }}>
                  {meta.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                <Avatar name={session.coach_name || 'Coach'} size="sm" />
                <Typography variant="bodySmall" color={colors.gray[400]}>
                  {session.coach_name ? `Coach ${session.coach_name}` : ''}
                  {startTime && endTime ? ` · ${startTime} – ${endTime}` : ''}
                  {session.duration_minutes ? ` · ${session.duration_minutes} min` : ''}
                  {session.type ? ` · ${session.type === 'group' ? 'Group' : 'Private'}` : ''}
                  {session.court_name ? ` · ${session.court_name}` : ''}
                </Typography>
              </div>
            </div>

            <div style={{ display: 'flex', gap: spacing[8] }}>
              <div style={{ textAlign: 'center' }}>
                <Typography variant="caption" color={colors.gray[400]}
                  style={{ display: 'block', marginBottom: spacing[1] }}>DRILLS</Typography>
                <Typography variant="h2" style={{ color: 'white' }}>
                  {session.drills?.length || 0}
                </Typography>
              </div>
              {isPast && computedAvg && (
                <div style={{ textAlign: 'center' }}>
                  <Typography variant="caption" color={colors.gray[400]}
                    style={{ display: 'block', marginBottom: spacing[1] }}>AVG RATING</Typography>
                  <Typography variant="h2" style={{ color: colors.primary }}>
                    {computedAvg}
                  </Typography>
                </div>
              )}
            </div>
          </div>

          {/* Drills (read-only) */}
          <Typography variant="h4" style={{ marginBottom: spacing[4] }}>Drills</Typography>
          {session.drills?.length === 0 ? (
            <div style={{
              padding: spacing[8], border: `2px dashed ${colors.gray[200]}`,
              borderRadius: radius.xl, textAlign: 'center'
            }}>
              <Typography variant="bodySmall" color={colors.gray[400]}>
                No drills were planned for this session.
              </Typography>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              {session.drills.map(drill => (
                <div key={drill.drill_id} style={{
                  backgroundColor: 'white', borderRadius: radius.xl,
                  padding: spacing[5], border: `1px solid ${colors.gray[200]}`
                }}>
                  <Typography variant="body" style={{ fontWeight: '600', marginBottom: spacing[1] }}>
                    {drill.name}
                  </Typography>
                  {drill.description && (
                    <Typography variant="caption" color={colors.gray[400]}>
                      {drill.description}
                    </Typography>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Ratings (read-only) */}
          {isPast && (
            <PerformanceSection
              drills={session.drills}
              students={session.students}
              ratings={ratings}
              editMode={false}
              savingRatings={false}
              ratingsSaved={false}
              onSetRating={() => {}}
              onSetRatingNote={() => {}}
              onEnterEditMode={() => {}}
              onCancelEdit={() => {}}
              onSaveRatings={() => {}}
              readOnly
            />
          )}

        </div>
      </div>
    </Layout>
  )
}

export default MemberSessionDetail
