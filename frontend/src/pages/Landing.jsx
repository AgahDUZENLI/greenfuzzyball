import { useEffect, Fragment } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Typography from '../components/Typography'
import StatCard from '../components/StatCard'
import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import InstallButton from '../components/InstallButton'
import { colors, spacing, radius, shadows } from '../styles/tokens'
import {
  Zap, FileText, CalendarX2, BrainCircuit,
  Users, Calendar, Share2, Gauge, Mail, Smartphone,
  Map as MapIcon, ArrowRight, Home, Search, Download, ChevronRight,
  MessageSquare, FolderOpen, CheckCircle2, ArrowDown,
  X, Check, Sun, Star, Save, TrendingUp
} from 'lucide-react'
import useIsMobile from '../hooks/useIsMobile'

const PROBLEMS = [
  {
    icon: FileText,
    title: 'Student information everywhere',
    text: "Notes, contact info, and progress end up spread across notebooks, texts, and spreadsheets."
  },
  {
    icon: CalendarX2,
    title: 'Scheduling becomes a headache',
    text: "No single view of your day, so scheduling conflicts slip through until it's too late."
  },
  {
    icon: BrainCircuit,
    title: 'Progress is impossible to measure',
    text: "Without consistent ratings, it's hard to know whether your coaching is actually working."
  }
]

const PAIN_POINTS = [
  { icon: FileText, text: 'Notes on paper' },
  { icon: MessageSquare, text: 'Student messages in WhatsApp' },
  { icon: Calendar, text: 'Schedule in Google Calendar' },
  { icon: BrainCircuit, text: 'Progress in your head' },
  { icon: FolderOpen, text: 'Drills in random PDFs' }
]

const COMPARISON = [
  { without: 'Notes everywhere', with: 'Everything in one place' },
  { without: 'Planning in your head', with: 'Plan sessions ahead' },
  { without: 'Double bookings', with: 'Conflict detection' },
  { without: 'No progress history', with: 'Ratings over time' },
  { without: 'Repeating the same drills', with: 'Organized drill library' }
]

const DAY_STEPS = [
  { icon: Sun, label: 'MORNING', text: "See today's schedule" },
  { icon: Star, label: 'DURING LESSONS', text: 'Rate each drill' },
  { icon: Save, label: 'AFTER PRACTICE', text: 'Session auto-saved' },
  { icon: TrendingUp, label: 'END OF WEEK', text: 'Review progress' }
]

const FEATURES = [
  { icon: Users, title: 'Never lose track of a student again', text: 'Profiles, levels, and notes for every athlete — with progress tracked automatically over time.' },
  { icon: Calendar, title: 'Schedule without conflicts', text: 'Book any time you want — Green Fuzzy Ball flags conflicts before they become a problem.' },
  { icon: Share2, title: 'Build your own coaching system', text: 'Build your own drills, organize them by category, and share any drill with a coach via a link.' },
  { icon: Gauge, title: '1–10 performance ratings', text: "Rate every student on every drill, every session — the fastest way to see who's ready for what's next." },
  { icon: Mail, title: 'Email notifications', text: 'Session confirmations and reminders sent automatically, so nobody forgets a booking.' },
  { icon: Smartphone, title: 'Works on any device', text: 'Plan from your laptop, rate drills courtside on your phone. Everything stays in sync.' }
]

const STEPS = [
  { n: '01', title: 'Create your account', text: 'Set your availability, coaching days, and default session length.' },
  { n: '02', title: 'Add your students', text: 'Bring over your roster with levels, contact info, and any notes you already keep.' },
  { n: '03', title: 'Book & track sessions', text: 'Plan drills, rate performance as you go, and watch progress build session after session.' }
]

