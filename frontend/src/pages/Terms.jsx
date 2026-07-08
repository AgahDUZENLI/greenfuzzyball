import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import Typography from '../components/Typography'
import { colors, spacing } from '../styles/tokens'

const SECTIONS = [
  {
    title: '1. Acceptance of these terms',
    body: `By creating an account or using Green Fuzzy Ball ("the Service"), you agree to these Terms of Service. If you don't agree, please don't use the Service. We may update these terms from time to time, as described below.`
  },
  {
    title: '2. Accounts & eligibility',
    body: `Green Fuzzy Ball is built for independent coaches to manage their own coaching business. You must provide accurate information when creating an account and are responsible for keeping your login credentials secure. You're responsible for all activity that happens under your account.`
  },
  {
    title: '3. Acceptable use',
    body: `Use the Service only for lawful purposes related to running your coaching business — managing students, scheduling sessions, and tracking drills and performance. Don't attempt to disrupt the Service, access other coaches' data without authorization, or use the Service to store information you don't have the right to store (for example, sensitive information about a minor without appropriate parental consent).`
  },
  {
    title: '4. Your content',
    body: `Any data you enter — student profiles, session details, drills, ratings, and notes — belongs to you. We don't claim ownership over it. You're responsible for making sure you have the right to store and process the information you add about your students.`
  },
  {
    title: '5. Service availability',
    body: `Green Fuzzy Ball is currently offered free of charge and provided on an "as-is" and "as-available" basis. We don't guarantee uninterrupted or error-free operation, and features may change as the product evolves. We'll do our best to give notice ahead of any significant changes that affect how you use the Service.`
  },
  {
    title: '6. Termination',
    body: `You may stop using the Service and close your account at any time. We may suspend or terminate accounts that violate these terms or that we reasonably believe pose a risk to the Service or other users.`
  },
  {
    title: '7. Disclaimer & limitation of liability',
    body: `The Service is provided without warranties of any kind, express or implied. To the fullest extent permitted by law, Green Fuzzy Ball is not liable for any indirect, incidental, or consequential damages arising from your use of the Service.`
  },
  {
    title: '8. Changes to these terms',
    body: `We may update these Terms of Service from time to time. If we make material changes, we'll update the "last updated" date below. Continuing to use the Service after changes take effect means you accept the revised terms.`
  },
  {
    title: '9. Contact',
    body: `Questions about these terms? Reach us at hello@greenfuzzyball.com.`
  }
]

function Terms() {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <PublicNav />

      <div style={{
        maxWidth: '720px', margin: '0 auto',
        padding: `${spacing[16]} ${spacing[6]}`
      }}>
        <Typography variant="h1" mb={spacing[2]}>Terms of Service</Typography>
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

export default Terms
