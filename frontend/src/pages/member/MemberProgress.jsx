import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Layout from '../../components/Layout'
import Card from '../../components/Card'
import Typography from '../../components/Typography'
import { colors, spacing, radius } from '../../styles/tokens'
import { getMemberProgress } from '../../services/api'
import useIsMobile from '../../hooks/useIsMobile'

const CHART_COLORS = [colors.primary, '#9ca3af', '#3b82f6', '#f59e0b']

function MemberProgress() {
  const isMobile = useIsMobile()

  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMemberProgress()
      .then(res => setProgress(res.data))
      .catch(err => console.error('Member progress fetch error:', err))
      .finally(() => setLoading(false))
  }, [])

  const drillNames = [...new Set(progress.map(p => p.drill_name))]
  const chartData = Object.values(
    progress.reduce((acc, p) => {
      if (!acc[p.date]) acc[p.date] = { date: p.date }
      acc[p.date][p.drill_name] = parseFloat(p.rolling_avg)
      return acc
    }, {})
  ).sort((a, b) => a.date.localeCompare(b.date))

  if (loading) {
    return (
      <Layout>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', height: '100%'
        }}>
          <Typography variant="bodySmall" color={colors.gray[400]}>Loading...</Typography>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{
        padding: isMobile ? spacing[4] : spacing[8],
        overflowY: 'auto',
        height: '100%'
      }}>
        <Typography variant="h2" mb={spacing[6]}>Progress</Typography>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[5] }}>
            <Typography variant="h4">Rating over time</Typography>
            <div style={{ display: 'flex', gap: spacing[4], flexWrap: 'wrap' }}>
              {drillNames.slice(0, 4).map((name, i) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <div style={{ width: '20px', height: '2px', backgroundColor: CHART_COLORS[i], borderRadius: '1px' }} />
                  <Typography variant="caption" color={colors.gray[500]}>{name}</Typography>
                </div>
              ))}
            </div>
          </div>

          {chartData.length === 0 ? (
            <div style={{ padding: spacing[8], textAlign: 'center' }}>
              <Typography variant="bodySmall" color={colors.gray[400]}>No progress data yet</Typography>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tickFormatter={d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  tick={{ fontSize: 12, fill: colors.gray[400] }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fontSize: 12, fill: colors.gray[400] }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip contentStyle={{ borderRadius: radius.lg, border: `1px solid ${colors.gray[200]}`, fontSize: '13px' }} />
                {drillNames.slice(0, 4).map((name, i) => (
                  <Area
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={CHART_COLORS[i]}
                    fill={i === 0 ? `${colors.primary}15` : 'transparent'}
                    strokeWidth={2}
                    strokeDasharray={i > 0 ? '4 4' : undefined}
                    dot={{ r: 4, fill: CHART_COLORS[i], strokeWidth: 0 }}
                    connectNulls
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </Layout>
  )
}

export default MemberProgress
