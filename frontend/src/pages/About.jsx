import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import Typography from '../components/Typography'
import { colors, spacing } from '../styles/tokens'

function About() {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <PublicNav />

      <div style={{
        maxWidth: '720px', margin: '0 auto',
        padding: `${spacing[16]} ${spacing[6]}`
      }}>
        <Typography variant="h1" mb={spacing[8]}>About</Typography>

        <div style={{ marginBottom: spacing[8] }}>
          <Typography variant="body" color={colors.gray[600]}>
            Hi, I'm Agah. I built Green Fuzzy Ball myself — it's not a company, just me.
          </Typography>
        </div>

        <div style={{ marginBottom: spacing[8] }}>
          <Typography variant="body" color={colors.gray[600]}>
            The idea came from watching how much coaching admin ends up scattered across notebooks,
            text threads, and a spreadsheet that never quite stays up to date. Student info in one place,
            session times in another, and no easy way to look back and see who was actually improving.
          </Typography>
        </div>

        <div style={{ marginBottom: spacing[8] }}>
          <Typography variant="body" color={colors.gray[600]}>
            Because it's just me building this, it's deliberately focused on what independent coaches
            actually need day to day, rather than trying to be everything for every club or franchise.
          </Typography>
        </div>

        <div style={{ marginBottom: spacing[8] }}>
          <Typography variant="body" color={colors.gray[600]}>
            Today, that means one place to manage students, book sessions without double-booking, and rate
            every drill 1–10 so progress is easy to see over time. It's early, and it'll keep growing based
            on what coaches actually ask for.
          </Typography>
        </div>

        <div>
          <Typography variant="body" color={colors.gray[600]}>
            Have a question, a feature request, or just want to say hello? Reach out any time at{' '}
            hello@greenfuzzyball.com — I read and reply to every message myself.
          </Typography>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}

export default About
