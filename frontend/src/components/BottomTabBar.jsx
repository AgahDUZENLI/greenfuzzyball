import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Users, Calendar, Dumbbell, Settings as SettingsIcon } from 'lucide-react'
import { colors, spacing } from '../styles/tokens'

const navItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Students', path: '/students', icon: Users },
  { label: 'Sessions', path: '/sessions', icon: Calendar },
  { label: 'Drills', path: '/drills', icon: Dumbbell },
  { label: 'Settings', path: '/settings', icon: SettingsIcon }
]

function isActive(pathname, path) {
  return pathname === path || pathname.startsWith(`${path}/`)
}

function BottomTabBar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9998,
      display: 'flex',
      backgroundColor: 'white',
      borderTop: `1px solid ${colors.gray[200]}`,
      boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {navItems.map(({ label, path, icon: Icon }) => {
        const active = path === '/' ? location.pathname === '/' : isActive(location.pathname, path)
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[1],
              padding: `${spacing[2]} 0`,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            <Icon
              size={20}
              color={active ? colors.primary : colors.gray[500]}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <span style={{
              fontSize: '11px',
              fontWeight: active ? '600' : '400',
              color: active ? colors.primary : colors.gray[500]
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomTabBar
