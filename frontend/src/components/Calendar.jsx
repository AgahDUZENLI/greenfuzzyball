import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'

function Calendar({ sessions = [], selectedDate, onDayClick }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  // Sessions grouped by date
  const sessionsByDate = {}
  sessions.forEach(s => {
    if (!sessionsByDate[s.date]) sessionsByDate[s.date] = 0
    sessionsByDate[s.date]++
  })

  const sessionsThisMonth = sessions.filter(s => {
    const d = new Date(s.date)
    return d.getMonth() === month && d.getFullYear() === year
  })

  // Build calendar grid
  const calendarDays = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: radius['2xl'],
      border: `1px solid ${colors.gray[200]}`,
      padding: spacing[6]
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[5]
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <Typography variant="h3">{monthName}</Typography>
          <span style={{
            backgroundColor: colors.primaryLight,
            color: colors.primary,
            padding: '4px 12px',
            borderRadius: radius.full,
            fontSize: '13px',
            fontWeight: '600'
          }}>
            {sessionsThisMonth.length} sessions
          </span>
        </div>
        <div style={{ display: 'flex', gap: spacing[2] }}>
          <button
            onClick={prevMonth}
            style={{
              width: '32px', height: '32px',
              border: `1px solid ${colors.gray[200]}`,
              borderRadius: radius.md,
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <ChevronLeft size={16} color={colors.gray[600]} />
          </button>
          <button
            onClick={nextMonth}
            style={{
              width: '32px', height: '32px',
              border: `1px solid ${colors.gray[200]}`,
              borderRadius: radius.md,
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <ChevronRight size={16} color={colors.gray[600]} />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        marginBottom: spacing[2]
      }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} style={{
            textAlign: 'center',
            fontSize: '13px',
            color: colors.gray[400],
            fontWeight: '500',
            padding: `${spacing[2]} 0`
          }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px'
      }}>
        {calendarDays.map((day, i) => {
          if (!day) return <div key={i} />

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const hasSession = !!sessionsByDate[dateStr]
          const sessionCount = sessionsByDate[dateStr] || 0
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate

          let backgroundColor = 'transparent'
          let textColor = colors.gray[700]
          let dotColor = colors.primary

          if (isToday && isSelected) {
            backgroundColor = colors.primary
            textColor = 'white'
            dotColor = 'white'
          } else if (isToday) {
            backgroundColor = colors.primary
            textColor = 'white'
            dotColor = 'white'
          } else if (isSelected) {
            backgroundColor = colors.primaryLight
            textColor = colors.primary
            dotColor = colors.primary
          }

          return (
            <div
              key={i}
              onClick={() => onDayClick && onDayClick(dateStr)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 4px',
                borderRadius: radius.lg,
                backgroundColor,
                cursor: 'pointer',
                minHeight: '48px',
                transition: 'background-color 0.15s',
                position: 'relative'
              }}
            >
              <span style={{
                fontSize: '14px',
                fontWeight: isToday || isSelected ? '700' : '400',
                color: textColor
              }}>
                {day}
              </span>
              {hasSession && (
                <div style={{
                  display: 'flex',
                  gap: '3px',
                  marginTop: '3px'
                }}>
                  {[...Array(Math.min(sessionCount, 3))].map((_, j) => (
                    <div
                      key={j}
                      style={{
                        width: '5px', height: '5px',
                        borderRadius: '50%',
                        backgroundColor: dotColor
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar