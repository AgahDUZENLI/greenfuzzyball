import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Typography from '../components/Typography'
import Button from '../components/Button'
import Input from '../components/Input'
import { getDrills, getDrillCategories, deleteDrill, removeDrillFromLibrary, deleteDrillCategory, getDrillCategories as refreshCategories } from '../services/api'
import { colors, spacing, radius } from '../styles/tokens'
import { Search, Plus, Target, X } from 'lucide-react'
import CreateDrillModal from '../components/CreateDrillModal'
import DrillMenu from '../components/DrillMenu'
import DrillDetailPanel from '../components/DrillDetailPanel'

function Drills() {
  const [drills, setDrills] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedDrill, setSelectedDrill] = useState(null)
  const [deletingCategoryId, setDeletingCategoryId] = useState(null)

  useEffect(() => {
    Promise.all([getDrills(), getDrillCategories()])
      .then(([drillsRes, catsRes]) => {
        setDrills(drillsRes.data)
        setCategories(catsRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = drills.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' ||
      d.categories?.some(c => c.drill_category_id === selectedCategory)
    return matchesSearch && matchesCategory
  })

  const usedCategories = categories.filter(cat =>
    drills.some(d => d.categories?.some(c => c.drill_category_id === cat.drill_category_id))
  )

  const grouped = usedCategories.map(cat => ({
    ...cat,
    drills: filtered.filter(d =>
      d.categories?.some(c => c.drill_category_id === cat.drill_category_id)
    )
  })).filter(g => g.drills.length > 0)

  const handleDelete = async (drill) => {
    try {
      await deleteDrill(drill.drill_id)
      setDrills(prev => prev.filter(d => d.drill_id !== drill.drill_id))
      if (selectedDrill?.drill_id === drill.drill_id) setSelectedDrill(null)
    } catch {}
  }

  const handleDeleteCategory = async (cat) => {
    try {
      await deleteDrillCategory(cat.drill_category_id)
      setCategories(prev => prev.filter(c => c.drill_category_id !== cat.drill_category_id))
      if (selectedCategory === cat.drill_category_id) setSelectedCategory('all')
      setDeletingCategoryId(null)
    } catch {}
  }

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: `${spacing[5]} ${spacing[8]}`,
          borderBottom: `1px solid ${colors.gray[200]}`,
          backgroundColor: 'white', flexShrink: 0
        }}>
          <div>
            <Typography variant="h3">Drills</Typography>
            <Typography variant="caption" color={colors.gray[400]}>
              {drills.length} drills · {usedCategories.length} categories
            </Typography>
          </div>
          <div style={{ display: 'flex', gap: spacing[3], alignItems: 'center' }}>
            <div style={{ width: '240px' }}>
              <Input
                icon={<Search size={16} />}
                placeholder="Search drills"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus size={16} /> New Drill
            </Button>
          </div>
        </div>

        {/* Category filter tabs */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: spacing[2],
          padding: `${spacing[3]} ${spacing[8]}`,
          borderBottom: `1px solid ${colors.gray[200]}`,
          backgroundColor: 'white', flexShrink: 0,
          overflowX: 'auto'
        }}>
          <Typography variant="label" color={colors.gray[400]} style={{ marginRight: spacing[2], whiteSpace: 'nowrap' }}>
            CATEGORY
          </Typography>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '6px 14px', borderRadius: radius.full,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap',
              backgroundColor: selectedCategory === 'all' ? colors.primary : 'transparent',
              color: selectedCategory === 'all' ? 'white' : colors.gray[600]
            }}
          >
            All
          </button>
          {usedCategories.map(cat => (
            <div key={cat.drill_category_id} style={{ display: 'flex', alignItems: 'center', gap: '2px', position: 'relative' }}>
              <button
                onClick={() => setSelectedCategory(cat.drill_category_id)}
                style={{
                  padding: '6px 14px', borderRadius: radius.full,
                  border: `1px solid ${selectedCategory === cat.drill_category_id ? colors.primary : colors.gray[200]}`,
                  cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap',
                  backgroundColor: selectedCategory === cat.drill_category_id ? colors.primaryLight : 'white',
                  color: selectedCategory === cat.drill_category_id ? colors.primary : colors.gray[600]
                }}
              >
                {cat.name} {drills.filter(d => d.categories?.some(c => c.drill_category_id === cat.drill_category_id)).length}
              </button>

              {cat.coach_id && (
                deletingCategoryId === cat.drill_category_id ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: spacing[1],
                    backgroundColor: 'white', border: `1px solid ${colors.gray[200]}`,
                    borderRadius: radius.lg, padding: '3px 8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <Typography variant="caption" color={colors.gray[500]}>Delete?</Typography>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
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
                      onClick={() => setDeletingCategoryId(null)}
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
                    onClick={() => setDeletingCategoryId(cat.drill_category_id)}
                    style={{
                      border: 'none', background: 'none', cursor: 'pointer',
                      padding: '2px', display: 'flex', alignItems: 'center'
                    }}
                  >
                    <X size={12} color={colors.gray[400]} />
                  </button>
                )
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: spacing[8], backgroundColor: colors.gray[50] }}>
          {grouped.map(group => (
            <div key={group.drill_category_id} style={{ marginBottom: spacing[8] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
                <Target size={16} color={colors.primary} />
                <Typography variant="h4">{group.name}</Typography>
                <Typography variant="caption" color={colors.gray[400]}>{group.drills.length} drills</Typography>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing[4] }}>
                {group.drills.map(drill => (
                  <div
                    key={drill.drill_id}
                    onClick={() => setSelectedDrill(drill)}
                    style={{
                      backgroundColor: 'white', borderRadius: radius.xl,
                      padding: spacing[5], border: `1px solid ${colors.gray[200]}`,
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = colors.primary}
                    onMouseLeave={e => e.currentTarget.style.borderColor = colors.gray[200]}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[2] }}>
                      <Typography variant="body" style={{ fontWeight: '600' }}>{drill.name}</Typography>
                      <DrillMenu
                        drill={drill}
                        onEdit={() => setSelectedDrill(drill)}
                        onDelete={() => handleDelete(drill)}
                        onRemove={async () => {
                          await removeDrillFromLibrary(drill.drill_id)
                          setDrills(prev => prev.filter(d => d.drill_id !== drill.drill_id))
                        }}
                        onShare={() => {
                          const url = `${window.location.origin}/drills/share/${drill.share_token}`
                          navigator.clipboard.writeText(url)
                          alert('Share link copied!')
                        }}
                      />
                    </div>
                    <Typography variant="caption" color={colors.gray[500]} style={{ display: 'block', marginBottom: spacing[3] }}>
                      {drill.description}
                    </Typography>
                    <div style={{ display: 'flex', gap: spacing[2], flexWrap: 'wrap' }}>
                      {drill.categories?.map(cat => (
                        <span key={cat.drill_category_id} style={{
                          fontSize: '11px', fontWeight: '500',
                          backgroundColor: colors.gray[100], color: colors.gray[600],
                          padding: '3px 10px', borderRadius: radius.full
                        }}>
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                <div
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    borderRadius: radius.xl, padding: spacing[5],
                    border: `1.5px dashed ${colors.gray[200]}`, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing[2]
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = colors.primary}
                  onMouseLeave={e => e.currentTarget.style.borderColor = colors.gray[200]}
                >
                  <Plus size={16} color={colors.primary} />
                  <Typography variant="bodySmall" style={{ color: colors.primary, fontWeight: '600' }}>
                    New drill in {group.name}
                  </Typography>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: spacing[16] }}>
              <Typography variant="bodySmall" color={colors.gray[400]}>No drills found</Typography>
            </div>
          )}
        </div>

      </div>

      {showCreateModal && (
        <CreateDrillModal
          categories={categories}
          onClose={() => setShowCreateModal(false)}
          onCreated={drill => {
            setDrills(prev => [...prev, drill])
            getDrillCategories().then(res => setCategories(res.data))
            setShowCreateModal(false)
          }}
          onCategoryCreated={cat => {
            if (cat) setCategories(prev => [...prev, cat])
            else getDrillCategories().then(res => { setCategories(res.data); setSelectedCategory('all') })
          }}
        />
      )}

      {selectedDrill && (
        <DrillDetailPanel
          drill={selectedDrill}
          onClose={() => setSelectedDrill(null)}
          onUpdated={updated => {
            setDrills(prev => prev.map(d => d.drill_id === updated.drill_id ? updated : d))
            setSelectedDrill(updated)
          }}
          onDeleted={id => {
            setDrills(prev => prev.filter(d => d.drill_id !== id))
            setSelectedDrill(null)
          }}
        />
      )}

    </Layout>
  )
}

export default Drills