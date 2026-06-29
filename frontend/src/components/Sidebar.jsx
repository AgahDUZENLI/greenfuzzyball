import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, Users, Calendar, Dumbbell } from 'lucide-react'
import Avatar from './Avatar'
import { colors, spacing, radius } from '../styles/tokens'

const navItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Students', path: '/students', icon: Users },
  { label: 'Sessions', path: '/sessions', icon: Calendar },
  { label: 'Drills', path: '/drills', icon: Dumbbell }
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
      borderRight: `1px solid ${colors.gray[200]}`,
      display: 'flex',
      flexDirection: 'column',
      padding: `${spacing[5]} ${spacing[3]}`,
      flexShrink: 0
    }}>

      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: spacing[3], padding: `${spacing[2]} ${spacing[3]}`,
        marginBottom: spacing[6]
      }}>
        <img
          src="/logo.png"
          alt="CoachPilot"
          style={{ width: '36px', height: '36px', borderRadius: radius.lg }}
        />
        <span style={{ fontWeight: '700', fontSize: '16px', color: colors.black }}>
          CoachPilot
        </span>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3],
                padding: `10px ${spacing[3]}`,
                borderRadius: radius.md,
                border: 'none',
                cursor: 'pointer',
                fontWeight: active ? '600' : '400',
                fontSize: '14px',
                backgroundColor: active ? colors.primaryLight : 'transparent',
                color: active ? colors.primary : colors.gray[700],
                textAlign: 'left',
                width: '100%',
                fontFamily: 'inherit',
                transition: 'all 0.15s'
              }}
            >
              <Icon
                size={18}
                color={active ? colors.primary : colors.gray[500]}
                strokeWidth={active ? 2.5 : 1.8}
              />
              {label}
            </button>
          )
        })}
      </nav>

      {/* User Profile */}
      <button
        onClick={() => navigate('/settings')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3],
          padding: `10px ${spacing[3]}`,
          borderRadius: radius.md,
          border: 'none',
          cursor: 'pointer',
          backgroundColor: 'transparent',
          textAlign: 'left',
          width: '100%',
          fontFamily: 'inherit'
        }}
      >
        <Avatar name={user?.name} size="sm" />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', fontSize: '13px', color: colors.black }}>
            {user?.name}
          </div>
          <div style={{ fontSize: '11px', color: colors.gray[400] }}>Settings</div>
        </div>
        <span style={{ color: colors.gray[400], fontSize: '16px' }}>›</span>
      </button>

    </div>
  )
}

export default Sidebar