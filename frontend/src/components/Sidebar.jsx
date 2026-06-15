import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

const navItems = [
  { label: 'Home', path: '/', icon: '🏠' },
  { label: 'Students', path: '/students', icon: '👤' },
  { label: 'Sessions', path: '/sessions', icon: '📅' },
  { label: 'Drills', path: '/drills', icon: '🎾' }
]

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{
      width: '220px',
      minHeight: '100vh',
      backgroundColor: 'white',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 12px',
      flexShrink: 0
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', marginBottom: '24px' }}>
        <img
          src="/logo.png"
          alt="CoachPilot"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px'
          }}
        />
        <span style={{ fontWeight: '700', fontSize: '16px' }}>CoachPilot</span>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(item => {
          const active = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: active ? '600' : '400',
                fontSize: '14px',
                backgroundColor: active ? '#f0fdf4' : 'transparent',
                color: active ? '#16a34a' : '#374151',
                textAlign: 'left',
                width: '100%',
                fontFamily: 'inherit'
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* User Profile at bottom */}
      <button
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: 'transparent',
          textAlign: 'left',
          width: '100%',
          fontFamily: 'inherit'
        }}
      >
        <Avatar name={user?.name} size="sm" />
        <div>
          <div style={{ fontWeight: '600', fontSize: '13px', color: '#111' }}>
            {user?.name}
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>Settings</div>
        </div>
        <span style={{ marginLeft: 'auto', color: '#9ca3af' }}>›</span>
      </button>
    </div>
  )
}

export default Sidebar