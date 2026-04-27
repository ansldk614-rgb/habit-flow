import { formatCount, formatPercent } from '../../utils/habitUtils'

export default function MonthlyProgressDonut({ progress, label = 'Recent 4 Weeks', innerLabel = 'LAST 28 DAYS' }) {
  const done = progress?.done ?? 0
  const total = progress?.total ?? 0
  const left = progress?.left ?? Math.max(0, total - done)
  const percent = progress?.percent ?? 0

  return (
    <section className="dash-panel stat-panel stat-panel--donut">
      <div className="dash-panel__head stat-panel__head">
        <div>
          <span className="dash-label">{label}</span>
          <strong>{label.toUpperCase()}</strong>
        </div>
      </div>

      <div className="monthly-donut-wrap">
        <div className={`monthly-donut ${percent >= 100 ? 'monthly-donut--complete' : ''}`} style={{ background: `conic-gradient(var(--color-accent) ${percent}%, color-mix(in srgb, var(--color-text) 8%, transparent) 0)` }}>
          <div>
            <strong>{formatPercent(percent)}</strong>
            <span>{innerLabel}</span>
          </div>
        </div>
      </div>

      <div className="monthly-donut-meta">
        <span><b>{formatCount(done)}</b> Done</span>
        <span className={left === 0 ? 'is-clear' : ''}><b>{formatCount(left)}</b> Left</span>
      </div>
    </section>
  )
}
