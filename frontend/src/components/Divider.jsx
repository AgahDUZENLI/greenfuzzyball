import { colors, spacing } from '../styles/tokens'
import Typography from './Typography'

function Divider({ label }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
      margin: `${spacing[5]} 0`
    }}>
      <div style={{ flex: 1, height: '1px', backgroundColor: colors.gray[200] }} />
      {label && <Typography variant="caption">{label}</Typography>}
      <div style={{ flex: 1, height: '1px', backgroundColor: colors.gray[200] }} />
    </div>
  )
}

export default Divider