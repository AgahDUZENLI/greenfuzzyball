import { colors, radius, shadows, spacing } from '../styles/tokens'
import Typography from './Typography'
import { X } from 'lucide-react'

function Modal({ title, subtitle, children, onClose, maxWidth = '560px' }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: spacing[4]
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: radius['2xl'],
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: `${spacing[6]} ${spacing[6]} ${spacing[4]}`,
          borderBottom: `1px solid ${colors.gray[100]}`
        }}>
          <div>
            <Typography variant="h3">{title}</Typography>
            {subtitle && (
              <Typography variant="bodySmall" color={colors.gray[400]}>{subtitle}</Typography>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px',
              border: 'none', borderRadius: radius.lg,
              backgroundColor: colors.gray[100],
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={16} color={colors.gray[500]} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: `${spacing[5]} ${spacing[6]} ${spacing[6]}` }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal