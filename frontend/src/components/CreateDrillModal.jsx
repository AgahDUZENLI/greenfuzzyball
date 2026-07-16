import { useState } from 'react'
import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'
import Input from './Input'
import Button from './Button'
import { Target, Plus, X } from 'lucide-react'
import { createDrill, createDrillCategory, deleteDrillCategory } from '../services/api'


function CreateDrillModal({ categories: initialCategories, onClose, onCreated, onCategoryCreated }) {
  const [categories, setCategories] = useState(initialCategories)
  const [name, setName] = useState('')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([])
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState(null)

  const toggleCategory = (id) => {
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    setCreatingCategory(true)
    try {
      const res = await createDrillCategory({ name: newCategoryName.trim() })
      setCategories(prev => [...prev, res.data])
      setSelectedCategoryIds(prev => [...prev, res.data.drill_category_id])
      setNewCategoryName('')
      setShowNewCategory(false)
      onCategoryCreated && onCategoryCreated(res.data)
    } catch {
      alert('Could not create category.')
    } finally {
      setCreatingCategory(false)
    }
  }

  const handleCreate = async () => {
    if (!name.trim()) return setError('Drill name is required')
    if (selectedCategoryIds.length === 0) return setError('Please select at least one category')
    setError('')
    setLoading(true)
    try {
      const res = await createDrill({
        name, description,
        category_ids: selectedCategoryIds
      })
      onCreated(res.data)
      onClose()
    } catch {
      setError('Could not create drill. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 9999, padding: spacing[4]
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        backgroundColor: 'white', borderRadius: radius['2xl'],
        width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>

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
          <div style={{ marginBottom: spacing[5] }}>
            <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>DRILL NAME</Typography>
            <Input
              icon={<Target size={16} />}
              placeholder="Slice Approach"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Category pills */}
          <div style={{ marginBottom: spacing[5] }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] }}>
              <Typography variant="label">CATEGORY</Typography>
              <Typography variant="caption" color={colors.gray[400]}>
                Tap to select · hold the × to remove
              </Typography>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
              {categories.map(cat => {
                const selected = selectedCategoryIds.includes(cat.drill_category_id)
                const isCustom = cat.coach_id !== null
                return (
                  <div key={cat.drill_category_id} style={{ position: 'relative', display: 'inline-flex' }}>
                    <button
                      onClick={() => toggleCategory(cat.drill_category_id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: spacing[1],
                        padding: '6px 14px',
                        borderRadius: radius.full,
                        border: `1.5px solid ${selected ? colors.primary : colors.gray[200]}`,
                        backgroundColor: selected ? colors.primary : 'white',
                        color: selected ? 'white' : colors.gray[600],
                        fontSize: '13px', fontWeight: '500',
                        cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.15s'
                      }}
                    >
                      {cat.name}
                      {selected && (
                        <span
                          onClick={e => { e.stopPropagation(); toggleCategory(cat.drill_category_id) }}
                          style={{ marginLeft: '4px', lineHeight: 1 }}
                        >
                          ×
                        </span>
                      )}
                    </button>

      {/* Delete button for custom categories */}
      {isCustom && (
        deletingCategoryId === cat.drill_category_id ? (
          <div style={{
            position: 'absolute', top: '-8px', right: '-8px',
            backgroundColor: 'white', border: `1px solid ${colors.gray[200]}`,
            borderRadius: radius.lg, padding: '4px 8px',
            display: 'flex', alignItems: 'center', gap: spacing[2],
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10,
            whiteSpace: 'nowrap'
          }}>
            <Typography variant="caption" color={colors.gray[500]}>Delete?</Typography>
            <button
              onClick={async e => {
                e.stopPropagation()
                try {
                  await deleteDrillCategory(cat.drill_category_id)
                  setCategories(prev => prev.filter(c => c.drill_category_id !== cat.drill_category_id))
                  setSelectedCategoryIds(prev => prev.filter(id => id !== cat.drill_category_id))
                  setDeletingCategoryId(null)
                } catch {
                  alert('Could not delete.')
                }
              }}
              style={{
                border: 'none', backgroundColor: colors.error,
                color: 'white', borderRadius: radius.md,
                padding: '2px 8px', cursor: 'pointer',
                fontSize: '11px', fontFamily: 'inherit', fontWeight: '600'
              }}
            >
              Yes
            </button>
            <button
              onClick={e => { e.stopPropagation(); setDeletingCategoryId(null) }}
              style={{
                border: 'none', background: 'none',
                cursor: 'pointer', fontSize: '11px',
                color: colors.gray[400], fontFamily: 'inherit'
              }}
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); setDeletingCategoryId(cat.drill_category_id) }}
            title="Delete category"
            style={{
              position: 'absolute', top: '-6px', right: '-6px',
              width: '16px', height: '16px',
              borderRadius: '50%',
              backgroundColor: colors.error,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '10px', fontWeight: '700'
            }}
          >
            ×
          </button>
        )
      )}
    </div>
  )
})}

              {/* New category */}
              {showNewCategory ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                  <input
                    autoFocus
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleCreateCategory()
                      if (e.key === 'Escape') { setShowNewCategory(false); setNewCategoryName('') }
                    }}
                    placeholder="Category name..."
                    style={{
                      border: `1.5px solid ${colors.primary}`,
                      borderRadius: radius.full, padding: '6px 12px',
                      fontSize: '13px', fontFamily: 'inherit', outline: 'none',
                      width: '140px'
                    }}
                  />
                  <button
                    onClick={handleCreateCategory}
                    disabled={creatingCategory}
                    style={{
                      border: 'none', backgroundColor: colors.primary,
                      color: 'white', borderRadius: radius.full,
                      padding: '6px 12px', cursor: 'pointer',
                      fontSize: '13px', fontFamily: 'inherit'
                    }}
                  >
                    {creatingCategory ? '...' : 'Add'}
                  </button>
                  <button
                    onClick={() => { setShowNewCategory(false); setNewCategoryName('') }}
                    style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    <X size={14} color={colors.gray[400]} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewCategory(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: spacing[1],
                    padding: '6px 14px',
                    borderRadius: radius.full,
                    border: `1.5px dashed ${colors.primary}`,
                    backgroundColor: 'transparent',
                    color: colors.primary,
                    fontSize: '13px', fontWeight: '500',
                    cursor: 'pointer', fontFamily: 'inherit'
                  }}
                >
                  <Plus size={13} /> New
                </button>
              )}
            </div>
          </div>

          {/* Level */}
          <div style={{ marginBottom: spacing[5] }}>
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
          <div style={{ marginBottom: spacing[6] }}>
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

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={onClose} style={{
              background: 'none', border: 'none',
              color: colors.gray[500], fontSize: '14px',
              fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
            }}>
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