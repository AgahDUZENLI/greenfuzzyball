import { spacing } from '../styles/tokens'
import Typography from './Typography'

function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[8],
      paddingBottom: spacing[6],
      borderBottom: '1px solid #e5e7eb'
    }}>
      <div>
        <Typography variant="h2">{title}</Typography>
        {subtitle && (
          <Typography variant="bodySmall" style={{ marginTop: spacing[1] }}>
            {subtitle}
          </Typography>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export default PageHeader