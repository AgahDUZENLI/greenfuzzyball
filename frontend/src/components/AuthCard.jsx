import { useNavigate } from 'react-router-dom'

function AuthCard({ leftContent, children }) {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>

      {/* Black left panel */}
      <div style={{
        width: '42%',
        backgroundColor: '#111',
        color: 'white',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
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

        <div>{leftContent}</div>

        <p style={{ color: '#6b7280', fontSize: '13px' }}>© 2026 Green Fuzzy Ball</p>
      </div>

      {/* White right panel */}
      <div style={{
        flex: 1,
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        margin: '16px',
        borderRadius: '16px'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {children}
        </div>
      </div>

    </div>
  )
}

export default AuthCard