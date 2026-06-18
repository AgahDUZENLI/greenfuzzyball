import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import AuthCard from '../components/AuthCard'
import Input from '../components/Input'
import Button from '../components/Button'
import Typography from '../components/Typography'
import TextLink from '../components/TextLink'
import FeatureList from '../components/FeatureList'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { colors, spacing, radius } from '../styles/tokens'
import { resetPassword } from '../services/api'

function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await resetPassword(token, password)
      navigate('/login?reset=success')
    } catch {
      setError('Invalid or expired reset link. Please request a new one.')
    } finally {
      setLoading(false)
    }
  }

  const leftContent = (
    <FeatureList
      heading="Create a new password."
      features={[
        'Choose something strong',
        'At least 8 characters',
        'You\'ll be logged in right after'
      ]}
    />
  )

  if (!token) {
    return (
      <Layout variant="auth">
        <AuthCard leftContent={leftContent}>
          <Typography variant="h2" mb={spacing[4]}>Invalid link</Typography>
          <Typography variant="bodySmall" mb={spacing[6]}>
            This reset link is invalid or has expired.
          </Typography>
          <TextLink onClick={() => navigate('/forgot-password')}>
            Request a new reset link
          </TextLink>
        </AuthCard>
      </Layout>
    )
  }

  return (
    <Layout variant="auth">
      <AuthCard leftContent={leftContent}>

        <Typography variant="h2" mb={spacing[1]}>
          Create new password
        </Typography>
        <Typography variant="bodySmall" mb={spacing[6]}>
          Choose a strong password for your account.
        </Typography>

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

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], marginBottom: spacing[6] }}>
            <Input
              type={showPassword ? 'text' : 'password'}
              icon={<Lock size={16} />}
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              onRightIconDown={() => setShowPassword(true)}
              onRightIconUp={() => setShowPassword(false)}
              required
            />
            <Input
              type={showConfirm ? 'text' : 'password'}
              icon={<Lock size={16} />}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              rightIcon={showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              onRightIconDown={() => setShowConfirm(true)}
              onRightIconUp={() => setShowConfirm(false)}
              required
            />
          </div>

          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? 'Updating...' : 'Update password'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: spacing[5] }}>
          <TextLink onClick={() => navigate('/login')}>
            ← Back to log in
          </TextLink>
        </div>

      </AuthCard>
    </Layout>
  )
}

export default ResetPassword