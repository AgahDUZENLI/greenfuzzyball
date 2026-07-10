import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import AuthCard from '../components/AuthCard'
import Input from '../components/Input'
import Button from '../components/Button'
import Typography from '../components/Typography'
import TabToggle from '../components/TabToggle'
import Divider from '../components/Divider'
import FeatureList from '../components/FeatureList'
import TextLink from '../components/TextLink'
import { Mail, Lock, Eye, EyeOff, Dumbbell, User } from 'lucide-react'
import { colors, spacing, radius } from '../styles/tokens'

const PANELS = {
  coach: {
    heading: 'Everything you need to coach.',
    features: [
      "Track every student's progress over time",
      'Build sessions from your drill library',
      'Rate performance and spot trends fast'
    ]
  },
  student: {
    heading: 'Train with purpose.',
    features: [
      'See your sessions and drills at a glance',
      'Watch your ratings climb over time',
      'Stay connected with your coach'
    ]
  }
}

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()       
  const resetSuccess = searchParams.get('reset') === 'success'  

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('coach')
  const [rememberMe, setRememberMe] = useState(true)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password, rememberMe)
      navigate('/')
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const panel = PANELS[tab]

  return (
    <Layout variant="auth">
      <AuthCard leftContent={
        <FeatureList heading={panel.heading} features={panel.features} />
      }>

        {/* Tab Toggle */}
        <div style={{ marginBottom: spacing[6] }}>
          <TabToggle
            options={[
              { value: 'coach', label: 'Coach', icon: <Dumbbell size={14} /> },
              { value: 'student', label: 'Student', icon: <User size={14} /> }
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        {/* Heading */}
        <Typography variant="h2" mb={spacing[1]}>
          Welcome back, {tab === 'coach' ? 'Coach' : 'Student'}
        </Typography>
        <Typography variant="bodySmall" mb={spacing[6]}>
          {tab === 'coach' ? 'Log in to your dashboard.' : 'Log in to track your training.'}
        </Typography>

        {/* Reset success */}
        {resetSuccess && (
          <div style={{
            backgroundColor: colors.primaryLight,
            padding: spacing[3],
            borderRadius: radius.md,
            marginBottom: spacing[4]
          }}>
            <Typography variant="bodySmall" color={colors.primary}>
              Password updated successfully! Log in with your new password.
            </Typography>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: colors.errorLight,
            padding: spacing[3],
            borderRadius: radius.md,
            marginBottom: spacing[4]
          }}>
            <Typography variant="bodySmall" color={colors.error}>{error}</Typography>
          </div>
        )}

        {/* Student notice */}
        {tab === 'student' && (
          <div style={{
            backgroundColor: colors.primaryLight,
            padding: spacing[3],
            borderRadius: radius.md,
            marginBottom: spacing[4],
            textAlign: 'center'
          }}>
            <Typography variant="bodySmall" color={colors.primary}>
              Student login coming soon!
            </Typography>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], marginBottom: spacing[4] }}>
            <Input
              type="email"
              icon={<Mail size={16} />}
              placeholder={tab === 'coach' ? 'coach@email.com' : 'student@email.com'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={tab === 'student'}
            />
            <Input
              type={showPassword ? 'text' : 'password'}
              icon={<Lock size={16} />}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              onRightIconDown={() => setShowPassword(true)}
              onRightIconUp={() => setShowPassword(false)}
              required
              disabled={tab === 'student'}
            />
          </div>

          {/* Remember + Forgot */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: spacing[5]
          }}>
            <label style={{
              display: 'flex', alignItems: 'center',
              gap: spacing[2], cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={{ accentColor: colors.primary }}
              />
              <Typography variant="bodySmall" color={colors.gray[700]}>
                Remember me
              </Typography>
            </label>
            <TextLink onClick={() => navigate('/forgot-password')}>
              Forgot password?
            </TextLink>
          </div>

          <Button type="submit" fullWidth size="lg" disabled={loading || tab === 'student'}>
            {loading ? 'Logging in...' : 'Log in'}
          </Button>
        </form>

        {/* Divider */}
        <Divider label="or continue with" />

        {/* Apple + Google */}
        <div style={{ display: 'flex', gap: spacing[3], marginBottom: spacing[6] }}>
          <Button 
            variant="outline" fullWidth 
            onClick={() => window.location.href = 'http://localhost:8000/auth/google'}
            >
            Google
          </Button>
        </div>

        {/* Create account */}
        <div style={{ textAlign: 'center' }}>
          <Typography variant="bodySmall" style={{ display: 'inline' }}>
            New here?{' '}
          </Typography>
          <TextLink onClick={() => navigate('/register')}>
            {tab === 'coach' ? 'Create an account' : 'Join with a coach code'}
          </TextLink>
        </div>

      </AuthCard>
    </Layout>
  )
}

export default Login