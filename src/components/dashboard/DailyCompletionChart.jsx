import { useState } from 'react'
import { buildTrendPath, formatCount, formatPercent, safePercent } from '../../utils/habitUtils'

const longDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  weekday: 'long',
})

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

function getRelativeLabel(dateKey) {
  if (!dateKey) {
    return ''
  }

  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  const diffDays = Math.round((today.getTime() - date.getTime()) / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays > 1) return `${diffDays} days ago`
  return ''
}

function getTooltipStyle(point, width, height) {
  const leftPercent = (point.x / width) * 100
  const topPercent = (point.y / height) * 100
  const isRightSide = leftPercent > 72
  const isTopSide = topPercent < 28

  return {
    left: `${leftPercent}%`,
    top: `${topPercent}%`,
    transform: `translate(${isRightSide ? '-100%' : '-50%'}, ${isTopSide ? '18px' : 'calc(-100% - 18px)'})`,
  }
}

function getHeatStyle(rate) {
  const percent = safePercent(rate)

  if (percent === 0) {
    return {
      '--point-fill': 'var(--color-muted)',
      '--point-opacity': '0.28',
      '--point-glow': '0',
    }
  }

  if (percent <= 25) {
    return {
      '--point-fill': 'color-mix(in srgb, var(--color-accent) 36%, var(--color-accent-soft))',
      '--point-opacity': '0.56',
      '--point-glow': '0.08',
    }
  }

  if (percent <= 50) {
    return {
      '--point-fill': 'color-mix(in srgb, var(--color-accent) 56%, var(--color-accent-soft))',
      '--point-opacity': '0.7',
      '--point-glow': '0.14',
    }
  }

  if (percent <= 75) {
    return {
      '--point-fill': 'color-mix(in srgb, var(--color-accent) 74%, var(--color-text))',
      '--point-opacity': '0.84',
      '--point-glow': '0.2',
    }
  }

  return {
    '--point-fill': percent >= 100 ? 'color-mix(in srgb, var(--color-accent) 82%, var(--color-text))' : 'var(--color-accent)',
    '--point-opacity': '1',
    '--point-glow': percent >= 100 ? '0.36' : '0.26',
  }
}

function getPointKey(point) {
  return point.dateKey ?? point.date
}

export default function DailyCompletionChart({ chartData = [], caption = '' }) {
  const [hoveredPoint, setHoveredPoint] = useState(null)
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
          <strong>Recent daily completion</strong>
          {caption ? <small className="dash-panel__caption">{caption}</small> : null}
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
              <div className="dashboard-chart__viewport" onMouseLeave={() => setHoveredPoint(null)}>
                <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Recent daily completion chart">
                <title>Recent daily completion rate</title>
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
                  <g
                    key={getPointKey(point)}
                    onMouseEnter={() => setHoveredPoint(point)}
                    onFocus={() => setHoveredPoint(point)}
                    onBlur={() => setHoveredPoint(null)}
                  >
                    <rect
                      x={Math.max(0, point.x - 12)}
                      y="0"
                      width="24"
                      height={height}
                      className="dashboard-chart__hit-area"
                      tabIndex="0"
                      role="button"
                      aria-label={`${getPointKey(point)} ${formatPercent(point.rate)}`}
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={getPointKey(hoveredPoint ?? {}) === getPointKey(point) ? 6 : point.rate >= 100 ? 4 : 3}
                      className={`dashboard-chart__point ${getPointKey(hoveredPoint ?? {}) === getPointKey(point) ? 'dashboard-chart__point--active' : ''}`}
                      style={getHeatStyle(point.rate)}
                    />
                  </g>
                ))}
              </svg>
              {hoveredPoint ? (
                <div className="dashboard-chart-tooltip" style={getTooltipStyle(hoveredPoint, width, height)}>
                  <div className="dashboard-chart-tooltip__head">
                    <strong>{getPointKey(hoveredPoint)}</strong>
                    {getRelativeLabel(getPointKey(hoveredPoint)) ? <span>{getRelativeLabel(getPointKey(hoveredPoint))}</span> : null}
                  </div>
                  <span>{longDateFormatter.format(new Date(`${getPointKey(hoveredPoint)}T00:00:00`))}</span>
                  <b>Completion Rate: {formatPercent(hoveredPoint.rate)}</b>
                  <small>Done: {formatCount(hoveredPoint.done)} / {formatCount(hoveredPoint.total)}</small>
                </div>
              ) : null}
              </div>
            </div>
            <div className="dashboard-chart__labels">
              {chartData.map((item, index) => (
                <span key={getPointKey(item)} className={index % labelStep === 0 || index === chartData.length - 1 ? '' : 'is-muted'}>
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
