'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface ClassificationPieProps {
  data?: any[]
}

const COLORS = ['#16a34a', '#eab308', '#f97316', '#dc2626']

export default function ClassificationPie({ data }: ClassificationPieProps) {
  // Default data jika tidak ada data dari props
  const defaultData = [
    { name: 'Grade A', value: 124, percentage: '40.5' },
    { name: 'Grade B', value: 98, percentage: '32.0' },
    { name: 'Grade C', value: 56, percentage: '18.3' },
    { name: 'Tidak Layak', value: 22, percentage: '7.2' },
  ]

  const pieData = data && data.length > 0 ? data : defaultData
  const totalValue = pieData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={140}
            paddingAngle={2}
            dataKey="value"
            label={({ percentage }) => `${percentage}%`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <div className="text-3xl font-bold text-gray-800">{totalValue}</div>
        <div className="text-xs text-gray-500">Total</div>
      </div> */}

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {pieData.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded`} style={{ backgroundColor: COLORS[index] }}></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">{item.name}</div>
              <div className="text-xs text-gray-500">{item.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}