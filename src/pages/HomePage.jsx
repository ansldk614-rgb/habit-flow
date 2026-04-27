import { CalendarDays, CheckSquare, ClipboardList, SmilePlus } from 'lucide-react'
import { formatHeroDate } from '../utils/dateUtils'
import { formatEventTime } from '../utils/eventUtils'
import {
  formatCount,
  formatPercent,
  getHabitEmoji,
  getHabitDisplayName,
  getHabitGoalLabel,
  getHabitLog,
  getHabitMetrics,
  safeNumber,
  safePercent,
} from '../utils/habitUtils'
import { getPriorityLabel } from '../utils/todoUtils'

function HomeSection({ title, count, children, emptyText, defaultOpen = true }) {
  return (
    <details className="home-section-card" open={defaultOpen}>
      <summary>
        <strong>{title}</strong>
        <span>{count}개</span>
      </summary>
      <div className="home-section-card__body">
        {count === 0 ? <p className="muted-copy">{emptyText}</p> : children}
      </div>
    </details>
  )
}

export default function HomePage({ completions, todayKey, todayRate, todayHabits, today, todayEvents = [], todayTodos = [], rpgProfile }) {
  const completedHabitCount = todayHabits.filter((habit) => {
    const metrics = getHabitMetrics(habit, getHabitLog(completions, todayKey, habit))
    return metrics.progressPercent === 100
  }).length
  const completedTodoCount = todayTodos.filter((todo) => todo.isCompleted).length
  const overallTodayRate = safePercent(
    todayHabits.length + todayTodos.length === 0
      ? todayRate
      : ((todayRate * todayHabits.length) + completedTodoCount * 100) / Math.max(1, todayHabits.length + todayTodos.length),
  )
  const conditionMessage =
    safeNumber(rpgProfile?.energy) >= 80
      ? '컨디션이 좋습니다. 중요한 일부터 처리하기 좋은 날입니다.'
      : safeNumber(rpgProfile?.energy) >= 45
        ? '무난한 상태입니다. 오늘 할 일을 차분히 진행하세요.'
        : '에너지가 낮습니다. 핵심 일정과 작은 할 일부터 줄이세요.'

  return (
    <section className="planner-home">
      <div className="planner-home__header">
        <div>
          <p className="section-kicker">오늘의 플랜</p>
          <h2>{formatHeroDate(today)}</h2>
        </div>
        <span className="dashboard-home__meta">오늘 기준</span>
      </div>

      <div className="today-summary-grid">
        <article className="today-summary-card">
          <CalendarDays size={18} />
          <span>일정</span>
          <strong>{formatCount(todayEvents.length)}</strong>
        </article>
        <article className="today-summary-card">
          <CheckSquare size={18} />
          <span>할 일</span>
          <strong>{formatCount(todayTodos.length)}</strong>
        </article>
        <article className="today-summary-card">
          <ClipboardList size={18} />
          <span>완료 습관</span>
          <strong>{formatCount(completedHabitCount)}/{formatCount(todayHabits.length)}</strong>
        </article>
        <article className="today-summary-card today-summary-card--rate">
          <span>전체 완료율</span>
          <strong>{formatPercent(overallTodayRate)}</strong>
          <div className="row-progress"><span style={{ width: formatPercent(overallTodayRate) }} /></div>
        </article>
      </div>

      <div className="planner-home__grid">
        <HomeSection title="오늘의 일정" count={todayEvents.length} emptyText="오늘 등록된 일정이 없어요.">
          <div className="planner-list">
            {todayEvents.map((event) => (
              <article key={event.id} className="planner-event-row">
                <span className="planner-event-row__accent" style={{ backgroundColor: event.color }} />
                <div>
                  <strong>{event.title}</strong>
                  <span>{formatEventTime(event)} · {event.category}</span>
                  {event.location ? <small>{event.location}</small> : null}
                </div>
              </article>
            ))}
          </div>
        </HomeSection>

        <HomeSection title="오늘의 할 일" count={todayTodos.length} emptyText="오늘 마감인 할 일이 없어요.">
          <div className="planner-list">
            {todayTodos.map((todo) => (
              <article key={todo.id} className={`planner-todo-row planner-todo-row--${todo.priority} ${todo.isCompleted ? 'planner-todo-row--done' : ''}`}>
                <span className="todo-summary-check">{todo.isCompleted ? '✓' : ''}</span>
                <div>
                  <strong>{todo.title}</strong>
                  <span>{getPriorityLabel(todo.priority)} · {todo.category}</span>
                </div>
              </article>
            ))}
          </div>
        </HomeSection>

        <HomeSection title="오늘의 습관" count={todayHabits.length} emptyText="오늘 반복 요일에 해당하는 습관이 없어요." defaultOpen={false}>
          <div className="planner-list">
            {todayHabits.map((habit) => {
              const metrics = getHabitMetrics(habit, getHabitLog(completions, todayKey, habit))
              return (
                <article key={habit.id} className="planner-habit-row">
                  <div>
                    <strong><span className="habit-emoji" aria-hidden="true">{getHabitEmoji(habit)}</span>{getHabitDisplayName(habit)}</strong>
                    <span>{getHabitGoalLabel(habit)}</span>
                  </div>
                  <span className="progress-pill">{formatPercent(metrics.progressPercent)}</span>
                </article>
              )
            })}
          </div>
        </HomeSection>

        <section className="home-section-card home-slime-card">
          <div className="home-slime-card__head">
            <div>
              <strong>슬라임 상태</strong>
              <span>{rpgProfile?.stage ?? '씨앗 슬라임'}</span>
            </div>
            <SmilePlus size={20} />
          </div>
          <div className="home-slime-card__stats">
            <span>Lv. {formatCount(rpgProfile?.level, 1)}</span>
            <span>XP {formatCount(rpgProfile?.xpCurrent)}/{formatCount(rpgProfile?.xpMax, 220)}</span>
            <span>에너지 {formatPercent(rpgProfile?.energy)}</span>
          </div>
          <p>{conditionMessage}</p>
        </section>
      </div>
    </section>
  )
}
