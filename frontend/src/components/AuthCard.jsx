import { useNavigate } from 'react-router-dom'
import useIsMobile from '../hooks/useIsMobile'
import { spacing } from '../styles/tokens'

function AuthCard({ leftContent, children }) {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', width: '100%', minHeight: '100vh' }}>

      {/* Black left panel */}
      <div style={{
        width: isMobile ? '100%' : '42%',
        backgroundColor: '#111',
        color: 'white',
        padding: isMobile ? `${spacing[4]} ${spacing[5]}` : '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isMobile ? 'flex-start' : 'space-between'
      }}>
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <img
            src="/logo.png"
            alt="Green Fuzzy Ball"
            style={{ width: '40px', height: '40px', borderRadius: '10px' }}
          />
          <span style={{ fontSize: '18px', fontWeight: '700' }}>Green Fuzzy Ball</span>
        </div>

        {!isMobile && <div>{leftContent}</div>}

        {!isMobile && <p style={{ color: '#6b7280', fontSize: '13px' }}>© 2026 Green Fuzzy Ball</p>}
      </div>

      {/* White right panel */}
      <div style={{
        flex: 1,
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? spacing[5] : '48px',
        margin: isMobile ? 0 : '16px',
        borderRadius: isMobile ? 0 : '16px'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {children}
        </div>
      </div>

    </div>
  )
}

export default AuthCard