import { colors } from '../styles/tokens'

function TextLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        color: colors.primary,
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: 'inherit',
        fontFamily: 'inherit',
        padding: 0
      }}
    >
      {children}
    </button>
  )
}

export default TextLink