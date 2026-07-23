import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import { colors, spacing } from '../styles/tokens'

const SECTIONS = [
  {
    title: '1. What we collect',
    body: `When you create an account we collect your name, email, and password. As you use the app you'll add student profiles, session bookings, drills, and performance ratings — this coaching data is entered by you and stored on your behalf.`
  },
  {
    title: '2. How we use it',
    body: `We use your data to run the app: showing your dashboard, preventing double-booked sessions, tracking student progress over time, and sending email notifications you've opted into. We don't use your data for advertising.`
  },
  {
    title: '3. Data sharing',
    body: `We don't sell your data. Period.`
  },
  {
    title: '4. Data retention',
    body: `We keep your data for as long as your account is active. If you close your account, we'll delete your data within a reasonable period.`
  },
  {
    title: '5. Security',
    body: `We use encrypted connections and access controls to protect your data. No system is perfectly secure, but we take it seriously.`
  },
  {
    title: '6. Your choices',
    body: `You can update or delete your student and session data directly from your account at any time. You can also update notification preferences from settings.`
  },
  {
    title: '7. Cookies',
    body: `We use essential cookies to keep you signed in. No advertising or tracking cookies.`
  },
  {
    title: "8. Children's privacy",
    body: `Green Fuzzy Ball is for coaches, not children directly. Coaches may enter information about minor students as part of managing their business. If you're a parent with questions, contact us.`
  },
  {
    title: '9. Changes',
    body: `We may update this policy from time to time. We'll update the date below when we do.`
  },
  {
    title: '10. Contact',
    body: `Questions? Reach us at greenfuzzyball.app@gmail.com`
  }
]

function Privacy() {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', backgroundColor: 'white' }}>
      <PublicNav />

      {/* Hero */}
      <div style={{ backgroundColor: '#F5F3EE', padding: `${spacing[12]} ${spacing[6]}`, textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#111', margin: 0 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: '14px', color: colors.gray[400], margin: `${spacing[3]} 0 0` }}>
          Last updated: July 2026
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: `${spacing[12]} ${spacing[6]}` }}>
        {SECTIONS.map((s, i) => (
          <div
            key={s.title}
            style={{
              paddingBottom: spacing[8],
              marginBottom: spacing[8],
              borderBottom: i < SECTIONS.length - 1 ? `1px solid ${colors.gray[100]}` : 'none'
            }}
          >
            <h3 style={{
              fontSize: '17px', fontWeight: '700',
              color: '#111', margin: `0 0 ${spacing[3]} 0`
            }}>
              {s.title}
            </h3>
            <p style={{
              fontSize: '16px', color: colors.gray[600],
              lineHeight: 1.8, margin: 0
            }}>
              {s.body}
            </p>
          </div>
        ))}
      </div>

      <PublicFooter />
    </div>
  )
}

export default Privacy