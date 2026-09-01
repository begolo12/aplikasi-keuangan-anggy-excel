import { useState } from 'react'
import { formatRibuan } from './format'

export interface MonthBarData {
  month: string
  income: number
  expense: number
}

interface BarChartProps {
  data: MonthBarData[]
  height?: number
}

export function BarChart({ data, height = 220 }: BarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const maxVal = Math.max(
    ...data.flatMap((d) => [d.income, d.expense]),
    1000000 // minimum ceiling
  )

  const paddingBottom = 28
  const paddingTop = 20
  const chartHeight = height - paddingBottom - paddingTop
  const barWidth = 8
  const gap = 3
  const groupWidth = barWidth * 2 + gap

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium text-[#137333]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#137333]" />
            <span>Pemasukan</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-[#c5221f]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c5221f]" />
            <span>Pengeluaran</span>
          </div>
        </div>
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="text-[11px] font-medium text-[#1f1f1f] bg-[#e8f0fe] px-2.5 py-0.5 rounded-full num">
            {data[hoveredIdx].month}: In Rp {formatRibuan(data[hoveredIdx].income)} | Out Rp {formatRibuan(data[hoveredIdx].expense)}
          </div>
        )}
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 600 ${height}`}
          className="w-full h-auto min-w-[480px]"
          preserveAspectRatio="none"
        >
          {/* Horizontal Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + chartHeight * (1 - ratio)
            return (
              <g key={ratio}>
                <line
                  x1="0"
                  y1={y}
                  x2="600"
                  y2={y}
                  stroke="#e2ece5"
                  strokeDasharray={ratio === 0 ? undefined : '3 3'}
                  strokeWidth="1"
                />
              </g>
            )
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const step = 600 / data.length
            const groupX = i * step + (step - groupWidth) / 2

            const inH = Math.max(2, (d.income / maxVal) * chartHeight)
            const inY = paddingTop + chartHeight - inH

            const exH = Math.max(2, (d.expense / maxVal) * chartHeight)
            const exY = paddingTop + chartHeight - exH

            const isHovered = hoveredIdx === i

            return (
              <g
                key={d.month}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-opacity"
                opacity={hoveredIdx === null || isHovered ? 1 : 0.45}
              >
                {/* Background hover pill */}
                {isHovered && (
                  <rect
                    x={groupX - 6}
                    y={paddingTop}
                    width={groupWidth + 12}
                    height={chartHeight}
                    fill="#e8f0fe"
                    rx="8"
                  />
                )}

                {/* Income bar */}
                <rect
                  x={groupX}
                  y={inY}
                  width={barWidth}
                  height={inH}
                  fill="#137333"
                  rx="3"
                />

                {/* Expense bar */}
                <rect
                  x={groupX + barWidth + gap}
                  y={exY}
                  width={barWidth}
                  height={exH}
                  fill="#c5221f"
                  rx="3"
                />

                {/* Month label */}
                <text
                  x={groupX + groupWidth / 2}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight={isHovered ? '600' : '400'}
                  fill={isHovered ? '#1f1f1f' : '#747775'}
                >
                  {d.month.slice(0, 3)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export interface CategoryDonutData {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  data: CategoryDonutData[]
  size?: number
}

export function DonutChart({ data, size = 160 }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-xs font-semibold">
        <p>Belum ada data pengeluaran.</p>
        <span className="text-[11px] text-slate-400 font-normal mt-0.5">Catatan belanja akan otomatis dirinci di sini.</span>
      </div>
    )
  }

  const radius = 55
  const strokeWidth = 18
  const center = size / 2

  const slices: Array<CategoryDonutData & { fraction: number; pathData: string }> = []
  let runningAngle = 0
  for (const d of data) {
    const fraction = d.value / total
    const angle = fraction * 360
    const startAngle = runningAngle
    runningAngle += angle

    // SVG arc calculation
    const startRad = ((startAngle - 90) * Math.PI) / 180
    const endRad = ((startAngle + angle - 90) * Math.PI) / 180

    const x1 = center + radius * Math.cos(startRad)
    const y1 = center + radius * Math.sin(startRad)
    const x2 = center + radius * Math.cos(endRad)
    const y2 = center + radius * Math.sin(endRad)

    const largeArcFlag = angle > 180 ? 1 : 0
    const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`

    slices.push({ ...d, fraction, pathData })
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((slice, i) => (
            <path
              key={i}
              d={slice.pathData}
              fill="none"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</span>
          <span className="text-xs font-black text-slate-900 num">Rp {formatRibuan(total)}</span>
        </div>
      </div>

      <div className="flex-1 space-y-1.5 w-full">
        {data.slice(0, 5).map((d, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="font-semibold text-slate-700 truncate">{d.label}</span>
            </div>
            <span className="font-bold text-slate-900 num shrink-0">
              {((d.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
