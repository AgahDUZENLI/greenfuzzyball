import Typography from './Typography'
import Logo from './Logo'
import { colors, spacing } from '../styles/tokens'
import usePublicNav from '../hooks/usePublicNav'
import useIsMobile from '../hooks/useIsMobile'

const footerLinkStyle = {
  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  fontSize: '14px', color: colors.gray[600], textAlign: 'left', padding: 0,
  textDecoration: 'none'
}

const footerLinks = [
  { label: 'Sign in', path: '/login' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
  { label: 'Privacy', path: '/privacy' },
  { label: 'Terms', path: '/terms' }
]

function PublicFooter() {
  const { navigate } = usePublicNav()
  const isMobile = useIsMobile()

  return (
    <div style={{ padding: `${spacing[8]} ${isMobile ? spacing[4] : spacing[28]} 0` }}>
      <div style={{
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center',
        gap: spacing[6]
      }}>
        <div>
          <Logo />
          <Typography variant="bodySmall" style={{ marginTop: spacing[3] }}>
            Coaching business management for independent tennis coaches.
          </Typography>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: spacing[2] }}>
          {footerLinks.map((link, i) => (
            <div key={link.path} style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              {i > 0 && <span style={{ color: colors.gray[300] }}>·</span>}
              <button onClick={() => navigate(link.path)} style={footerLinkStyle}>{link.label}</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: spacing[8], paddingTop: spacing[6], borderTop: `1px solid ${colors.gray[200]}`,
        paddingBottom: spacing[8],
        display: 'flex', flexWrap: 'wrap', gap: spacing[3], justifyContent: 'space-between'
      }}>
        <Typography variant="caption">© {new Date().getFullYear()} Green Fuzzy Ball · greenfuzzyball.app@gmail.com</Typography>
      </div>
    </div>
  )
}

export default PublicFooter
