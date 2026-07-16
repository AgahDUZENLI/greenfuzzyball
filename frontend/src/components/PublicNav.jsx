import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Button from './Button'
import Logo from './Logo'
import { colors, spacing } from '../styles/tokens'
import usePublicNav from '../hooks/usePublicNav'
import useIsMobile from '../hooks/useIsMobile'

const navLinkStyle = {
  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  fontSize: '14px', fontWeight: '500', color: colors.gray[700]
}

function PublicNav() {
  const { navigate, goHome, goToSection } = usePublicNav()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  const handleGoToSection = (id) => {
    goToSection(id)
    setOpen(false)
  }

  const handleNavigate = (path) => {
    navigate(path)
    setOpen(false)
  }

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 10 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `${spacing[4]} ${isMobile ? spacing[4] : spacing[28]}`,
        backgroundColor: colors.white,
        borderBottom: `1px solid ${colors.gray[200]}`
      }}>
        <div onClick={goHome} style={{ cursor: 'pointer' }}>
          <Logo />
        </div>

        {isMobile ? (
          <button
            onClick={() => setOpen(v => !v)}
            style={{
              border: 'none', background: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', padding: spacing[1]
            }}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} color={colors.gray[700]} /> : <Menu size={22} color={colors.gray[700]} />}
          </button>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[12] }}>
              <button onClick={() => goToSection('features')} style={navLinkStyle}>Features</button>
              <button onClick={() => goToSection('how-it-works')} style={navLinkStyle}>How it works</button>
              <button onClick={() => navigate('/login')} style={navLinkStyle}>Sign in</button>
            </div>
            <Button onClick={() => navigate('/register')}>Start for free</Button>
          </>
        )}
      </div>

      {isMobile && open && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: spacing[4],
          padding: spacing[5],
          backgroundColor: colors.white,
          borderBottom: `1px solid ${colors.gray[200]}`
        }}>
          <button onClick={() => handleGoToSection('features')} style={{ ...navLinkStyle, textAlign: 'left', fontSize: '16px' }}>Features</button>
          <button onClick={() => handleGoToSection('how-it-works')} style={{ ...navLinkStyle, textAlign: 'left', fontSize: '16px' }}>How it works</button>
          <button onClick={() => handleNavigate('/login')} style={{ ...navLinkStyle, textAlign: 'left', fontSize: '16px' }}>Sign in</button>
          <Button onClick={() => handleNavigate('/register')}>Start for free</Button>
        </div>
      )}
    </div>
  )
}

export default PublicNav
