import { colors, spacing } from '../styles/tokens'
import Typography from './Typography'
import Button from './Button'

function EmptyState({ icon = '📭', message, action, onAction }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: `${spacing[12]} ${spacing[6]}`,
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '48px', marginBottom: spacing[4] }}>{icon}</div>
      <Typography variant="h4" mb={spacing[2]}>{message}</Typography>
      {action && (
        <Button onClick={onAction} style={{ marginTop: spacing[4] }}>
          {action}
        </Button>
      )}
    </div>
  )
}

export default EmptyState