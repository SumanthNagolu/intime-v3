'use client'

/**
 * Engagement Chart
 *
 * Line chart showing campaign engagement metrics over time.
 * Uses recharts for rendering with custom styling.
 *
 * Features:
 * - Three lines: Opened (blue), Clicked (purple), Replied (green)
 * - Responsive container
 * - Hover tooltips
 * - Legend
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export interface EngagementDataPoint {
  week: string
  opened: number
  clicked: number
  replied: number
}

interface EngagementChartProps {
  data: EngagementDataPoint[]
  height?: number
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}) {
  if (!active || !payload) return null

  return (
    <div className="bg-white border border-charcoal-200 rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium text-charcoal-900 mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-charcoal-600 capitalize">{entry.name}</span>
            </div>
            <span className="text-sm font-medium text-charcoal-900">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Custom legend component
function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload) return null

  return (
    <div className="flex items-center justify-center gap-6 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-charcoal-600 capitalize">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function EngagementChart({ data, height = 300 }: EngagementChartProps) {
  // Default data if none provided
  const chartData = data.length > 0 ? data : [
    { week: 'Week 1', opened: 0, clicked: 0, replied: 0 },
    { week: 'Week 2', opened: 0, clicked: 0, replied: 0 },
    { week: 'Week 3', opened: 0, clicked: 0, replied: 0 },
    { week: 'Week 4', opened: 0, clicked: 0, replied: 0 },
  ]

  // Check if we have any data to show
  const hasData = chartData.some(d => d.opened > 0 || d.clicked > 0 || d.replied > 0)

  if (!hasData) {
    return (
      <div
        className="flex items-center justify-center bg-charcoal-50/50 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-charcoal-400 text-sm">No engagement data yet</p>
          <p className="text-charcoal-300 text-xs mt-1">Data will appear once the campaign is active</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 12, fill: '#737373' }}
          axisLine={{ stroke: '#e5e5e5' }}
          tickLine={{ stroke: '#e5e5e5' }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#737373' }}
          axisLine={{ stroke: '#e5e5e5' }}
          tickLine={{ stroke: '#e5e5e5' }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
        <Line
          type="monotone"
          dataKey="opened"
          name="Opened"
          stroke="#3B82F6" // blue-500
          strokeWidth={2}
          dot={{ fill: '#3B82F6', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: '#3B82F6' }}
        />
        <Line
          type="monotone"
          dataKey="clicked"
          name="Clicked"
          stroke="#8B5CF6" // purple-500
          strokeWidth={2}
          dot={{ fill: '#8B5CF6', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: '#8B5CF6' }}
        />
        <Line
          type="monotone"
          dataKey="replied"
          name="Replied"
          stroke="#22C55E" // green-500
          strokeWidth={2}
          dot={{ fill: '#22C55E', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: '#22C55E' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Export type for external use
export type { EngagementChartProps }
