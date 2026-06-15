import { colors, radius, spacing } from '../styles/tokens'

function TabToggle({ options, active, onChange }) {
  return (
    <div style={{
      display: 'flex',
      backgroundColor: colors.gray[100],
      borderRadius: radius.xl,
      padding: '4px',
    }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1,
            padding: spacing[2],
            border: 'none',
            borderRadius: radius.lg,
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[2],
            backgroundColor: active === opt.value ? colors.white : 'transparent',
            color: active === opt.value ? colors.primary : colors.gray[500],
            boxShadow: active === opt.value
              ? `0 0 0 1.5px ${colors.primary}, 0 0 0 4px ${colors.primary}20`
              : 'none',
            transition: 'all 0.2s'
          }}
        >
          {opt.icon} {opt.label}
        </button>
      ))}
    </div>
  )
}

export default TabToggle