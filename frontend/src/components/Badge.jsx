function Badge({ label, variant = 'default' }) {
  const variants = {
    default: { backgroundColor: '#f3f4f6', color: '#374151' },
    private: { backgroundColor: '#f3f4f6', color: '#374151' },
    group: { backgroundColor: '#eff6ff', color: '#2563eb' },
    beginner: { backgroundColor: '#f0fdf4', color: '#16a34a' },
    intermediate: { backgroundColor: '#fefce8', color: '#ca8a04' },
    advanced: { backgroundColor: '#fef2f2', color: '#dc2626' },
    kids: { backgroundColor: '#f0f9ff', color: '#0284c7' },
    adults: { backgroundColor: '#f5f3ff', color: '#7c3aed' },
    veterans: { backgroundColor: '#fff7ed', color: '#c2410c' }
  }

  const style = variants[variant?.toLowerCase()] || variants.default

  return (
    <span style={{
      ...style,
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      whiteSpace: 'nowrap'
    }}>
      {label}
    </span>
  )
}

export default Badge