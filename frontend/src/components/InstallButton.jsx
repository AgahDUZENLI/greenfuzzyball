import { useState, useEffect } from 'react'
import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'

function InstallButton({ variant = 'button' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstall, setShowInstall] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)
    if (ios) {
      setShowInstall(true)
      return
    }

    // Android/Desktop install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    })

    window.addEventListener('appinstalled', () => {
      setShowInstall(false)
      setIsInstalled(true)
    })
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowInstall(false)
      setIsInstalled(true)
    }
    setDeferredPrompt(null)
  }

  if (isInstalled || !showInstall) return null

  // Inline text link, meant to sit inside an existing card/row
  if (variant === 'inline') {
    if (isIOS) {
      return (
        <Typography variant="bodySmall" color={colors.primary} style={{ fontWeight: '700', whiteSpace: 'nowrap' }}>
          Tap Share → Add to Home Screen
        </Typography>
      )
    }
    return (
      <button
        onClick={handleInstall}
        style={{
          background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer',
          fontFamily: 'inherit', fontSize: '14px', fontWeight: '700',
          color: colors.primary, whiteSpace: 'nowrap'
        }}
      >
        Add to Home Screen
      </button>
    )
  }

  // iOS instruction
  if (isIOS) {
    return (
      <div style={{
        backgroundColor: colors.primaryLight,
        border: `1px solid ${colors.primary}`,
        borderRadius: radius.xl,
        padding: `${spacing[3]} ${spacing[5]}`,
        fontSize: '13px',
        color: colors.primary,
        textAlign: 'center'
      }}>
        To install: tap <strong>Share</strong> → <strong>Add to Home Screen</strong>
      </div>
    )
  }

  // Android/Desktop install button
  return (
    <button
      onClick={handleInstall}
      style={{
        padding: `${spacing[2]} ${spacing[5]}`,
        backgroundColor: colors.primaryLight,
        color: colors.primary,
        border: `1.5px solid ${colors.primary}`,
        borderRadius: radius.full,
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2]
      }}
    >
      📱 Install App
    </button>
  )
}

export default InstallButton