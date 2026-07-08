import Button from './Button'
import Logo from './Logo'
import { colors, spacing } from '../styles/tokens'
import usePublicNav from '../hooks/usePublicNav'

const navLinkStyle = {
  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  fontSize: '14px', fontWeight: '500', color: colors.gray[700]
}

function PublicNav() {
  const { navigate, goHome, goToSection } = usePublicNav()

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: `${spacing[4]} ${spacing[28]}`,
      backgroundColor: colors.white,
      borderBottom: `1px solid ${colors.gray[200]}`
    }}>
      <div onClick={goHome} style={{ cursor: 'pointer' }}>
        <Logo />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[12] }}>
        <button onClick={() => goToSection('features')} style={navLinkStyle}>Features</button>
        <button onClick={() => goToSection('how-it-works')} style={navLinkStyle}>How it works</button>
        <button onClick={() => navigate('/login')} style={navLinkStyle}>Sign in</button>
      </div>
      <Button onClick={() => navigate('/register')}>Start for free</Button>
    </div>
  )
}

export default PublicNav
