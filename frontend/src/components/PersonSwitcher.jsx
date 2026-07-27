import { colors, radius } from '../styles/tokens'

function PersonSwitcher({ people, selectedId, onSelect }) {
  return (
    <div style={{
      display: 'inline-flex',
      backgroundColor: colors.gray[100],
      borderRadius: radius.full,
      padding: '4px',
      gap: '2px'
    }}>
      {people.map(p => {
        const active = selectedId === p.id
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            style={{
              padding: '6px 16px',
              border: 'none',
              borderRadius: radius.full,
              backgroundColor: active ? colors.black : 'transparent',
              color: active ? 'white' : colors.gray[600],
              fontWeight: active ? '600' : '500',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s'
            }}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}

export default PersonSwitcher
