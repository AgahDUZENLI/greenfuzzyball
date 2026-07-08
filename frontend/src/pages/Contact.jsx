import { Mail } from 'lucide-react'
import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import Typography from '../components/Typography'
import Button from '../components/Button'
import { colors, spacing } from '../styles/tokens'

function Contact() {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <PublicNav />

      <div style={{
        maxWidth: '720px', margin: '0 auto',
        padding: `${spacing[16]} ${spacing[6]}`
      }}>
        <Typography variant="h1" mb={spacing[4]}>Contact</Typography>
        <Typography variant="body" color={colors.gray[600]} mb={spacing[8]}>
          I'm Agah — I build and run Green Fuzzy Ball myself, so every message gets a real, personal reply
          from me, whether it's a bug, a feature request, or just feedback on how it's working for your
          coaching business.
        </Typography>

        <Button
          size="lg"
          onClick={() => { window.location.href = 'mailto:hello@greenfuzzyball.com' }}
        >
          <Mail size={16} /> hello@greenfuzzyball.com
        </Button>
      </div>

      <PublicFooter />
    </div>
  )
}

export default Contact
