import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import { colors, spacing, radius } from '../styles/tokens'

function About() {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', backgroundColor: 'white' }}>
      <PublicNav />

      {/* Hero */}
      <div style={{ backgroundColor: '#F5F3EE', padding: `${spacing[16]} ${spacing[6]}`, textAlign: 'center' }}>
        <h1 style={{
          fontSize: '42px', fontWeight: '800', color: '#111',
          lineHeight: 1.2, margin: '0 auto', maxWidth: '560px'
        }}>
          Built for independent coaches who want to track their students' progress.
        </h1>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: `${spacing[16]} ${spacing[6]}` }}>

        {/* Who */}
        <div style={{ marginBottom: spacing[10] }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: colors.primary, letterSpacing: '0.1em', textTransform: 'uppercase', margin: `0 0 ${spacing[3]} 0` }}>
            WHO BUILT THIS
          </p>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111', margin: `0 0 ${spacing[4]} 0` }}>
            Hi, I'm Agah.
          </h2>
          <p style={{ fontSize: '17px', color: colors.gray[600], lineHeight: 1.8, margin: 0 }}>
            I'm a computer science student at the University of Houston. I built Green Fuzzy Ball
            from scratch — the backend, the frontend, the database, the design, and the infrastructure
            running on my own home server.
          </p>
        </div>

        {/* Why */}
        <div style={{ marginBottom: spacing[10] }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: colors.primary, letterSpacing: '0.1em', textTransform: 'uppercase', margin: `0 0 ${spacing[3]} 0` }}>
            WHY IT EXISTS
          </p>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111', margin: `0 0 ${spacing[4]} 0` }}>
            The problem was obvious.
          </h2>
          <p style={{ fontSize: '17px', color: colors.gray[600], lineHeight: 1.8, margin: `0 0 ${spacing[4]} 0` }}>
            I was coaching tennis and wanted to track my students' progress without doing it on paper.
            Independent coaches manage a lot — students, schedules, drill libraries, session notes —
            and most do it across notebooks, text threads, and spreadsheets that never quite stay in sync.
          </p>
          <p style={{ fontSize: '17px', color: colors.gray[600], lineHeight: 1.8, margin: 0 }}>
            Green Fuzzy Ball puts it all in one place. Book sessions without double-booking,
            rate every drill 1–10 so progress is visible over time, and share drills with
            other coaches via a link.
          </p>
        </div>

        {/* What */}
        <div style={{ marginBottom: spacing[10] }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: colors.primary, letterSpacing: '0.1em', textTransform: 'uppercase', margin: `0 0 ${spacing[3]} 0` }}>
            WHERE IT'S GOING
          </p>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111', margin: `0 0 ${spacing[4]} 0` }}>
            Focused. Deliberate. Early.
          </h2>
          <p style={{ fontSize: '17px', color: colors.gray[600], lineHeight: 1.8, margin: 0 }}>
            Built for coaches managing 5 to 50 students — not enterprise software trying to do
            everything for everyone. It's early, and it'll keep growing based on what coaches
            actually ask for.
          </p>
        </div>

        {/* Contact */}
        <div style={{
          borderTop: `1px solid ${colors.gray[100]}`,
          paddingTop: spacing[10],
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111', margin: `0 0 ${spacing[3]} 0` }}>
            Questions or feedback?
          </h2>
          <p style={{ fontSize: '17px', color: colors.gray[500], margin: `0 0 ${spacing[5]} 0` }}>
            I read and reply to every message myself.
          </p>
          <a
            href="mailto:greenfuzzyball.app@gmail.com"
            style={{
              display: 'inline-block',
              padding: `${spacing[3]} ${spacing[8]}`,
              backgroundColor: '#111', color: 'white',
              borderRadius: radius.full, fontSize: '15px',
              fontWeight: '600', textDecoration: 'none'
            }}
          >
            greenfuzzyball.app@gmail.com
          </a>
        </div>

      </div>

      <PublicFooter />
    </div>
  )
}

export default About