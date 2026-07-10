import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import AuthCard from '../components/AuthCard'
import Input from '../components/Input'
import Button from '../components/Button'
import Typography from '../components/Typography'
import TabToggle from '../components/TabToggle'
import FeatureList from '../components/FeatureList'
import TextLink from '../components/TextLink'
import Divider from '../components/Divider'
import { User, Mail, Lock, Eye, EyeOff, Building } from 'lucide-react'
import { colors, spacing, radius } from '../styles/tokens'
import { register } from '../services/api'


const PANELS = {
  coach: {
    heading: 'Run your academy.',
    features: [
      'Unlimited students & sessions',
      'Share a code — students self-enroll',
      'Free for your first 5 athletes'
    ]
  },
  student: {
    heading: 'Start your journey.',
    features: [
      'See your progress over time',
      'Stay connected with your coach',
      'Track every session and drill'
    ]
  }
}

function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('coach')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ name, email, password, location })
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError('Could not create account. Email may already be in use.')
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
              { value: 'coach', label: 'Coach', icon: <User size={14} /> },
              { value: 'student', label: 'Student', icon: <User size={14} /> }
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        {/* Heading */}
        <Typography variant="h2" mb={spacing[1]}>
          Create {tab === 'coach' ? 'coach' : 'student'} account
        </Typography>
        <Typography variant="bodySmall" mb={spacing[6]}>
          {tab === 'coach' ? 'Start managing your students.' : 'Join your coach\'s team.'}
        </Typography>

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
              Student registration coming soon!
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

        {/* Form */}
        <form onSubmit={handleRegister}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], marginBottom: spacing[4] }}>
            <Input
              icon={<User size={16} />}
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={tab === 'student'}
            />
            <Input
              type="email"
              icon={<Mail size={16} />}
              placeholder="coach@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={tab === 'student'}
            />
            <Input
              type={showPassword ? 'text' : 'password'}
              icon={<Lock size={16} />}
              placeholder="Create a password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              onRightIconDown={() => setShowPassword(true)}
              onRightIconUp={() => setShowPassword(false)}
              required
              disabled={tab === 'student'}
            />
            <Input
              icon={<Building size={16} />}
              placeholder="Club / academy (optional)"
              value={location}
              onChange={e => setLocation(e.target.value)}
              disabled={tab === 'student'}
            />
          </div>

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

          {/* Terms */}
          <Typography variant="caption" mb={spacing[4]} style={{ display: 'block' }}>
            By continuing you agree to the{' '}
            <TextLink onClick={() => alert('Coming soon!')}>Terms</TextLink>
            {' '}and{' '}
            <TextLink onClick={() => alert('Coming soon!')}>Privacy Policy</TextLink>.
          </Typography>

          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={loading || tab === 'student'}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        {/* Already have account */}
        <div style={{ textAlign: 'center', marginTop: spacing[5] }}>
          <Typography variant="bodySmall" style={{ display: 'inline' }}>
            Already have an account?{' '}
          </Typography>
          <TextLink onClick={() => navigate('/login')}>
            Log in
          </TextLink>
        </div>

      </AuthCard>
    </Layout>
  )
}

export default Register