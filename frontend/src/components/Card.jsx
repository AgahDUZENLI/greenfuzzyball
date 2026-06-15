function Card({ children, onClick, style = {} }) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s',
        ...style
      }}
    >
      {children}
    </div>
  )
}

export default Card