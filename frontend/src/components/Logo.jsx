import { colors, spacing, radius } from '../styles/tokens'

function Logo({ dark }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
      <img src="/logo.png" alt="Green Fuzzy Ball" style={{ width: '36px', height: '36px', borderRadius: radius.lg }} />
      <span style={{ fontWeight: '700', fontSize: '16px', color: dark ? colors.white : colors.black }}>
        Green Fuzzy Ball
      </span>
    </div>
  )
}

export default Logo
