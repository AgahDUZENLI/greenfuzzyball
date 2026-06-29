import { useState } from 'react'
import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'
import Input from './Input'
import Button from './Button'
import { Target, Plus, X } from 'lucide-react'
import { createDrill } from '../services/api'

function CreateDrillModal({ categories, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('all')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!name.trim()) return setError('Drill name is required')
    setError('')
    setLoading(true)
    try {
      const res = await createDrill({
        name,
        description,
        category_ids: categoryId ? [categoryId] : []
      })
      onCreated(res.data)
      onClose()
    } catch {
      setError('Could not create drill. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 9999
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white', borderRadius: radius['2xl'],
          width: '560px', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          padding: `${spacing[6]} ${spacing[6]} ${spacing[4]}`
        }}>
          <div>
            <Typography variant="h3">Create Drill</Typography>
            <Typography variant="bodySmall" color={colors.gray[400]}>Add a drill to your library</Typography>
          </div>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', border: 'none',
            borderRadius: radius.lg, backgroundColor: colors.gray[100],
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={16} color={colors.gray[500]} />
          </button>
        </div>

        <div style={{ padding: `0 ${spacing[6]} ${spacing[6]}` }}>

          {error && (
            <div style={{
              backgroundColor: colors.errorLight, color: colors.error,
              padding: spacing[3], borderRadius: radius.md,
              marginBottom: spacing[4], fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          {/* Drill name */}
          <div style={{ marginBottom: spacing[4] }}>
            <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>DRILL NAME</Typography>
            <Input
              icon={<Target size={16} />}
              placeholder="Slice Approach"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Category + Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4], marginBottom: spacing[2] }}>
            <div>
              <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>CATEGORY</Typography>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px',
                  border: `1.5px solid ${colors.gray[200]}`,
                  borderRadius: radius.lg, fontSize: '15px',
                  fontFamily: 'inherit', color: colors.black,
                  backgroundColor: 'white', cursor: 'pointer',
                  outline: 'none', boxSizing: 'border-box'
                }}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.drill_category_id} value={cat.drill_category_id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>DURATION</Typography>
              <select style={{
                width: '100%', padding: '12px 16px',
                border: `1.5px solid ${colors.gray[200]}`,
                borderRadius: radius.lg, fontSize: '15px',
                fontFamily: 'inherit', color: colors.black,
                backgroundColor: 'white', cursor: 'pointer',
                outline: 'none', boxSizing: 'border-box'
              }}>
                {['5 min', '10 min', '15 min', '20 min', '30 min'].map(d => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* New category link */}
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: colors.primary, fontSize: '13px', fontWeight: '600',
            fontFamily: 'inherit', marginBottom: spacing[4],
            display: 'flex', alignItems: 'center', gap: spacing[1]
          }}>
            <Plus size={14} /> New category
          </button>

          {/* Level */}
          <div style={{ marginBottom: spacing[4] }}>
            <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>LEVEL</Typography>
            <div style={{
              display: 'flex', backgroundColor: colors.gray[100],
              borderRadius: radius.xl, padding: '4px'
            }}>
              {['all', 'beginner', 'intermediate', 'advanced'].map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  style={{
                    flex: 1, padding: spacing[2],
                    border: 'none', borderRadius: radius.lg,
                    cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: '14px',
                    fontWeight: level === l ? '600' : '400',
                    backgroundColor: level === l ? 'white' : 'transparent',
                    color: level === l ? colors.black : colors.gray[500],
                    boxShadow: level === l ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  {l === 'all' ? 'All levels' : l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: spacing[4] }}>
            <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>DESCRIPTION</Typography>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the drill setup and instructions..."
              rows={3}
              style={{
                width: '100%', padding: '12px 16px',
                border: `1.5px solid ${colors.gray[200]}`,
                borderRadius: radius.lg, fontSize: '15px',
                fontFamily: 'inherit', color: colors.black,
                resize: 'vertical', outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = colors.primary}
              onBlur={e => e.target.style.borderColor = colors.gray[200]}
            />
          </div>

          {/* Focus tags */}
          <div style={{ marginBottom: spacing[6] }}>
            <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>FOCUS TAGS</Typography>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
              {tags.map(tag => (
                <span key={tag} style={{
                  display: 'flex', alignItems: 'center', gap: spacing[1],
                  backgroundColor: colors.primaryLight, color: colors.primary,
                  padding: '4px 12px', borderRadius: radius.full,
                  fontSize: '13px', fontWeight: '500'
                }}>
                  {tag}
                  <button
                    onClick={() => setTags(tags.filter(t => t !== tag))}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: colors.primary }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTag()}
                placeholder="+ Add tag"
                style={{
                  border: `1.5px dashed ${colors.gray[300]}`,
                  borderRadius: radius.full, padding: '4px 12px',
                  fontSize: '13px', fontFamily: 'inherit',
                  outline: 'none', color: colors.gray[500],
                  backgroundColor: 'white'
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none',
                color: colors.gray[500], fontSize: '14px',
                fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              Cancel
            </button>
            <Button onClick={handleCreate} disabled={loading}>
              <Plus size={16} />
              {loading ? 'Creating...' : 'Create Drill'}
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default CreateDrillModal