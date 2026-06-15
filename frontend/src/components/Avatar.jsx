function Avatar({ name, size = 'md' }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const sizes = {
    sm: { width: '32px', height: '32px', fontSize: '12px' },
    md: { width: '40px', height: '40px', fontSize: '14px' },
    lg: { width: '48px', height: '48px', fontSize: '18px' }
  }

  return (
    <div style={{
      ...sizes[size],
      backgroundColor: '#16a34a',
      color: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      flexShrink: 0,
      fontFamily: 'inherit'
    }}>
      {initials}
    </div>
  )
}

export default Avatar