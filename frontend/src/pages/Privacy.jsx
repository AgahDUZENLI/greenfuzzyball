import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import Typography from '../components/Typography'
import { colors, spacing } from '../styles/tokens'

const SECTIONS = [
  {
    title: '1. What we collect',
    body: `When you create a Green Fuzzy Ball account, we collect your name, email, and password. As you use the Service, you'll add student profiles, session bookings, drills, and performance ratings — this coaching data is entered by you and stored on your behalf.`
  },
  {
    title: '2. How we use it',
    body: `We use your data to run the Service: displaying your dashboard, preventing double-booked sessions, tracking student progress over time, and sending email notifications you've opted into (like session confirmations and reminders). We don't use your coaching data for advertising.`
  },
  {
    title: '3. Data sharing',
    body: `We don't sell your data. We share information only with service providers who help us operate Green Fuzzy Ball — for example, an email delivery provider used to send session notifications — and only to the extent needed to provide the Service.`
  },
  {
    title: '4. Data retention',
    body: `We keep your account and coaching data for as long as your account is active. If you close your account, we'll delete your data within a reasonable period, except where we're required to retain it for legal reasons.`
  },
  {
    title: '5. Security',
    body: `We use reasonable technical and organizational measures to protect your data, including encrypted connections and access controls. No system is perfectly secure, so we can't guarantee absolute security, but we take protecting your data seriously.`
  },
  {
    title: '6. Your choices',
    body: `You can review, update, or delete your student and session data directly from your account at any time. You can also update your notification preferences from your account settings, or contact us to request a copy or deletion of your data.`
  },
  {
    title: '7. Cookies',
    body: `We use essential cookies to keep you signed in and to remember your session. We don't use third-party advertising or tracking cookies.`
  },
  {
    title: '8. Children’s privacy',
    body: `Green Fuzzy Ball is intended for use by coaches, not by children directly. Coaches may enter information about minor students as part of managing their coaching business; if you're a parent or guardian with questions about data entered about your child, please contact us.`
  },
  {
    title: '9. Changes to this policy',
    body: `We may update this Privacy Policy from time to time. If we make material changes, we'll update the "last updated" date below. Continuing to use the Service after changes take effect means you accept the revised policy.`
  },
  {
    title: '10. Contact',
    body: `Questions about this policy or your data? Reach us at hello@greenfuzzyball.com.`
  }
]

function Privacy() {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <PublicNav />

      <div style={{
        maxWidth: '720px', margin: '0 auto',
        padding: `${spacing[16]} ${spacing[6]}`
      }}>
        <Typography variant="h1" mb={spacing[2]}>Privacy Policy</Typography>
        <Typography variant="caption" style={{ display: 'block', marginBottom: spacing[10] }}>
          Last updated: July 2026
        </Typography>

        {SECTIONS.map(s => (
          <div key={s.title} style={{ marginBottom: spacing[8] }}>
            <Typography variant="h3" mb={spacing[3]}>{s.title}</Typography>
            <Typography variant="body" color={colors.gray[600]}>{s.body}</Typography>
          </div>
        ))}
      </div>

      <PublicFooter />
    </div>
  )
}

export default Privacy
