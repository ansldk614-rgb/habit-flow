import { buildTrendPath, formatPercent } from '../../utils/habitUtils'

export default function DailyCompletionChart({ chartData }) {
  const width = 720
  const height = 150
  const path = buildTrendPath(chartData, width, height)
  const latestRate = chartData.at(-1)?.rate ?? 0

  return (
    <section className="dash-panel dash-panel--chart">
      <div className="dash-panel__head">
        <div>
          <span className="dash-label">Daily Completion Rate</span>
          <strong>날짜별 완료율 흐름</strong>
        </div>
        <b>{formatPercent(latestRate)}</b>
      </div>

      <div className="dashboard-chart">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="월간 완료율 차트">
          {[0, 25, 50, 75, 100].map((value) => {
            const y = height - (value / 100) * height
            return <line key={value} x1="0" x2={width} y1={y} y2={y} className="dashboard-chart__grid" />
          })}
          <path d={path} className="dashboard-chart__line" />
        </svg>
        <div className="dashboard-chart__labels">
          {chartData.filter((_, index) => index % 3 === 0).map((item) => <span key={item.date}>{item.day}</span>)}
        </div>
      </div>
    </section>
  )
}
