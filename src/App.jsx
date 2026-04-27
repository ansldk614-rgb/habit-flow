import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { COLOR_OPTIONS, QUICK_HABITS, TABS } from './constants/habitConstants'
import { useLocalStorage } from './hooks/useLocalStorage'
import CalendarPage from './pages/CalendarPage'
import CompanionPage from './pages/CompanionPage'
import HabitsPage from './pages/HabitsPage'
import HomePage from './pages/HomePage'
import RecordsPage from './pages/RecordsPage'
import TodosPage from './pages/TodosPage'
import { enumeratePastDates, formatHeroDate, getDateKey, parseDateKey } from './utils/dateUtils'
import {
  buildCalendarDays,
  calculateDayRate,
  calculateOverallWeeklyRate,
  createId,
  getHabitLog,
  isHabitScheduledForDate,
  safeNumber,
} from './utils/habitUtils'
import { countEventsByDate, createDefaultEvent, getTodayEvents, normalizeEvent } from './utils/eventUtils'
import { calculateRpgProfile } from './utils/rpgUtils'
import { countTodosByDate, createDefaultTodo, getTodayTodos, normalizeTodo } from './utils/todoUtils'

function getQuickHabitInitialState() {
  return Object.fromEntries(QUICK_HABITS.map((habit) => [habit.id, { ...habit.defaults }]))
}

function createInitialHabitForm() {
  return {
    name: '',
    type: 'custom',
    color: COLOR_OPTIONS[0],
    emoji: '🎯',
    days: [1, 2, 3, 4, 5],
    targetTime: '07:00',
    targetVolume: 5000,
    targetMinutes: 90,
    targetPercent: 100,
  }
}

