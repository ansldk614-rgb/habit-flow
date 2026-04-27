import { formatCount, formatPercent } from '../../utils/habitUtils'

export default function OverallProgressPanel({ rows }) {
  return (
    <section className="dash-panel">
      <div className="dash-panel__head">
        <div>
          <span className="dash-label">Overall Progress</span>
          <strong>습관별 진행률</strong>
        </div>
      </div>
      <div className="overall-progress-table">
        <div className="overall-progress-table__head">
          <span>Done</span>
          <span>Left</span>
          <span>%</span>
          <span>Bar</span>
        </div>
        {rows.length === 0 ? <div className="dashboard-empty">진행 데이터가 없어요.</div> : rows.map((row) => (
          <div key={row.id} className="overall-progress-row">
            <span className="good">{formatCount(row.done)}</span>
            <span className="bad">{formatCount(row.left)}</span>
            <span>{formatPercent(row.percent)}</span>
            <i><b style={{ width: formatPercent(row.percent) }} /></i>
          </div>
        ))}
      </div>
    </section>
  )
}
