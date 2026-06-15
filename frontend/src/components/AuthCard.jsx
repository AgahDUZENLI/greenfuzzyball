function AuthCard({ leftContent, children }) {
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      minHeight: '100vh'
    }}>

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
            src="/logo.png"
            alt="CoachPilot"
            style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px'
            }}
        />
        <span style={{ fontSize: '18px', fontWeight: '700' }}>CoachPilot</span>
        </div>

        {/* Whatever content you pass in */}
        <div>{leftContent}</div>

        <p style={{ color: '#6b7280', fontSize: '13px' }}>© 2026 CoachPilot</p>
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