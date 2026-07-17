import { useState } from 'react'
import Typography from './Typography'
import Button from './Button'
import { X, Target, Pencil, Trash2 } from 'lucide-react'
import { colors, spacing, radius } from '../styles/tokens'
import { updateDrill, deleteDrill } from '../services/api'
import useIsMobile from '../hooks/useIsMobile'

function DrillDetailPanel({ drill, onClose, onUpdated, onDeleted }) {
  const isMobile = useIsMobile()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(drill.name)
  const [description, setDescription] = useState(drill.description || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await updateDrill(drill.drill_id, { name, description })
      onUpdated(res.data)
      setEditing(false)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${drill.name}"?`)) return
    try {
      await deleteDrill(drill.drill_id)
      onDeleted(drill.drill_id)
      onClose()
    } catch {}
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 9999,
        padding: isMobile ? 0 : spacing[4]
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: isMobile ? 0 : radius['2xl'],
          width: '100%',
          maxWidth: isMobile ? 'none' : '520px',
          height: isMobile ? '100dvh' : 'auto',
          maxHeight: isMobile ? '100dvh' : '90vh',
          overflowY: 'auto',
          boxShadow: isMobile ? 'none' : '0 20px 60px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: `calc(${spacing[6]} + env(safe-area-inset-top)) ${spacing[6]} ${spacing[4]}`,
          borderBottom: `1px solid ${colors.gray[100]}`,
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: radius.lg,
              backgroundColor: colors.primaryLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Target size={18} color={colors.primary} />
            </div>
            <div>
              {drill.categories?.map(c => (
                <Typography key={c.drill_category_id} variant="caption" color={colors.primary}>
                  {c.name}
                </Typography>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{
            border: 'none', background: 'none', cursor: 'pointer',
            width: '32px', height: '32px', borderRadius: radius.lg,
            backgroundColor: colors.gray[100],
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={16} color={colors.gray[500]} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: spacing[6] }}>

          {/* Name */}
          {editing ? (
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              style={{
                width: '100%', fontSize: '22px', fontWeight: '700',
                border: 'none', borderBottom: `2px solid ${colors.primary}`,
                outline: 'none', fontFamily: 'inherit', marginBottom: spacing[4],
                backgroundColor: 'transparent', boxSizing: 'border-box'
              }}
            />
          ) : (
            <Typography variant="h2" mb={spacing[4]}>{name}</Typography>
          )}

          {/* Description */}
          <div style={{
            backgroundColor: colors.gray[50], borderRadius: radius.xl,
            padding: spacing[4], marginBottom: spacing[5]
          }}>
            <Typography variant="label" color={colors.gray[400]} style={{ display: 'block', marginBottom: spacing[2] }}>
              DESCRIPTION
            </Typography>
            {editing ? (
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                style={{
                  width: '100%', border: 'none', outline: 'none',
                  fontFamily: 'inherit', fontSize: '14px',
                  backgroundColor: 'transparent', resize: 'vertical',
                  color: colors.gray[700], boxSizing: 'border-box'
                }}
              />
            ) : (
              <Typography variant="bodySmall" color={colors.gray[600]}>
                {description || 'No description'}
              </Typography>
            )}
          </div>

          {/* Categories */}
          <div style={{ marginBottom: spacing[5] }}>
            <Typography variant="label" color={colors.gray[400]} style={{ display: 'block', marginBottom: spacing[3] }}>
              CATEGORIES
            </Typography>
            <div style={{ display: 'flex', gap: spacing[2], flexWrap: 'wrap' }}>
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
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: `${spacing[4]} ${spacing[6]} calc(${spacing[4]} + env(safe-area-inset-bottom))`,
          borderTop: `1px solid ${colors.gray[100]}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0
        }}>
          <button
            onClick={handleDelete}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: colors.error, fontSize: '14px', fontWeight: '600',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: spacing[2]
            }}
          >
            <Trash2 size={14} /> Delete
          </button>

          {editing ? (
            <div style={{ display: 'flex', gap: spacing[3] }}>
              <button
                onClick={() => setEditing(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: colors.gray[500], fontSize: '14px',
                  fontWeight: '600', fontFamily: 'inherit'
                }}
              >
                Cancel
              </button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setEditing(true)}>
              <Pencil size={14} /> Edit drill
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}

export default DrillDetailPanel