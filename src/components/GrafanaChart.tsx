'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface GrafanaChartProps {
  data?: {
    time: string
    gradeA: number
    gradeB: number
    gradeC: number
    tidakLayak: number
  }[]
}

// Fallback data jika API belum ada data
const defaultData = [
  { time: '00:00', gradeA: 0, gradeB: 0, gradeC: 0, tidakLayak: 0 },
]

export default function GrafanaChart({ data }: GrafanaChartProps) {
  const chartData = data && data.length > 0 ? data : defaultData

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="time"
          stroke="#9ca3af"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#9ca3af"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: 'none',
            borderRadius: '8px',
            color: '#fff'
          }}
        />
        <Legend
          wrapperStyle={{
            paddingTop: '20px'
          }}
        />
        <Line
          type="monotone"
          dataKey="gradeA"
          stroke="#16a34a"
          strokeWidth={3}
          name="Grade A"
          dot={{ fill: '#16a34a', r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="gradeB"
          stroke="#eab308"
          strokeWidth={3}
          name="Grade B"
          dot={{ fill: '#eab308', r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="gradeC"
          stroke="#f97316"
          strokeWidth={3}
          name="Grade C"
          dot={{ fill: '#f97316', r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="tidakLayak"
          stroke="#dc2626"
          strokeWidth={3}
          name="Tidak Layak"
          dot={{ fill: '#dc2626', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}