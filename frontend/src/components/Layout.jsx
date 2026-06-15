import Sidebar from './Sidebar'

function Layout({ children, variant = 'app' }) {
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
      <Sidebar />
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}

export default Layout