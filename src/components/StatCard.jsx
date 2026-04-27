export default function StatCard({ label, value, helper, className = '' }) {
  return (
    <article className={`stat-tile ${className}`.trim()}>
      <span>{label}</span>
      <strong>{value}</strong>
      {helper ? <small>{helper}</small> : null}
    </article>
  )
}