const STATS = [
  { value: '5–50', label: 'students per coach' },
  { value: '10 min', label: 'to set up a session' },
  { value: '1–10', label: 'rating scale, every drill' }
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function SectionLabel({ children }) {
  return <Typography variant="label" color={colors.primary} mb={spacing[3]}>{children}</Typography>
}

function Landing() {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const featureCols = isMobile ? 1 : 3
  const sectionPadding = v => isMobile ? `${spacing[8]} ${spacing[4]}` : `${v} ${spacing[28]}`

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }))
    }
  }, [location])

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      <PublicNav />

      {/* Hero */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: spacing[12],
        padding: sectionPadding(spacing[12]),
        backgroundColor: colors.gray[50]
      }}>
        <div style={{ flex: '1 1 420px', minWidth: '320px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: spacing[2],
            backgroundColor: colors.primaryLight, color: colors.primaryDark,
            padding: `${spacing[2]} ${spacing[4]}`, borderRadius: radius.full,
            fontSize: '13px', fontWeight: '600', marginBottom: spacing[6]
          }}>
            <Zap size={14} /> Built for independent tennis coaches
          </div>

          <Typography variant="h1" mb={spacing[5]}>
            Spend less time organizing. More time coaching.
          </Typography>
          <Typography variant="body" color={colors.gray[600]} mb={spacing[8]}>
            Green Fuzzy Ball keeps your students, schedule, drills, and progress in one place—so you can stop juggling spreadsheets, notes, and messages.
          </Typography>

          <div style={{ display: 'flex', gap: spacing[3], marginBottom: spacing[4] }}>
            <Button size="lg" onClick={() => navigate('/register')}>
              Start for free <ArrowRight size={16} />
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollTo('how-it-works')}>
              See how it works
            </Button>
          </div>
          <Typography variant="caption">No credit card required · Completely free</Typography>
        </div>

        <div style={{ flex: '1 1 420px', minWidth: '320px' }}>
          <div style={{
            backgroundColor: colors.white, borderRadius: radius['2xl'],
            border: `1px solid ${colors.gray[200]}`, boxShadow: shadows.lg,
            overflow: 'hidden'
          }}>
            {/* Browser chrome */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: spacing[4],
              padding: `${spacing[3]} ${spacing[4]}`, backgroundColor: colors.gray[50],
              borderBottom: `1px solid ${colors.gray[200]}`
            }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: colors.gray[300] }} />
                ))}
              </div>
              <div style={{
                flex: 1, textAlign: 'center', fontSize: '12px', color: colors.gray[500],
                backgroundColor: colors.white, borderRadius: radius.full,
                padding: `${spacing[1]} ${spacing[3]}`, border: `1px solid ${colors.gray[200]}`
              }}>
                greenfuzzyball.duckdns.org
              </div>
            </div>

            {/* Mock dashboard */}
            <div style={{ padding: spacing[6] }}>
              <Typography variant="h4" mb={spacing[5]}>Good morning, Coach</Typography>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing[3], marginBottom: spacing[5] }}>
                <StatCard label="Students" value={24} icon={<Users size={18} color={colors.primary} />} />
                <StatCard label="Sessions" value={18} icon={<Calendar size={18} color={colors.primary} />} />
                <StatCard label="Drills" value={32} icon={<Share2 size={18} color={colors.primary} />} />
              </div>

              <Typography variant="label" mb={spacing[3]}>Today's Sessions</Typography>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                {[
                  { time: '10:00', type: 'private', name: 'Maria Chen', score: '8.4' },
                  { time: '2:30', type: 'group', name: 'Leo, Ana, Sam +2', score: '7.8' }
                ].map(s => (
                  <div key={s.time} style={{
                    display: 'flex', alignItems: 'center', gap: spacing[3],
                    padding: spacing[3], borderRadius: radius.lg,
                    border: `1px solid ${colors.gray[200]}`
                  }}>
                    <Typography variant="bodySmall" style={{ fontWeight: '700', minWidth: '44px' }}>{s.time}</Typography>
                    <Badge label={s.type === 'private' ? 'Private' : 'Group'} variant={s.type} />
                    <Typography variant="bodySmall" style={{ fontWeight: '600', flex: 1 }}>{s.name}</Typography>
                    <span style={{
                      backgroundColor: colors.primaryLight, color: colors.primaryDark,
                      fontWeight: '700', fontSize: '13px',
                      padding: `${spacing[1]} ${spacing[2]}`, borderRadius: radius.md
                    }}>{s.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why coaches need this */}
      <div style={{ padding: sectionPadding(spacing[12]), backgroundColor: colors.white, textAlign: 'center' }}>
        <SectionLabel>Why coaches need this</SectionLabel>
        <Typography variant="h2" mb={spacing[10]} style={{ margin: `0 auto ${spacing[10]}` }}>
          Coaching shouldn't look like this.
        </Typography>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: spacing[3], marginBottom: spacing[8] }}>
          {PAIN_POINTS.map(p => (
            <div key={p.text} style={{
              display: 'inline-flex', alignItems: 'center', gap: spacing[2],
              backgroundColor: colors.gray[50], border: `1px solid ${colors.gray[200]}`,
              borderRadius: radius.full, padding: `${spacing[3]} ${spacing[5]}`
            }}>
              <p.icon size={18} color={colors.warning} />
              <Typography variant="bodySmall" style={{ fontWeight: '600', color: colors.black }}>{p.text}</Typography>
            </div>
          ))}
        </div>

        <ArrowDown size={20} color={colors.gray[400]} style={{ marginBottom: spacing[8] }} />

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing[3],
          maxWidth: '560px', margin: '0 auto',
          backgroundColor: colors.black, borderRadius: radius.xl,
          padding: `${spacing[5]} ${spacing[8]}`
        }}>
          <CheckCircle2 size={20} color={colors.primary} />
          <Typography variant="h4" color={colors.white}>Green Fuzzy Ball puts everything together.</Typography>
        </div>
      </div>

      {/* Problem */}
      <div style={{ padding: sectionPadding(spacing[12]), backgroundColor: colors.white }}>
        <SectionLabel>The problem</SectionLabel>
        <Typography variant="h2" mb={spacing[10]} style={{ maxWidth: '640px' }}>
          Coaches waste time on admin instead of coaching.
        </Typography>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: spacing[8] }}>
          {PROBLEMS.map(p => (
            <div key={p.title}>
              <div style={{
                width: '48px', height: '48px', borderRadius: radius.md,
                backgroundColor: colors.errorLight, display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: spacing[4]
              }}>
                <p.icon size={22} color={colors.error} />
              </div>
              <Typography variant="h4" mb={spacing[2]}>{p.title}</Typography>
              <Typography variant="bodySmall">{p.text}</Typography>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div id="features" style={{ padding: sectionPadding(spacing[12]), backgroundColor: colors.gray[50] }}>
        <SectionLabel>Features</SectionLabel>
        <Typography variant="h2" mb={spacing[10]} style={{ maxWidth: '640px' }}>
          Everything you need to run your coaching business.
        </Typography>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${featureCols}, 1fr)` }}>
            {FEATURES.map((f, i) => {
              const lastRowStart = featureCols * Math.floor((FEATURES.length - 1) / featureCols)
              return (
              <div key={f.title} style={{
                padding: spacing[6],
                borderRight: (i % featureCols !== featureCols - 1) ? `1px solid ${colors.gray[200]}` : 'none',
                borderBottom: i < lastRowStart ? `1px solid ${colors.gray[200]}` : 'none'
              }}>
                <f.icon size={22} color={colors.primary} style={{ marginBottom: spacing[3] }} />
                <Typography variant="h4" mb={spacing[2]}>{f.title}</Typography>
                <Typography variant="bodySmall">{f.text}</Typography>
              </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Comparison table */}
      <div id="why-us" style={{ padding: sectionPadding(spacing[12]), backgroundColor: colors.white, textAlign: 'center' }}>
        <SectionLabel>The difference</SectionLabel>
        <Typography variant="h2" mb={spacing[10]} style={{ margin: `0 auto ${spacing[10]}` }}>
          Why coaches choose Green Fuzzy Ball.
        </Typography>

        <div style={{
          textAlign: 'left', borderRadius: radius['2xl'],
          border: `1px solid ${colors.gray[200]}`, overflow: 'hidden'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
            {!isMobile && (
              <>
                <div style={{
                  padding: `${spacing[4]} ${spacing[6]}`, backgroundColor: colors.gray[50],
                  borderRight: `1px solid ${colors.gray[200]}`, borderBottom: `1px solid ${colors.gray[200]}`
                }}>
                  <Typography variant="label">Without Green Fuzzy Ball</Typography>
                </div>
                <div style={{
                  padding: `${spacing[4]} ${spacing[6]}`, backgroundColor: colors.primaryLight,
                  borderBottom: `1px solid ${colors.gray[200]}`
                }}>
                  <Typography variant="label" color={colors.primaryDark}>With Green Fuzzy Ball</Typography>
                </div>
              </>
            )}

            {COMPARISON.map((row, i) => (
              <Fragment key={row.without}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: spacing[3],
                  padding: isMobile ? `${spacing[3]} ${spacing[4]}` : `${spacing[4]} ${spacing[6]}`,
                  borderRight: isMobile ? 'none' : `1px solid ${colors.gray[200]}`,
                  borderBottom: isMobile ? 'none' : (i < COMPARISON.length - 1 ? `1px solid ${colors.gray[200]}` : 'none')
                }}>
                  <X size={18} color={colors.gray[400]} />
                  <Typography variant="bodySmall">{row.without}</Typography>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: spacing[3],
                  padding: isMobile ? `0 ${spacing[4]} ${spacing[3]}` : `${spacing[4]} ${spacing[6]}`,
                  borderBottom: i < COMPARISON.length - 1 ? `1px solid ${colors.gray[200]}` : 'none'
                }}>
                  <Check size={18} color={colors.primary} />
                  <Typography variant="bodySmall" style={{ fontWeight: '600', color: colors.black }}>{row.with}</Typography>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Day timeline */}
      <div style={{ padding: sectionPadding(spacing[12]), backgroundColor: colors.gray[50] }}>
        <SectionLabel>A day with Green Fuzzy Ball</SectionLabel>
        <Typography variant="h2" mb={spacing[10]} style={{ maxWidth: '640px' }}>
          From morning schedule to end-of-week review.
        </Typography>

        <div style={isMobile
          ? { display: 'flex', flexDirection: 'column' }
          : { display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing[8] }
        }>
          {DAY_STEPS.map((s, i) => (
            <Fragment key={s.label}>
              {isMobile ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: spacing[4],
                  padding: `${spacing[4]} 0`,
                  borderBottom: i < DAY_STEPS.length - 1 ? `1px solid ${colors.gray[200]}` : 'none'
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: radius.md,
                    backgroundColor: colors.primaryLight, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <s.icon size={18} color={colors.primary} />
                  </div>
                  <div>
                    <Typography variant="caption" mb={spacing[1]} style={{ fontWeight: '600' }}>{s.label}</Typography>
                    <Typography variant="h4">{s.text}</Typography>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: '140px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: radius.md,
                      backgroundColor: colors.primaryLight, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', marginBottom: spacing[3]
                    }}>
                      <s.icon size={20} color={colors.primary} />
                    </div>
                    <Typography variant="caption" mb={spacing[1]} style={{ fontWeight: '600' }}>{s.label}</Typography>
                    <Typography variant="h4">{s.text}</Typography>
                  </div>
                  {i < DAY_STEPS.length - 1 && (
                    <ArrowRight size={20} color={colors.gray[400]} style={{ marginTop: spacing[8], flexShrink: 0 }} />
                  )}
                </>
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div id="how-it-works" style={{ padding: sectionPadding(spacing[12]), backgroundColor: colors.white }}>
        <SectionLabel>How it works</SectionLabel>
        <Typography variant="h2" mb={spacing[10]}>Up and running in three steps.</Typography>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: spacing[8], marginBottom: spacing[10] }}>
          {STEPS.map(s => (
            <div key={s.n}>
              <div style={{ fontSize: '40px', fontWeight: '800', color: colors.gray[200], marginBottom: spacing[2] }}>{s.n}</div>
              <Typography variant="h4" mb={spacing[2]}>{s.title}</Typography>
              <Typography variant="bodySmall">{s.text}</Typography>
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: spacing[4],
          backgroundColor: colors.primaryLight, borderRadius: radius.xl,
          padding: spacing[5]
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: radius.md, backgroundColor: colors.white,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <MapIcon size={18} color={colors.primary} />
          </div>
          <div style={{ flex: 1 }}>
            <Typography variant="h4" mb={spacing[1]}>Built for coaches today. A shared space for coaches and students tomorrow.</Typography>
            <Typography variant="bodySmall">
              Right now, Green Fuzzy Ball is all about running your coaching business. Student accounts —
              so athletes can see their own progress — are on the roadmap.
            </Typography>
          </div>
          <Badge label="Coming soon" />
        </div>
      </div>

      {/* Mobile */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: spacing[12],
        padding: sectionPadding(spacing[12]),
        backgroundColor: colors.gray[50]
      }}>
        <div style={{ flex: '1 1 420px', minWidth: '320px' }}>
          <SectionLabel>Also on mobile</SectionLabel>
          <Typography variant="h2" mb={spacing[5]}>
            Everything, in your pocket too.
          </Typography>
          <Typography variant="body" color={colors.gray[600]} mb={spacing[8]}>
            Check today's schedule, rate drills courtside, and message students — the full app,
            right from your phone. Nothing to switch between, nothing to sync.
          </Typography>

          <div style={{
            display: 'flex', alignItems: 'center', gap: spacing[4],
            backgroundColor: colors.white, borderRadius: radius.xl,
            border: `1px solid ${colors.gray[200]}`, padding: spacing[5]
          }}>
            <Download size={20} color={colors.primary} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <Typography variant="h4" mb={spacing[1]}>Install the web app</Typography>
              <Typography variant="bodySmall">No app store — add it straight to your home screen</Typography>
            </div>
            <InstallButton variant="inline" />
          </div>
        </div>

        <div style={{ flex: '1 1 420px', height: '530px', minWidth: '320px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '280px', height: '100%', backgroundColor: colors.white, borderRadius: radius['2xl'],
            border: `1px solid ${colors.gray[200]}`, boxShadow: shadows.lg,
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: `${spacing[3]} 0` }}>
              <div style={{ width: '80px', height: '20px', borderRadius: radius.full, backgroundColor: colors.black }} />
            </div>


            <div style={{ padding: spacing[5], flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[4] }}>
                <div>
                  <Typography variant="caption" mb={spacing[1]}>Tuesday, Jul 4</Typography>
                  <Typography variant="h4">Good morning</Typography>
                </div>
                <div style={{
                  width: '32px', height: '32px', borderRadius: radius.full, backgroundColor: colors.black,
                  color: colors.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: '700'
                }}>AR</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing[2], marginBottom: spacing[5] }}>
                {[
                  { label: 'Students', value: 24 },
                  { label: 'Sessions', value: 18 },
                  { label: 'Drills', value: 32 }
                ].map(s => (
                  <div key={s.label} style={{
                    padding: spacing[3], borderRadius: radius.lg,
                    backgroundColor: colors.gray[50], border: `1px solid ${colors.gray[200]}`
                  }}>
                    <Typography variant="h4" mb={spacing[1]}>{s.value}</Typography>
                    <Typography variant="caption">{s.label}</Typography>
                  </div>
                ))}
              </div>

              <Typography variant="label" mb={spacing[3]}>Today's Sessions</Typography>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                {[
                  { time: '10:00', type: 'private', name: 'Maria C.' },
                  { time: '2:30', type: 'group', name: 'Leo +2' }
                ].map(s => (
                  <div key={s.time} style={{
                    display: 'flex', alignItems: 'center', gap: spacing[3],
                    padding: spacing[3], borderRadius: radius.lg,
                    border: `1px solid ${colors.gray[200]}`
                  }}>
                    <Typography variant="bodySmall" style={{ fontWeight: '700', minWidth: '40px' }}>{s.time}</Typography>
                    <Badge label={s.type === 'private' ? 'Private' : 'Group'} variant={s.type} />
                    <Typography variant="bodySmall" style={{ fontWeight: '600', flex: 1 }}>{s.name}</Typography>
                    <ChevronRight size={16} color={colors.gray[400]} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-around', alignItems: 'center',
              padding: `${spacing[3]} 0`, borderTop: `1px solid ${colors.gray[200]}`
            }}>
              {[Home, Users, Calendar, Search].map((Icon, i) => (
                <Icon key={i} size={20} color={i === 0 ? colors.primary : colors.gray[400]} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats band */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: spacing[8], alignItems: 'center', justifyContent: 'space-between',
        padding: sectionPadding(spacing[10]), backgroundColor: colors.black
      }}>
        <div style={{ maxWidth: '420px' }}>
          <Typography variant="label" color={colors.primary} mb={spacing[3]}>Built for real coaching businesses</Typography>
          <Typography variant="h2" color={colors.white}>
            Made for coaches running 5–50 students — not a big-club franchise.
          </Typography>
        </div>
        <div style={{ display: 'flex', gap: spacing[10] }}>
          {STATS.map(s => (
            <div key={s.label}>
              <Typography variant="h1" color={colors.white} mb={spacing[1]}>{s.value}</Typography>
              <Typography variant="bodySmall" color={colors.gray[400]}>{s.label}</Typography>
            </div>
          ))}
        </div>
      </div>

      <PublicFooter />

    </div>
  )
}

export default Landing
