import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import AuthCard from '../components/AuthCard'
import Input from '../components/Input'
import Button from '../components/Button'
import Typography from '../components/Typography'
import TextLink from '../components/TextLink'
import FeatureList from '../components/FeatureList'
import { Mail } from 'lucide-react'
import { colors, spacing, radius } from '../styles/tokens'
import { forgotPassword } from '../services/api'

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetLink, setResetLink] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await forgotPassword(email)
      setResetLink(res.data.reset_link)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const leftContent = (
    <FeatureList
      heading="Locked out? Happens."
      features={[
        'Enter your email below',
        'Get a secure reset link instantly',
        'Back on court in minutes'
      ]}
    />
  )

  return (
    <Layout variant="auth">
      <AuthCard leftContent={leftContent}>

        <Typography variant="h2" mb={spacing[1]}>
          Reset your password
        </Typography>
        <Typography variant="bodySmall" mb={spacing[6]}>
          Enter the email linked to your account.
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

        {/* Success — show reset link */}
        {resetLink ? (
          <div style={{
            backgroundColor: colors.primaryLight,
            padding: spacing[4],
            borderRadius: radius.md,
            marginBottom: spacing[4]
          }}>
            <Typography variant="bodySmall" color={colors.primary} mb={spacing[3]}>
              Reset link generated! Click below to reset your password.
            </Typography>
            <a
              href={resetLink}
              style={{
                color: colors.primary,
                fontWeight: '600',
                fontSize: '13px',
                wordBreak: 'break-all'
              }}
            >
              {resetLink}
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: spacing[4] }}>
              <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>
                EMAIL
              </Typography>
              <Input
                type="email"
                icon={<Mail size={16} />}
                placeholder="coach@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
        )}

        {/* Back to login */}
        <div style={{ textAlign: 'center', marginTop: spacing[5] }}>
          <TextLink onClick={() => navigate('/login')}>
            ← Back to log in
          </TextLink>
        </div>
      </AuthCard>
    </Layout>
  )
}

export default ForgotPassword