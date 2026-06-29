import { useState, useRef, useEffect } from 'react'
import { colors, spacing, radius } from '../styles/tokens'
import { Pencil, Trash2, MoreHorizontal, Share2 } from 'lucide-react'

function DrillMenu({ drill, onEdit, onDelete, onRemove, onShare }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const isOwner = drill.coach_id !== null

  useEffect(() => {
    const handleClick = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const menuBtn = (onClick, icon, label, danger = false) => (
    <button
      onClick={e => { e.stopPropagation(); setOpen(false); onClick() }}
      style={{
        width: '100%', padding: `${spacing[3]} ${spacing[4]}`,
        border: 'none', backgroundColor: 'transparent',
        cursor: 'pointer', fontFamily: 'inherit',
        fontSize: '14px', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: spacing[3],
        color: danger ? colors.error : colors.black
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = danger ? colors.errorLight : colors.gray[50]}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {icon} {label}
    </button>
  )

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(!open) }}
        style={{
          border: 'none', background: 'none',
          cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center'
        }}
      >
        <MoreHorizontal size={16} color={colors.gray[400]} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0,
          backgroundColor: 'white',
          border: `1px solid ${colors.gray[200]}`,
          borderRadius: radius.xl,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          zIndex: 100, minWidth: '180px',
          overflow: 'hidden'
        }}>
          {isOwner && menuBtn(onEdit, <Pencil size={14} color={colors.gray[500]} />, 'Edit drill')}
          {menuBtn(onShare, <Share2 size={14} color={colors.gray[500]} />, 'Share link')}
          {isOwner
            ? menuBtn(onDelete, <Trash2 size={14} color={colors.error} />, 'Delete permanently', true)
            : menuBtn(onRemove, <Trash2 size={14} color={colors.error} />, 'Remove from library', true)
          }
        </div>
      )}
    </div>
  )
}

export default DrillMenu