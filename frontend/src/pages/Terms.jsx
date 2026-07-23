import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import { colors, spacing } from '../styles/tokens'

const SECTIONS = [
  {
    title: '1. Acceptance',
    body: `By creating an account or using Green Fuzzy Ball you agree to these terms. If you don't agree, please don't use the Service.`
  },
  {
    title: '2. Accounts',
    body: `You must provide accurate information when creating an account and are responsible for keeping your login secure. You're responsible for all activity under your account.`
  },
  {
    title: '3. Acceptable use',
    body: `Use the Service to manage your coaching business — students, sessions, drills, and performance tracking. Don't use it for anything unlawful or to access other coaches' data.`
  },
  {
    title: '4. Your content',
    body: `Everything you enter — student profiles, sessions, drills, ratings — belongs to you. We don't claim ownership over it.`
  },
  {
    title: '5. Service availability',
    body: `Green Fuzzy Ball is currently free and provided as-is. It's a solo project and features may change over time.`
  },
  {
    title: '6. Termination',
    body: `You can close your account at any time. We may suspend accounts that violate these terms.`
  },
  {
    title: '7. Disclaimer',
    body: `The Service is provided without warranties. We're not liable for any indirect or consequential damages from your use of the Service.`
  },
  {
    title: '8. Changes',
    body: `We may update these terms from time to time and will update the date below when we do.`
  },
  {
    title: '9. Contact',
    body: `Questions? greenfuzzyball.app@gmail.com`
  }
]

function Terms() {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', backgroundColor: 'white' }}>
      <PublicNav />

      {/* Hero */}
      <div style={{ backgroundColor: '#F5F3EE', padding: `${spacing[12]} ${spacing[6]}`, textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#111', margin: 0 }}>
          Terms of Service
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

export default Terms