import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App