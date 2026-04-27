export default function DashboardShell({ leftPanel, mainPanel, rightPanel }) {
  return (
    <section className="monthly-dashboard">
      <aside className="monthly-dashboard__left">{leftPanel}</aside>
      <div className="monthly-dashboard__main">{mainPanel}</div>
      <aside className="monthly-dashboard__right">{rightPanel}</aside>
    </section>
  )
}
