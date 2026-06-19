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
        <div style={{
          width: '40px', height: '40px',
          backgroundColor: colors.primaryLight,
          borderRadius: radius.md,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

export default StatCard