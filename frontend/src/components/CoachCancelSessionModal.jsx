import { useState } from 'react'
import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'
import Button from './Button'
import Modal from './Modal'
import { XCircle } from 'lucide-react'
import { cancelSessionAsCoach } from '../services/api'

function CoachCancelSessionModal({ session, onClose, onCancelled }) {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      const res = await cancelSessionAsCoach(session.session_id, note)
      onCancelled(res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not cancel session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Cancel Session"
      onClose={onClose}
      maxWidth="480px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: colors.gray[500],
            fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
          }}>
            Back
          </button>
          <Button variant="danger" onClick={handleSubmit} disabled={loading}>
            <XCircle size={16} />
            {loading ? 'Cancelling...' : 'Cancel Session'}
          </Button>
        </div>
      }
    >

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
        backgroundColor: colors.warningLight, color: colors.warning,
        padding: spacing[3], borderRadius: radius.md,
        marginBottom: spacing[4], fontSize: '13px'
      }}>
        This will cancel the session immediately and notify the member.
      </div>

      <div style={{ marginBottom: spacing[6] }}>
        <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>NOTE (OPTIONAL)</Typography>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Let the member know why..."
          rows={3}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = colors.primary}
          onBlur={e => e.target.style.borderColor = colors.gray[200]}
        />
      </div>

    </Modal>
  )
}

export default CoachCancelSessionModal
