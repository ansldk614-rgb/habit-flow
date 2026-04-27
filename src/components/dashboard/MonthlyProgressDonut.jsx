import { formatCount, formatPercent } from '../../utils/habitUtils'

export default function MonthlyProgressDonut({ progress }) {
  return (
    <section className="dash-panel">
      <div className="dash-panel__head">
        <div>
          <span className="dash-label">Monthly Progress</span>
          <strong>월간 진행률</strong>
        </div>
      </div>
      <div className="monthly-donut-wrap">
        <div className="monthly-donut" style={{ background: `conic-gradient(#86ff5d ${progress.percent}%, rgba(255,255,255,0.08) 0)` }}>
          <div>
            <strong>{formatPercent(progress.percent)}</strong>
            <span>{formatCount(progress.done)}/{formatCount(progress.total)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
