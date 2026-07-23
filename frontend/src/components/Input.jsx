import { useState } from 'react'
import { colors, radius, spacing } from '../styles/tokens'

function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  rightIcon,
  onRightIconDown,
  onRightIconUp,
  required = false,
  disabled = false
}) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      minWidth: 0,
      boxSizing: 'border-box',
      border: `1.5px solid ${focused ? colors.primary : colors.gray[200]}`,
      borderRadius: radius.lg,
      padding: `${spacing[3]} ${spacing[4]}`,
      gap: spacing[3],
      backgroundColor: disabled ? colors.gray[50] : colors.white,
      boxShadow: focused ? `0 0 0 3px ${colors.primary}25` : 'none',
      transition: 'border-color 0.15s, box-shadow 0.15s'
    }}>
      {icon && (
        <span style={{
          color: focused ? colors.primary : colors.gray[400],
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.15s'
        }}>
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          border: 'none',
          outline: 'none',
          flex: 1,
          minWidth: 0,
          fontSize: '15px',
          backgroundColor: 'transparent',
          color: colors.black,
          fontFamily: 'inherit'
        }}
      />
      {rightIcon && (
        <span
          onPointerDown={(e) => {
            e.preventDefault()
            onRightIconDown && onRightIconDown()
          }}
          onPointerUp={() => onRightIconUp && onRightIconUp()}
          onPointerLeave={() => onRightIconUp && onRightIconUp()}
          style={{
            cursor: 'pointer',
            color: colors.gray[400],
            display: 'flex',
            alignItems: 'center',
            userSelect: 'none'
          }}
        >
          {rightIcon}
        </span>
      )}
    </div>
  )
}

export default Input