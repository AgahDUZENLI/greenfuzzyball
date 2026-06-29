import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Typography from '../components/Typography'
import Button from '../components/Button'
import { getSharedDrill, importSharedDrill } from '../services/api'
import { colors, spacing, radius } from '../styles/tokens'
import { Target, CheckCircle } from 'lucide-react'

function DrillShare() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [drill, setDrill] = useState(null)
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getSharedDrill(token)
      .then(res => setDrill(res.data))
      .catch(() => setError('Drill not found or link is invalid.'))
      .finally(() => setLoading(false))
  }, [token])

  const handleImport = async (force = false) => {
    setImporting(true)
    setError('')
    try {
      await importSharedDrill(token, force)
      setImported(true)
    } catch (err) {
      if (err.response?.status === 409 && !force) {
        const confirmed = window.confirm(
          `${err.response.data.detail}. Import anyway as a copy?`
        )
        if (confirmed) {
          // Call API directly with force=true, don't recurse
          try {
            await importSharedDrill(token, true)
            setImported(true)
          } catch {
            setError('Could not import drill. Please try again.')
          }
        }
      } else {
        setError('Could not import drill. Please try again.')
      }
    } finally {
      setImporting(false)
    }
  }

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', backgroundColor: colors.gray[50]
    }}>
      <Typography variant="bodySmall" color={colors.gray[400]}>Loading...</Typography>
    </div>
  )

  if (error) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', backgroundColor: colors.gray[50],
      gap: spacing[4]
    }}>
      <Typography variant="h3">Link not found</Typography>
      <Typography variant="bodySmall" color={colors.gray[400]}>{error}</Typography>
      <Button onClick={() => navigate('/drills')}>Go to Drills</Button>
    </div>
  )

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', backgroundColor: colors.gray[50]
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: radius['2xl'],
        padding: spacing[8], width: '480px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
      }}>

        {/* Icon */}
        <div style={{
          width: '56px', height: '56px', borderRadius: radius.xl,
          backgroundColor: colors.primaryLight,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: spacing[5]
        }}>
          <Target size={28} color={colors.primary} />
        </div>

        {/* Shared by */}
        <Typography variant="caption" color={colors.gray[400]} style={{ display: 'block', marginBottom: spacing[2] }}>
          Shared by {drill.coach_name}
        </Typography>

        {/* Drill name */}
        <Typography variant="h2" mb={spacing[3]}>{drill.name}</Typography>

        {/* Categories */}
        <div style={{ display: 'flex', gap: spacing[2], marginBottom: spacing[4] }}>
          {drill.categories?.map(cat => (
            <span key={cat.drill_category_id} style={{
              backgroundColor: colors.primaryLight, color: colors.primary,
              padding: '4px 12px', borderRadius: radius.full,
              fontSize: '13px', fontWeight: '500'
            }}>
              {cat.name}
            </span>
          ))}
        </div>

        {/* Description */}
        {drill.description && (
          <div style={{
            backgroundColor: colors.gray[50], borderRadius: radius.xl,
            padding: spacing[4], marginBottom: spacing[6]
          }}>
            <Typography variant="bodySmall" color={colors.gray[600]}>
              {drill.description}
            </Typography>
          </div>
        )}

        {/* Action */}
        {imported ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: spacing[3],
            color: colors.primary
          }}>
            <CheckCircle size={20} color={colors.primary} />
            <Typography variant="body" style={{ color: colors.primary, fontWeight: '600' }}>
              Added to your library!
            </Typography>
            <button
              onClick={() => navigate('/drills')}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                color: colors.primary, cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '14px', fontWeight: '600'
              }}
            >
              Go to Drills →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: spacing[3] }}>
            <Button onClick={() => handleImport()} disabled={importing} style={{ flex: 1 }}>
              {importing ? 'Adding...' : '+ Add to my library'}
            </Button>
            <button
              onClick={() => navigate('/drills')}
              style={{
                background: 'none', border: 'none',
                color: colors.gray[500], cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '14px', fontWeight: '600'
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DrillShare