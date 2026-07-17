import { colors, radius, shadows, spacing } from '../styles/tokens'
import Typography from './Typography'
import { X } from 'lucide-react'
import useIsMobile from '../hooks/useIsMobile'

function Modal({ title, subtitle, children, onClose, maxWidth = '560px' }) {
  const isMobile = useIsMobile()

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
        padding: isMobile ? 0 : spacing[4]
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: isMobile ? 0 : radius['2xl'],
          boxShadow: isMobile ? 'none' : '0 20px 60px rgba(0,0,0,0.2)',
          width: '100%',
          height: isMobile ? '100dvh' : 'auto',
          maxWidth: isMobile ? 'none' : maxWidth,
          maxHeight: isMobile ? '100dvh' : '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexShrink: 0,
          padding: `calc(${spacing[6]} + env(safe-area-inset-top)) ${spacing[6]} ${spacing[4]}`,
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
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <X size={16} color={colors.gray[500]} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: `${spacing[5]} ${spacing[6]} calc(${spacing[6]} + env(safe-area-inset-bottom))`,
          overflowY: 'auto',
          flex: 1
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal