import { colors, radius, spacing } from '../styles/tokens'
import Typography from './Typography'
import Card from './Card'

function StatCard({ label, value, icon }) {
  return (
    <Card>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <Typography variant="h2" mb={spacing[1]}>{value}</Typography>
          <Typography variant="bodySmall">{label}</Typography>
        </div>
        <span style={{ fontSize: '22px', color: colors.primary }}>{icon}</span>
      </div>
    </Card>
  )
}

export default StatCard