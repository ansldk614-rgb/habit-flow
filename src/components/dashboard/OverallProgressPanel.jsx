import { formatCount, formatPercent } from '../../utils/habitUtils'

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
            <i><b style={{ width: formatPercent(row.percent) }} /></i>
          </div>
        ))}
      </div>
    </section>
  )
}
