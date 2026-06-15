import { colors, radius, shadows, spacing } from '../styles/tokens'
import Typography from './Typography'

function Modal({ title, children, onClose }) {
  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      {/* Modal box — stop click propagation */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: colors.white,
          borderRadius: radius['2xl'],
          boxShadow: shadows.lg,
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: spacing[8]
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing[6]
        }}>
          <Typography variant="h3">{title}</Typography>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: colors.gray[400],
              padding: spacing[1],
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}

export default Modal