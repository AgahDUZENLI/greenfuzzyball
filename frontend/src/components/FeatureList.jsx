import { colors, radius, spacing } from '../styles/tokens'
import Typography from './Typography'

function FeatureList({ heading, features }) {
  return (
    <>
      <Typography variant="h1" color={colors.white} mb={spacing[8]}>
        {heading}
      </Typography>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
            <div style={{
              width: '22px', height: '22px',
              backgroundColor: colors.primary,
              borderRadius: radius.full,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px', flexShrink: 0
            }}>✓</div>
            <Typography variant="body" color={colors.gray[300]}>{f}</Typography>
          </div>
        ))}
      </div>
    </>
  )
}

export default FeatureList