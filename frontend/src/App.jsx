import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import Dashboard from './pages/coach/Dashboard'
import Students from './pages/coach/Students'
import Drills from './pages/coach/Drills'
import Sessions from './pages/coach/Sessions'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import AuthCallback from './pages/auth/AuthCallback'
import SessionDetail from './pages/coach/SessionDetail'
import DrillShare from './pages/coach/DrillShare'
import Settings from './pages/coach/Settings'
import Landing from './pages/public/Landing'
import Terms from './pages/public/Terms'
import Privacy from './pages/public/Privacy'
import About from './pages/public/About'
import Contact from './pages/public/Contact'
import MemberDashboard from './pages/member/MemberDashboard'
import MemberSessions from './pages/member/MemberSessions'
import MemberSessionDetail from './pages/member/MemberSessionDetail'
import MemberProgress from './pages/member/MemberProgress'
import MemberProfile from './pages/member/MemberProfile'




function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function PushNavigationListener() {
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (event) => {
      if (event.data?.type === 'PUSH_NAVIGATE' && event.data.link) navigate(event.data.link)
    }
    navigator.serviceWorker?.addEventListener('message', handler)
    return () => navigator.serviceWorker?.removeEventListener('message', handler)
  }, [navigate])

  return null
}

// Standalone PWA mode has no browser chrome, so the OS edge-swipe-to-go-back gesture isn't available. This recreates it: a swipe starting within the left edge strip that moves mostly horizontally triggers a back navigation.
const SWIPE_EDGE_ZONE = 24
const SWIPE_DISTANCE_THRESHOLD = 70
const SWIPE_MAX_VERTICAL_RATIO = 0.5

function SwipeBackListener() {
  const navigate = useNavigate()

  useEffect(() => {
    let tracking = false
    let startX = 0
    let startY = 0

    const onTouchStart = (event) => {
      const touch = event.touches[0]
      tracking = touch.clientX <= SWIPE_EDGE_ZONE
      startX = touch.clientX
      startY = touch.clientY
    }

    const onTouchMove = (event) => {
      if (!tracking) return
      const touch = event.touches[0]
      const dx = touch.clientX - startX
      const dy = touch.clientY - startY
      if (Math.abs(dy) > Math.abs(dx) * SWIPE_MAX_VERTICAL_RATIO) tracking = false
    }

    const onTouchEnd = (event) => {
      if (!tracking) return
      tracking = false
      const touch = event.changedTouches[0]
      const dx = touch.clientX - startX
      const dy = touch.clientY - startY
      if (dx > SWIPE_DISTANCE_THRESHOLD && Math.abs(dy) < dx * SWIPE_MAX_VERTICAL_RATIO) {
        navigate(-1)
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [navigate])

  return null
}

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to="/" />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      <Route path="/" element={user ? (user.role === 'member' ? <Navigate to="/member" /> : <Dashboard />) : <Landing />} />
      <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
      <Route path="/drills" element={<ProtectedRoute role="coach"><Drills /></ProtectedRoute>} />
      <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/sessions/:sessionId" element={<ProtectedRoute><SessionDetail /></ProtectedRoute>} />
      <Route path="/drills/share/:token" element={<DrillShare />} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/member" element={<ProtectedRoute role="member"><MemberDashboard /></ProtectedRoute>} />
      <Route path="/member/sessions" element={<ProtectedRoute role="member"><MemberSessions /></ProtectedRoute>} />
      <Route path="/member/sessions/:sessionId" element={<ProtectedRoute role="member"><MemberSessionDetail /></ProtectedRoute>} />
      <Route path="/member/progress" element={<ProtectedRoute role="member"><MemberProgress /></ProtectedRoute>} />
      <Route path="/member/profile" element={<ProtectedRoute role="member"><MemberProfile /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <PushNavigationListener />
        <SwipeBackListener />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App