function App() {
  const [{ habits, completions, events, todos }, setState] = useLocalStorage()
  const [activeTab, setActiveTab] = useState('home')
  const [habitForm, setHabitForm] = useState(createInitialHabitForm)
  const [habitErrors, setHabitErrors] = useState({})
  const [eventErrors, setEventErrors] = useState({})
  const [todoErrors, setTodoErrors] = useState({})
  const [quickSettings, setQuickSettings] = useState(getQuickHabitInitialState)
  const [selectedDateKey, setSelectedDateKey] = useState(getDateKey())
  const [calendarAnchorDate, setCalendarAnchorDate] = useState(() => new Date())
  const [eventForm, setEventForm] = useState(() => createDefaultEvent(getDateKey()))
  const [todoForm, setTodoForm] = useState(() => createDefaultTodo(getDateKey()))

  const today = new Date()
  const todayKey = getDateKey(today)
  const selectedDate = parseDateKey(selectedDateKey)
  const calendarDays = buildCalendarDays(calendarAnchorDate, habits, completions, todayKey, selectedDateKey)
  const selectedHabits = habits.filter((habit) => isHabitScheduledForDate(habit, selectedDateKey))
  const todayHabits = habits.filter((habit) => isHabitScheduledForDate(habit, todayKey))
  const todayRate = calculateDayRate(habits, completions, todayKey)
  const weeklyRate = calculateOverallWeeklyRate(habits, completions, today)
  const matrixDates = enumeratePastDates(35, today).reverse()
  const rpgProfile = calculateRpgProfile(habits, completions, todayKey, weeklyRate)
  const eventCountsByDate = countEventsByDate(events)
  const todoCountsByDate = countTodosByDate(todos)
  const todayEvents = getTodayEvents(events, todayKey)
  const todayTodos = getTodayTodos(todos, todayKey)

  function toggleDay(day) {
    setHabitForm((current) => {
      const exists = current.days.includes(day)
      const nextDays = exists ? current.days.filter((item) => item !== day) : [...current.days, day].sort()
      return { ...current, days: nextDays }
    })
    setHabitErrors((current) => ({ ...current, days: undefined }))
  }

  function updateHabitFormField(field, value) {
    setHabitForm((current) => ({ ...current, [field]: value }))
    setHabitErrors((current) => ({ ...current, [field]: undefined }))
  }

  function updateQuickSetting(templateId, field, value) {
    setQuickSettings((current) => ({
      ...current,
      [templateId]: {
        ...current[templateId],
        [field]: value,
      },
    }))
  }

  function updateEventFormField(field, value) {
    setEventForm((current) => ({ ...current, [field]: value }))
    setEventErrors((current) => ({
      ...current,
      [field]: undefined,
      time: ['startTime', 'endTime', 'isAllDay'].includes(field) ? undefined : current.time,
    }))
  }

  function updateTodoFormField(field, value) {
    setTodoForm((current) => ({ ...current, [field]: value }))
    setTodoErrors((current) => ({ ...current, [field]: undefined }))
  }

  function moveCalendarMonth(direction) {
    setCalendarAnchorDate((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1))
  }

  function selectCalendarDate(dateKey) {
    setSelectedDateKey(dateKey)
    setEventForm((current) => ({ ...current, date: dateKey }))
    setTodoForm((current) => ({ ...current, dueDate: dateKey }))
  }

  function resetHabitForm() {
    setHabitForm(createInitialHabitForm())
    setHabitErrors({})
  }

  function resetEventForm() {
    setEventForm(createDefaultEvent(selectedDateKey))
    setEventErrors({})
  }

  function resetTodoForm() {
    setTodoForm(createDefaultTodo(selectedDateKey))
    setTodoErrors({})
  }

  function validateHabitForm() {
    const errors = {}
    if (!habitForm.name.trim()) errors.name = '습관 이름을 입력해 주세요.'
    if (habitForm.days.length === 0) errors.days = '반복 요일을 최소 1개 선택해 주세요.'
    if (habitForm.type === 'wake' && !habitForm.targetTime) errors.targetTime = '목표 기상 시간을 선택해 주세요.'
    if (habitForm.type === 'workout' && safeNumber(habitForm.targetVolume) <= 0) errors.targetVolume = '목표 볼륨은 1 이상이어야 합니다.'
    if (habitForm.type === 'study' && safeNumber(habitForm.targetMinutes) <= 0) errors.targetMinutes = '목표 공부 시간은 1분 이상이어야 합니다.'
    if (habitForm.type === 'custom' && (safeNumber(habitForm.targetPercent) <= 0 || safeNumber(habitForm.targetPercent) > 100)) {
      errors.targetPercent = '목표 퍼센트는 1부터 100 사이로 입력해 주세요.'
    }
    return errors
  }

  function validateEventForm() {
    const errors = {}
    if (!eventForm.title.trim()) errors.title = '일정 제목을 입력해 주세요.'
    if (!eventForm.date) errors.date = '날짜를 선택해 주세요.'
    if (!eventForm.isAllDay && eventForm.startTime && eventForm.endTime && eventForm.startTime > eventForm.endTime) {
      errors.time = '시작 시간은 종료 시간보다 늦을 수 없습니다.'
    }
    return errors
  }

  function validateTodoForm() {
    const errors = {}
    if (!todoForm.title.trim()) errors.title = '할 일 제목을 입력해 주세요.'
    if (!todoForm.dueDate) errors.dueDate = '마감일을 선택해 주세요.'
    return errors
  }

  function createTargetFromHabitForm() {
    switch (habitForm.type) {
      case 'wake':
        return { targetTime: habitForm.targetTime }
      case 'workout':
        return { targetVolume: Number(habitForm.targetVolume) || 5000 }
      case 'study':
        return { targetMinutes: Number(habitForm.targetMinutes) || 90 }
      default:
        return { targetPercent: Number(habitForm.targetPercent) || 100 }
    }
  }

  function handleCreateHabit(event) {
    event.preventDefault()
    const errors = validateHabitForm()
    setHabitErrors(errors)
    if (Object.keys(errors).length > 0) return

    const nextHabit = {
      id: createId(),
      name: habitForm.name.trim(),
      type: habitForm.type,
      color: habitForm.color,
      emoji: habitForm.emoji || '🎯',
      days: habitForm.days,
      target: createTargetFromHabitForm(),
      createdAt: new Date().toISOString(),
    }

    setState((current) => ({ ...current, habits: [nextHabit, ...current.habits] }))
    resetHabitForm()
  }

  function addQuickHabit(template) {
    const settings = quickSettings[template.id] ?? template.defaults
    const subject = String(settings.subject ?? '').trim()
    const targetMinutes = Math.max(1, safeNumber(settings.targetMinutes, template.defaults.targetMinutes ?? 30))
    const targetTime = String(settings.targetTime ?? template.defaults.targetTime ?? '07:00')
    const targetVolume = Math.max(1, safeNumber(settings.targetVolume, template.defaults.targetVolume ?? 5000))
    const name = template.type === 'wake' ? '기상하기' : template.id === 'reading' ? '독서하기' : template.type === 'study' ? `${subject || '공부'} 공부하기` : template.name
    const target = template.type === 'wake' ? { targetTime } : template.type === 'workout' ? { targetVolume } : { targetMinutes }

    const nextHabit = {
      id: createId(),
      name,
      type: template.type,
      color: template.color,
      emoji: template.emoji,
      days: [1, 2, 3, 4, 5],
      target,
      createdAt: new Date().toISOString(),
    }

    setState((current) => ({ ...current, habits: [nextHabit, ...current.habits] }))
  }

  function updateHabitLog(habit, dateKey, patch) {
    setState((current) => {
      const currentLog = getHabitLog(current.completions, dateKey, habit)
      return {
        ...current,
        completions: {
          ...current.completions,
          [dateKey]: {
            ...(current.completions[dateKey] ?? {}),
            [habit.id]: {
              ...currentLog,
              ...patch,
            },
          },
        },
      }
    })
  }

  function deleteHabit(habitId) {
    setState((current) => {
      const nextCompletions = Object.fromEntries(
        Object.entries(current.completions).map(([dateKey, entries]) => {
          const { [habitId]: _removed, ...restEntries } = entries
          return [dateKey, restEntries]
        }),
      )
      return {
        ...current,
        habits: current.habits.filter((habit) => habit.id !== habitId),
        completions: nextCompletions,
      }
    })
  }

  function handleCreateEvent(event) {
    event.preventDefault()
    const errors = validateEventForm()
    setEventErrors(errors)
    if (Object.keys(errors).length > 0) return

    const now = new Date().toISOString()
    const nextEvent = normalizeEvent({
      ...eventForm,
      id: createId(),
      title: eventForm.title.trim(),
      startTime: eventForm.isAllDay ? '' : eventForm.startTime,
      endTime: eventForm.isAllDay ? '' : eventForm.endTime,
      createdAt: now,
      updatedAt: now,
    })

    setState((current) => ({ ...current, events: [nextEvent, ...(current.events ?? [])] }))
    setSelectedDateKey(nextEvent.date)
    setEventForm(createDefaultEvent(nextEvent.date))
    setEventErrors({})
  }

  function deleteEvent(eventId) {
    setState((current) => ({
      ...current,
      events: (current.events ?? []).filter((event) => event.id !== eventId),
    }))
  }

  function handleCreateTodo(event) {
    event.preventDefault()
    const errors = validateTodoForm()
    setTodoErrors(errors)
    if (Object.keys(errors).length > 0) return

    const now = new Date().toISOString()
    const nextTodo = normalizeTodo({
      ...todoForm,
      id: createId(),
      title: todoForm.title.trim(),
      isCompleted: false,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    })

    setState((current) => ({ ...current, todos: [nextTodo, ...(current.todos ?? [])] }))
    setTodoForm(createDefaultTodo(nextTodo.dueDate))
    setTodoErrors({})
  }

  function toggleTodoCompleted(todoId) {
    setState((current) => ({
      ...current,
      todos: (current.todos ?? []).map((todo) => {
        if (todo.id !== todoId) return todo
        const isCompleted = !todo.isCompleted
        return {
          ...todo,
          isCompleted,
          completedAt: isCompleted ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        }
      }),
    }))
  }

  function deleteTodo(todoId) {
    setState((current) => ({
      ...current,
      todos: (current.todos ?? []).filter((todo) => todo.id !== todoId),
    }))
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={16} />해빗 플로우</p>
          <h1>습관과 일정을 한 화면에</h1>
          <p className="hero-date">{formatHeroDate(today)}</p>
        </div>

        <div className="tabs-bar" role="tablist" aria-label="메인 탭">
          {TABS.map((tab) => (
            <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={`tab-chip ${activeTab === tab.id ? 'tab-chip--active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === 'home' && (
        <HomePage completions={completions} todayKey={todayKey} todayRate={todayRate} todayHabits={todayHabits} today={today} todayEvents={todayEvents} todayTodos={todayTodos} rpgProfile={rpgProfile} />
      )}

      {activeTab === 'calendar' && (
        <CalendarPage calendarDays={calendarDays} calendarAnchorDate={calendarAnchorDate} moveCalendarMonth={moveCalendarMonth} selectedDateKey={selectedDateKey} selectedDate={selectedDate} setSelectedDateKey={selectCalendarDate} completions={completions} selectedHabits={selectedHabits} events={events} todos={todos} eventCountsByDate={eventCountsByDate} todoCountsByDate={todoCountsByDate} eventForm={eventForm} eventErrors={eventErrors} updateEventFormField={updateEventFormField} handleCreateEvent={handleCreateEvent} resetEventForm={resetEventForm} deleteEvent={deleteEvent} />
      )}

      {activeTab === 'todos' && (
        <TodosPage todos={todos} todoForm={todoForm} todoErrors={todoErrors} updateTodoFormField={updateTodoFormField} handleCreateTodo={handleCreateTodo} resetTodoForm={resetTodoForm} toggleTodoCompleted={toggleTodoCompleted} deleteTodo={deleteTodo} todayKey={todayKey} today={today} />
      )}

      {activeTab === 'habits' && (
        <HabitsPage habits={habits} form={habitForm} habitErrors={habitErrors} quickSettings={quickSettings} updateFormField={updateHabitFormField} updateQuickSetting={updateQuickSetting} toggleDay={toggleDay} handleCreateHabit={handleCreateHabit} resetHabitForm={resetHabitForm} addQuickHabit={addQuickHabit} deleteHabit={deleteHabit} />
      )}

      {activeTab === 'records' && (
        <RecordsPage habits={habits} completions={completions} selectedDateKey={selectedDateKey} selectedDate={selectedDate} selectedHabits={selectedHabits} todayKey={todayKey} today={today} matrixDates={matrixDates} updateHabitLog={updateHabitLog} deleteHabit={deleteHabit} />
      )}

      {activeTab === 'companion' && <CompanionPage rpgProfile={rpgProfile} />}
    </main>
  )
}

export default App
