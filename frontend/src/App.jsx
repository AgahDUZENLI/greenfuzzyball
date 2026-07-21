import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Drills from './pages/Drills'
import Sessions from './pages/Sessions'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AuthCallback from './pages/AuthCallback'
import SessionDetail from './pages/SessionDetail'
import DrillShare from './pages/DrillShare'
import Settings from './pages/Settings'
import Landing from './pages/Landing'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import About from './pages/About'
import Contact from './pages/Contact'



function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />
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

      <Route path="/" element={user ? <Dashboard /> : <Landing />} />    
      <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
      <Route path="/drills" element={<ProtectedRoute><Drills /></ProtectedRoute>} />
      <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/sessions/:sessionId" element={<ProtectedRoute><SessionDetail /></ProtectedRoute>} />
      <Route path="/drills/share/:token" element={<DrillShare />} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
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