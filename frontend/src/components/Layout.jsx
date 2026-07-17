import Sidebar from './Sidebar'
import BottomTabBar from './BottomTabBar'
import useIsMobile from '../hooks/useIsMobile'

function Layout({ children, variant = 'app' }) {
  const isMobile = useIsMobile()

  if (variant === 'auth') {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#e5e7eb',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}>
        {children}
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {!isMobile && <Sidebar />}
      <main style={{
        flex: 1,
        overflow: 'auto',
        paddingTop: isMobile ? 'env(safe-area-inset-top)' : 0,
        paddingBottom: isMobile ? 'calc(64px + env(safe-area-inset-bottom))' : 0
      }}>
        {children}
      </main>
      {isMobile && <BottomTabBar />}
    </div>
  )
}

export default Layout