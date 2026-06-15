import { colors, fonts, radius, spacing } from '../styles/tokens'

function Button({ children, variant = 'primary', size = 'md', fullWidth, disabled, onClick, type = 'button' }) {

  const sizes = {
    sm: { padding: `${spacing[2]} ${spacing[3]}`, fontSize: fonts.size.sm },
    md: { padding: `${spacing[2]} ${spacing[5]}`, fontSize: fonts.size.md },
    lg: { padding: `${spacing[3]} ${spacing[6]}`, fontSize: fonts.size.lg }
  }

  const variants = {
    primary: { backgroundColor: colors.primary, color: colors.white },
    secondary: { backgroundColor: colors.gray[100], color: colors.black },
    outline: { backgroundColor: colors.white, color: colors.black, border: `1.5px solid ${colors.gray[200]}` },
    danger: { backgroundColor: colors.errorLight, color: colors.error },
    ghost: { backgroundColor: 'transparent', color: colors.gray[500] }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
        border: 'none',
        borderRadius: radius.lg,
        fontWeight: fonts.weight.semibold,
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s',
        ...sizes[size],
        ...variants[variant]
      }}
    >
      {children}
    </button>
  )
}

export default Button