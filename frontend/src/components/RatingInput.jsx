import { colors, radius } from '../styles/tokens'

function RatingInput({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
        const selected = n === value
        return (
          <button
            key={n}
            onClick={() => onChange(selected ? null : n)}
            style={{
              width: '30px', height: '30px',
              borderRadius: '50%',
              border: `2px solid ${selected ? colors.primary : colors.gray[200]}`,
              backgroundColor: selected ? colors.primary : 'white',
              color: selected ? 'white' : colors.gray[500],
              cursor: 'pointer',
              fontSize: '12px', fontWeight: '700',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'inherit',
              transition: 'border-color 0.1s, background-color 0.1s'
            }}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}

export default RatingInput
