import { formatCount, formatPercent } from '../../utils/habitUtils'

function getProgressHeatStyle(percent) {
  const rate = Math.max(0, Math.min(100, Number(percent) || 0))

  if (rate === 0) {
    return {
      '--progress-alpha': '0.04',
      '--progress-glow': '0',
      '--progress-start': 'var(--color-accent-soft)',
      '--progress-end': 'transparent',
    }
  }

  if (rate <= 25) {
    return {
      '--progress-alpha': '0.3',
      '--progress-glow': '0.08',
      '--progress-start': 'color-mix(in srgb, var(--color-accent) 42%, var(--color-accent-soft))',
      '--progress-end': 'var(--color-accent-soft)',
    }
  }

  if (rate <= 50) {
    return {
      '--progress-alpha': '0.5',
      '--progress-glow': '0.12',
      '--progress-start': 'color-mix(in srgb, var(--color-accent) 58%, var(--color-accent-soft))',
      '--progress-end': 'color-mix(in srgb, var(--color-accent) 36%, var(--color-accent-soft))',
    }
  }

  if (rate <= 75) {
    return {
      '--progress-alpha': '0.72',
      '--progress-glow': '0.18',
      '--progress-start': 'color-mix(in srgb, var(--color-accent) 76%, var(--color-text))',
      '--progress-end': 'color-mix(in srgb, var(--color-accent) 48%, var(--color-accent-soft))',
    }
  }

  return {
    '--progress-alpha': '1',
    '--progress-glow': rate >= 100 ? '0.34' : '0.24',
    '--progress-start': rate >= 100 ? 'color-mix(in srgb, var(--color-accent) 82%, var(--color-text))' : 'var(--color-accent)',
    '--progress-end': 'color-mix(in srgb, var(--color-accent) 64%, var(--color-accent-soft))',
  }
}

export default function OverallProgressPanel({ rows = [] }) {
  return (
    <section className="dash-panel stat-panel stat-panel--overall">
      <div className="dash-panel__head stat-panel__head">
        <div>
          <span className="dash-label">Overall Progress</span>
          <strong>OVERALL PROGRESS</strong>
        </div>
      </div>

      <div className="overall-progress-table">
        <div className="overall-progress-table__head">
          <span>DONE</span>
          <span>LEFT</span>
          <span>%</span>
          <span>BAR</span>
        </div>

        {rows.length === 0 ? <div className="dashboard-empty">No progress data</div> : rows.map((row) => (
          <div key={row.id} className={`overall-progress-row ${row.percent >= 100 ? 'overall-progress-row--complete' : ''}`}>
            <span className="good">{formatCount(row.done)}</span>
            <span className={row.left === 0 ? 'good' : 'bad'}>{formatCount(row.left)}</span>
            <span className="overall-percent">{formatPercent(row.percent)}</span>
            <i><b style={{ width: formatPercent(row.percent), ...getProgressHeatStyle(row.percent) }} /></i>
          </div>
        ))}
      </div>
    </section>
  )
}
