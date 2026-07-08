import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Typography from '../components/Typography'
import StatCard from '../components/StatCard'
import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import { colors, spacing, radius, shadows } from '../styles/tokens'
import {
  Zap, FileText, CalendarX2, BrainCircuit,
  Users, Calendar, Share2, Gauge, Mail, Smartphone,
  Map as MapIcon, ArrowRight
} from 'lucide-react'

const PROBLEMS = [
  {
    icon: FileText,
    title: 'Scattered notes',
    text: "Student info spread across notebooks, texts, and spreadsheets that never quite stay in sync."
  },
  {
    icon: CalendarX2,
    title: 'Double-booked courts',
    text: "No single view of your day, so scheduling conflicts slip through until it's too late."
  },
  {
    icon: BrainCircuit,
    title: 'Progress lives in your head',
    text: "Without ratings tracked over time, neither you nor your students can see what's actually improving."
  }
]

const FEATURES = [
  { icon: Users, title: 'Student management & progress', text: 'Profiles, levels, and notes for every athlete — with progress tracked automatically over time.' },
  { icon: Calendar, title: 'Smart session booking', text: 'Book any time you want — Green Fuzzy Ball flags conflicts before they become a problem.' },
  { icon: Share2, title: 'Drill library with sharing', text: 'Build your own drills, organize them by category, and share any drill with a coach via a link.' },
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
        padding: `${spacing[12]} ${spacing[28]}`,
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
            Run your coaching business, not a spreadsheet.
          </Typography>
          <Typography variant="body" color={colors.gray[600]} mb={spacing[8]}>
            Manage students, book sessions without double-booking, and rate every drill 1–10 —
            so you always know who's improving and what to coach next.
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
                app.greenfuzzyball.com
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

      {/* Problem */}
      <div style={{ padding: `${spacing[12]} ${spacing[28]}`, backgroundColor: colors.white }}>
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
      <div id="features" style={{ padding: `${spacing[12]} ${spacing[28]}`, backgroundColor: colors.gray[50] }}>
        <SectionLabel>Features</SectionLabel>
        <Typography variant="h2" mb={spacing[10]} style={{ maxWidth: '640px' }}>
          Everything you need to run your coaching business.
        </Typography>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} style={{
                padding: spacing[6],
                borderRight: (i % 3 !== 2) ? `1px solid ${colors.gray[200]}` : 'none',
                borderBottom: i < 3 ? `1px solid ${colors.gray[200]}` : 'none'
              }}>
                <f.icon size={22} color={colors.primary} style={{ marginBottom: spacing[3] }} />
                <Typography variant="h4" mb={spacing[2]}>{f.title}</Typography>
                <Typography variant="bodySmall">{f.text}</Typography>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* How it works */}
      <div id="how-it-works" style={{ padding: `${spacing[12]} ${spacing[28]}`, backgroundColor: colors.white }}>
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

      {/* Stats band */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: spacing[8], alignItems: 'center', justifyContent: 'space-between',
        padding: `${spacing[10]} ${spacing[28]}`, backgroundColor: colors.black
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
