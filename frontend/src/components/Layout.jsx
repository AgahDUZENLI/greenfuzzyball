import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomTabBar from './BottomTabBar'
import MemberSidebar from './MemberSidebar'
import MemberBottomTabBar from './MemberBottomTabBar'
import useIsMobile from '../hooks/useIsMobile'
import { useAuth } from '../context/AuthContext'
import { navBarReserve } from '../styles/tokens'

const scrollPositions = new Map()

function Layout({ children, variant = 'app' }) {
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const isMember = user?.role === 'member'
  const mainRef = useRef(null)
  const location = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    el.scrollTop = navigationType === 'POP' ? (scrollPositions.get(location.key) ?? 0) : 0
  }, [])

  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    const onScroll = () => scrollPositions.set(location.key, el.scrollTop)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [location.key])

  if (variant === 'auth') {
    return (
      <div className="app-shell" style={{
        display: 'flex',
        backgroundColor: '#e5e7eb',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}>
        {children}
      </div>
    )
  }

  return (
    <div className="app-shell" style={{
      display: 'flex',
      backgroundColor: '#f9fafb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {!isMobile && (isMember ? <MemberSidebar /> : <Sidebar />)}
      <main ref={mainRef} style={{
        flex: 1,
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingTop: isMobile ? 'env(safe-area-inset-top)' : 0,
        paddingBottom: isMobile ? navBarReserve : 0
      }}>
        {children}
      </main>
      {isMobile && (isMember ? <MemberBottomTabBar /> : <BottomTabBar />)}
    </div>
  )
}

export default Layout