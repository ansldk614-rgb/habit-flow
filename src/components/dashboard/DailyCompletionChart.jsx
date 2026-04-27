import { buildTrendPath, formatCount, formatPercent, safePercent } from '../../utils/habitUtils'

function getAverageRate(chartData) {
  if (!chartData.length) {
    return 0
  }

  const total = chartData.reduce((sum, item) => sum + safePercent(item.rate), 0)
  return safePercent(total / chartData.length)
}

function getPointCoordinates(chartData, width, height) {
  if (chartData.length === 0) {
    return []
  }

  const stepX = chartData.length === 1 ? 0 : width / (chartData.length - 1)

  return chartData.map((item, index) => ({
    ...item,
    x: index * stepX,
    y: height - (safePercent(item.rate) / 100) * height,
  }))
}

export default function DailyCompletionChart({ chartData = [] }) {
  const width = 760
  const height = 164
  const averageRate = getAverageRate(chartData)
  const latestRate = chartData.at(-1)?.rate ?? 0
  const points = getPointCoordinates(chartData, width, height)
  const path = buildTrendPath(chartData, width, height)
  const hasData = chartData.length > 0
  const labelStep = Math.max(1, Math.ceil(chartData.length / 12))

  return (
    <section className="dash-panel dash-panel--chart">
      <div className="dash-panel__head">
        <div>
          <span className="dash-label">Daily Completion Rate</span>
          <strong>월간 일별 완료율</strong>
        </div>
        <div className="chart-rate-summary">
          <span>AVG {formatPercent(averageRate)}</span>
          <b>{formatPercent(latestRate)}</b>
        </div>
      </div>

      <div className="dashboard-chart">
        {!hasData ? (
          <div className="dashboard-empty">No chart data</div>
        ) : (
          <>
            <div className="dashboard-chart__canvas">
              <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="월간 일별 완료율 차트">
                <title>Monthly daily completion rate</title>
                {[0, 25, 50, 75, 100].map((value) => {
                  const y = height - (value / 100) * height
                  return (
                    <g key={value}>
                      <line x1="0" x2={width} y1={y} y2={y} className="dashboard-chart__grid" />
                      <text x="0" y={Math.max(10, y - 4)} className="dashboard-chart__axis-label">{formatPercent(value)}</text>
                    </g>
                  )
                })}
                <path d={path} className="dashboard-chart__line" />
                {points.map((point) => (
                  <circle key={point.date} cx={point.x} cy={point.y} r={point.rate >= 100 ? 4 : 3} className="dashboard-chart__point">
                    <title>{`${point.date}: ${formatPercent(point.rate)}`}</title>
                  </circle>
                ))}
              </svg>
            </div>
            <div className="dashboard-chart__labels">
              {chartData.map((item, index) => (
                <span key={item.date} className={index % labelStep === 0 || index === chartData.length - 1 ? '' : 'is-muted'}>
                  {index % labelStep === 0 || index === chartData.length - 1 ? formatCount(item.day) : ''}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
