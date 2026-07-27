import { useState } from 'react'
import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'
import Button from './Button'
import Modal from './Modal'
import { XCircle } from 'lucide-react'
import { cancelSession } from '../services/api'

function CancelSessionModal({ session, onClose, onCancelled }) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sessionDate = new Date(`${session.date}T${session.start_time || '00:00'}`)
  const isLateCancel = (sessionDate - new Date()) / 3600000 <= 24

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    border: `1.5px solid ${colors.gray[200]}`, borderRadius: radius.lg,
    fontSize: '15px', fontFamily: 'inherit', color: colors.black,
    outline: 'none', boxSizing: 'border-box', resize: 'vertical'
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await cancelSession(session.session_id, reason)
      onCancelled(res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not cancel session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Cancel Session" subtitle={session.personName ? `For ${session.personName}` : undefined} onClose={onClose} maxWidth="480px">

      {error && (
        <div style={{
          backgroundColor: colors.errorLight, color: colors.error,
          padding: spacing[3], borderRadius: radius.md,
          marginBottom: spacing[4], fontSize: '13px'
        }}>
          {error}
        </div>
      )}

      <div style={{
        backgroundColor: isLateCancel ? colors.warningLight : colors.primaryLight,
        color: isLateCancel ? colors.warning : colors.primaryDark,
        padding: spacing[3], borderRadius: radius.md,
        marginBottom: spacing[4], fontSize: '13px'
      }}>
        {isLateCancel
          ? 'This session is within 24 hours. Your coach must approve the cancellation before it\'s confirmed.'
          : 'This session is more than 24 hours away — cancelling now is instant. Your coach will be notified.'}
      </div>

      <div style={{ marginBottom: spacing[6] }}>
        <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>REASON (OPTIONAL)</Typography>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Let your coach know why..."
          rows={3}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = colors.primary}
          onBlur={e => e.target.style.borderColor = colors.gray[200]}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: colors.gray[500],
          fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
        }}>
          Back
        </button>
        <Button variant="danger" onClick={handleSubmit} disabled={loading}>
          <XCircle size={16} />
          {loading ? 'Cancelling...' : isLateCancel ? 'Request Cancellation' : 'Cancel Session'}
        </Button>
      </div>
    </Modal>
  )
}

export default CancelSessionModal
