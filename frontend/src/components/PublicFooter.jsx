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

function PublicFooter() {
  const { navigate, goToSection } = usePublicNav()
  const isMobile = useIsMobile()

  return (
    <div style={{ padding: `${spacing[8]} ${isMobile ? spacing[4] : spacing[28]} 0` }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[8], justifyContent: 'space-between' }}>
        <div style={{ maxWidth: isMobile ? 'none' : '280px' }}>
          <Logo />
          <Typography variant="bodySmall" style={{ marginTop: spacing[3] }}>
            Coaching business management for independent tennis coaches.
          </Typography>
        </div>
        <div style={isMobile
          ? { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing[4], width: '100%' }
          : { display: 'flex', flexDirection: 'row', gap: spacing[16] }
        }>
          <div>
            <Typography variant="label" mb={spacing[3]}>Product</Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              <button onClick={() => goToSection('features')} style={footerLinkStyle}>Features</button>
              <button onClick={() => goToSection('how-it-works')} style={footerLinkStyle}>How it works</button>
              <button onClick={() => navigate('/login')} style={footerLinkStyle}>Sign in</button>
            </div>
          </div>
          <div>
            <Typography variant="label" mb={spacing[3]}>Company</Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              <button onClick={() => navigate('/about')} style={footerLinkStyle}>About</button>
              <button onClick={() => navigate('/contact')} style={footerLinkStyle}>Contact</button>
            </div>
          </div>
          <div>
            <Typography variant="label" mb={spacing[3]}>Legal</Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              <button onClick={() => navigate('/privacy')} style={footerLinkStyle}>Privacy</button>
              <button onClick={() => navigate('/terms')} style={footerLinkStyle}>Terms</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: spacing[8], paddingTop: spacing[6], borderTop: `1px solid ${colors.gray[200]}`,
        paddingBottom: spacing[8],
        display: 'flex', flexWrap: 'wrap', gap: spacing[3], justifyContent: 'space-between'
      }}>
        <Typography variant="caption">© {new Date().getFullYear()} Green Fuzzy Ball · hello@greenfuzzyball.com</Typography>
      </div>
    </div>
  )
}

export default PublicFooter
