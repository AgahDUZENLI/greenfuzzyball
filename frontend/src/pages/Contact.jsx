import { Mail } from 'lucide-react'
import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import { colors, spacing, radius } from '../styles/tokens'

function Contact() {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', backgroundColor: 'white' }}>
      <PublicNav />

      {/* Hero */}
      <div style={{ backgroundColor: '#F5F3EE', padding: `${spacing[16]} ${spacing[6]}`, textAlign: 'center' }}>
        <h1 style={{
          fontSize: '42px', fontWeight: '800', color: '#111',
          lineHeight: 1.2, margin: '0 auto 0 auto', maxWidth: '480px'
        }}>
          Get in touch.
        </h1>
        <p style={{
          fontSize: '18px', color: colors.gray[500],
          lineHeight: 1.7, margin: `${spacing[5]} auto 0`,
          maxWidth: '440px'
        }}>
          I build and run Green Fuzzy Ball myself. Every message gets a real reply from me.
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: `${spacing[16]} ${spacing[6]}` }}>

        {/* Email card */}
        <a
          href="mailto:greenfuzzyball.app@gmail.com"
          style={{
            display: 'flex', alignItems: 'center', gap: spacing[4],
            padding: spacing[6],
            border: `1.5px solid ${colors.gray[200]}`,
            borderRadius: radius.xl,
            textDecoration: 'none',
            marginBottom: spacing[6],
            transition: 'border-color 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = colors.primary}
          onMouseLeave={e => e.currentTarget.style.borderColor = colors.gray[200]}
        >
          <div style={{
            width: '44px', height: '44px', borderRadius: radius.lg,
            backgroundColor: colors.primaryLight,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <Mail size={20} color={colors.primary} />
          </div>
          <div>
            <p style={{ fontSize: '13px', color: colors.gray[400], margin: `0 0 ${spacing[1]} 0`, fontWeight: '500' }}>
              EMAIL
            </p>
            <p style={{ fontSize: '16px', color: '#111', fontWeight: '600', margin: 0 }}>
              greenfuzzyball.app@gmail.com
            </p>
          </div>
        </a>

        {/* What to reach out about */}
        <div style={{
          backgroundColor: '#F5F3EE',
          borderRadius: radius.xl,
          padding: spacing[6]
        }}>
          <p style={{
            fontSize: '12px', fontWeight: '700', color: colors.primary,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            margin: `0 0 ${spacing[4]} 0`
          }}>
            WHAT TO REACH OUT ABOUT
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {[
              '🐛  Found a bug or something broken',
              '💡  Feature request or idea',
              '🎾  Feedback on how it works for your coaching',
              '👋  Just want to say hello',
            ].map(item => (
              <p key={item} style={{
                fontSize: '15px', color: colors.gray[600],
                margin: 0, lineHeight: 1.6
              }}>
                {item}
              </p>
            ))}
          </div>
        </div>

      </div>

      <PublicFooter />
    </div>
  )
}

export default Contact