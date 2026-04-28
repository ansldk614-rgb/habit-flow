import { useEffect, useState } from 'react'
import { Settings, Sparkles } from 'lucide-react'
import { COLOR_OPTIONS, QUICK_HABITS, TABS } from './constants/habitConstants'
import { applyTheme, getStoredThemeId, getThemeById, saveThemeId } from './constants/themeConstants'
import HabitModal from './components/modals/HabitModal'
import WeekDetailModal from './components/modals/WeekDetailModal'
import SettingsPanel from './components/settings/SettingsPanel'
import { fallbackState, migrateStoredState, useLocalStorage } from './hooks/useLocalStorage'
import CalendarPage from './pages/CalendarPage'
import CompanionPage from './pages/CompanionPage'
import HabitsPage from './pages/HabitsPage'
import HomePage from './pages/HomePage'
import RecordsPage from './pages/RecordsPage'
import TodosPage from './pages/TodosPage'
import WeeklyPlannerPage from './pages/WeeklyPlannerPage'
import { enumeratePastDates, formatHeroDate, getDateKey, parseDateKey } from './utils/dateUtils'
import {
  buildCalendarDays,
  calculateDayRate,
  calculateOverallWeeklyRate,
  createId,
  getHabitLog,
  getHabitMetrics,
  isHabitScheduledForDate,
  safeNumber,
} from './utils/habitUtils'
import { countEventsByDate, createDefaultEvent, getTodayEvents, normalizeEvent } from './utils/eventUtils'
import { applyHabitReward, calculateRpgProfile } from './utils/rpgUtils'
import { countTodosByDate, createDefaultTodo, getTodayTodos, normalizeTodo } from './utils/todoUtils'

const PERIOD_MODE_STORAGE_KEY = 'habit-flow-period-mode'
const DEVELOPER_MODE_STORAGE_KEY = 'habitFlowDeveloperMode'
const PERIOD_MODES = new Set(['recent', 'month'])

function getStoredPeriodMode() {
  if (typeof window === 'undefined') {
    return 'recent'
  }

  const savedMode = window.localStorage.getItem(PERIOD_MODE_STORAGE_KEY)
  return PERIOD_MODES.has(savedMode) ? savedMode : 'recent'
}

function getStoredDeveloperMode() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(DEVELOPER_MODE_STORAGE_KEY) === 'true'
}

function getQuickHabitInitialState() {
  const defaultsById = {
    wake: [1, 2, 3, 4, 5],
    workout: [1, 3, 5],
    study: [1, 2, 3, 4, 5],
    reading: [0, 1, 2, 3, 4, 5, 6],
  }
  return Object.fromEntries(QUICK_HABITS.map((habit) => [habit.id, { ...habit.defaults, activeDays: habit.defaults?.activeDays ?? defaultsById[habit.id] ?? [1, 2, 3, 4, 5] }]))
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
    goal: 20,
  }
}

function App() {
  const [{ version, habits, completions, events, schedules, todos, companion, rewardedCompletions, settings }, setState] = useLocalStorage()
  const [activeTab, setActiveTab] = useState('home')
  const [periodMode, setPeriodMode] = useState(getStoredPeriodMode)
  const [selectedThemeId, setSelectedThemeId] = useState(getStoredThemeId)
  const [developerMode, setDeveloperMode] = useState(getStoredDeveloperMode)
  const [habitForm, setHabitForm] = useState(createInitialHabitForm)
  const [habitErrors, setHabitErrors] = useState({})
  const [eventErrors, setEventErrors] = useState({})
  const [todoErrors, setTodoErrors] = useState({})
  const [quickSettings, setQuickSettings] = useState(getQuickHabitInitialState)
  const [selectedDateKey, setSelectedDateKey] = useState(getDateKey())
  const [calendarAnchorDate, setCalendarAnchorDate] = useState(() => new Date())
  const [eventForm, setEventForm] = useState(() => createDefaultEvent(getDateKey()))
  const [todoForm, setTodoForm] = useState(() => createDefaultTodo(getDateKey()))
  const [habitModal, setHabitModal] = useState({ isOpen: false, mode: 'add', habit: null })
  const [weekDetailModal, setWeekDetailModal] = useState({ isOpen: false, week: null })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const today = new Date()
  const todayKey = getDateKey(today)
  const selectedDate = parseDateKey(selectedDateKey)
  const calendarDays = buildCalendarDays(calendarAnchorDate, habits, completions, todayKey, selectedDateKey)
  const selectedHabits = habits.filter((habit) => isHabitScheduledForDate(habit, selectedDateKey) || completions[selectedDateKey]?.[habit.id])
  const todayHabits = habits.filter((habit) => isHabitScheduledForDate(habit, todayKey) || completions[todayKey]?.[habit.id])
  const todayRate = calculateDayRate(habits, completions, todayKey)
  const weeklyRate = calculateOverallWeeklyRate(habits, completions, today)
  const matrixDates = enumeratePastDates(35, today).reverse()
  const rpgProfile = calculateRpgProfile(habits, completions, todayKey, weeklyRate, companion)
  const eventCountsByDate = countEventsByDate(events)
  const todoCountsByDate = countTodosByDate(todos)
  const todayEvents = getTodayEvents(events, todayKey)
  const todayTodos = getTodayTodos(todos, todayKey)
  const selectedTheme = getThemeById(selectedThemeId)

  useEffect(() => {
    applyTheme(selectedTheme)
  }, [selectedTheme])

  useEffect(() => {
    window.localStorage.setItem(PERIOD_MODE_STORAGE_KEY, PERIOD_MODES.has(periodMode) ? periodMode : 'recent')
  }, [periodMode])

  useEffect(() => {
    window.localStorage.setItem(DEVELOPER_MODE_STORAGE_KEY, developerMode ? 'true' : 'false')
  }, [developerMode])

  function selectTheme(theme) {
    const nextTheme = getThemeById(theme?.id)
    setSelectedThemeId(nextTheme.id)
    applyTheme(nextTheme)
    saveThemeId(nextTheme.id)
  }

  function importAppData(backup) {
    const nextTheme = getThemeById(backup?.theme)
    const nextPeriodMode = PERIOD_MODES.has(backup?.periodMode) ? backup.periodMode : 'recent'

    setState(migrateStoredState(backup?.data))
    setSelectedThemeId(nextTheme.id)
    applyTheme(nextTheme)
    saveThemeId(nextTheme.id)
    setPeriodMode(nextPeriodMode)
  }

  function resetAppData() {
    const defaultTheme = getThemeById()

    setState(fallbackState)
    setSelectedThemeId(defaultTheme.id)
    applyTheme(defaultTheme)
    saveThemeId(defaultTheme.id)
    setPeriodMode('recent')
  }

  function updateSlimeProfile(updater) {
    setState((current) => ({
      ...current,
      companion: typeof updater === 'function' ? updater(current.companion) : updater,
    }))
  }

  function resetRewardHistory() {
    setState((current) => ({
      ...current,
      rewardedCompletions: {},
    }))
  }

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

  function toggleQuickActiveDay(templateId, day) {
    setQuickSettings((current) => {
      const settings = current[templateId] ?? {}
      const activeDays = Array.isArray(settings.activeDays) ? settings.activeDays : [1, 2, 3, 4, 5]
      const exists = activeDays.includes(day)
      const nextDays = exists ? activeDays.filter((item) => item !== day) : [...activeDays, day]
      if (nextDays.length === 0) return current
      return {
        ...current,
        [templateId]: {
          ...settings,
          activeDays: nextDays.sort((left, right) => left - right),
        },
      }
    })
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
    if (safeNumber(habitForm.goal) < 1) errors.goal = 'Monthly goal must be at least 1.'
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
      activeDays: habitForm.days,
      goal: Number(habitForm.goal) || 20,
      monthlyGoal: Number(habitForm.goal) || 20,
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
    const activeDays = Array.isArray(settings.activeDays) && settings.activeDays.length > 0 ? settings.activeDays : [1, 2, 3, 4, 5]

    const nextHabit = {
      id: createId(),
      name,
      type: template.type,
      color: template.color,
      emoji: template.emoji,
      days: activeDays,
      activeDays,
      goal: Math.max(1, activeDays.length * 4),
      monthlyGoal: Math.max(1, activeDays.length * 4),
      target,
      createdAt: new Date().toISOString(),
    }

    setState((current) => ({ ...current, habits: [nextHabit, ...current.habits] }))
  }

  function updateHabitLog(habit, dateKey, patch) {
    setState((current) => {
      const currentLog = getHabitLog(current.completions, dateKey, habit)
      const nextLog = {
        ...currentLog,
        ...patch,
      }
      const wasDone = getHabitMetrics(habit, currentLog).progressPercent >= 100
      const isDone = getHabitMetrics(habit, nextLog).progressPercent >= 100
      const rewardKey = `${habit.id}:${dateKey}`
      const hasRewarded = current.rewardedCompletions?.[rewardKey] === true
      const shouldReward = !wasDone && isDone && !hasRewarded

      return {
        ...current,
        completions: {
          ...current.completions,
          [dateKey]: {
            ...(current.completions[dateKey] ?? {}),
            [habit.id]: nextLog,
          },
        },
        companion: shouldReward ? applyHabitReward(current.companion, habit) : current.companion,
        rewardedCompletions: shouldReward
          ? {
              ...(current.rewardedCompletions ?? {}),
              [rewardKey]: true,
            }
          : current.rewardedCompletions,
      }
    })
  }

  function toggleDashboardHabitDate(habit, dateKey) {
    const currentLog = getHabitLog(completions, dateKey, habit)
    const nextProgress = safeNumber(currentLog.progressPercent) >= 100 ? 0 : 100
    updateHabitLog(habit, dateKey, { progressPercent: nextProgress })
    setSelectedDateKey(dateKey)
  }

  function openDashboardWeekDetail(week) {
    if (week?.dates?.[0]) {
      setSelectedDateKey(week.dates[0])
    }
    setWeekDetailModal({ isOpen: true, week })
  }

  function closeWeekDetailModal() {
    setWeekDetailModal({ isOpen: false, week: null })
  }

  function openAddHabitModal() {
    setHabitModal({ isOpen: true, mode: 'add', habit: null })
  }

  function openEditHabitModal(habit) {
    setHabitModal({ isOpen: true, mode: 'edit', habit })
  }

  function closeHabitModal() {
    setHabitModal({ isOpen: false, mode: 'add', habit: null })
  }

  function createTargetForDashboardHabit(type) {
    switch (type) {
      case 'wake':
        return { targetTime: '07:00' }
      case 'workout':
        return { targetVolume: 5000 }
      case 'study':
        return { targetMinutes: 90 }
      default:
        return { targetPercent: 100 }
    }
  }

  function saveDashboardHabit(values) {
    const now = new Date().toISOString()

    setState((current) => {
      if (habitModal.mode === 'edit' && habitModal.habit?.id) {
        return {
          ...current,
          habits: current.habits.map((habit) => {
            if (habit.id !== habitModal.habit.id) return habit
            return {
              ...habit,
              ...values,
              target: values.target ?? (habit.type === values.type ? habit.target : createTargetForDashboardHabit(values.type)),
              days: values.activeDays ?? values.days ?? habit.days,
              activeDays: values.activeDays ?? values.days ?? habit.activeDays ?? habit.days,
              goal: values.goal ?? values.monthlyGoal ?? habit.goal ?? habit.monthlyGoal,
              monthlyGoal: values.goal ?? values.monthlyGoal ?? habit.goal ?? habit.monthlyGoal,
              updatedAt: now,
            }
          }),
        }
      }

      const nextHabit = {
        id: createId(),
        ...values,
        days: values.activeDays ?? [1, 2, 3, 4, 5],
        activeDays: values.activeDays ?? [1, 2, 3, 4, 5],
        goal: values.goal ?? values.monthlyGoal ?? 20,
        monthlyGoal: values.goal ?? values.monthlyGoal ?? 20,
        target: values.target ?? createTargetForDashboardHabit(values.type),
        createdAt: now,
        updatedAt: now,
      }

      return {
        ...current,
        habits: [nextHabit, ...current.habits],
      }
    })

    closeHabitModal()
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
        <div className="hero-panel__top">
          <div className="hero-copy">
            <p className="eyebrow"><Sparkles size={16} />해빗 플로우</p>
            <h1>습관과 일정을 한 화면에</h1>
            <p className="hero-date">{formatHeroDate(today)}</p>
          </div>

          <button
            type="button"
            className="settings-button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open settings"
            title="Settings"
          >
            <Settings size={18} />
          </button>
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
        <HomePage habits={habits} completions={completions} todayKey={todayKey} todayRate={todayRate} todayHabits={todayHabits} today={today} todayEvents={todayEvents} todayTodos={todayTodos} rpgProfile={rpgProfile} selectedDateKey={selectedDateKey} periodMode={periodMode} onPeriodModeChange={setPeriodMode} onSelectDate={setSelectedDateKey} onToggleHabitDate={toggleDashboardHabitDate} onUpdateHabitLog={updateHabitLog} onAddHabit={openAddHabitModal} onEditHabit={openEditHabitModal} onOpenWeekDetail={openDashboardWeekDetail} />
      )}

      {activeTab === 'calendar' && (
        <CalendarPage calendarDays={calendarDays} calendarAnchorDate={calendarAnchorDate} moveCalendarMonth={moveCalendarMonth} selectedDateKey={selectedDateKey} selectedDate={selectedDate} setSelectedDateKey={selectCalendarDate} completions={completions} selectedHabits={selectedHabits} events={events} todos={todos} eventCountsByDate={eventCountsByDate} todoCountsByDate={todoCountsByDate} eventForm={eventForm} eventErrors={eventErrors} updateEventFormField={updateEventFormField} handleCreateEvent={handleCreateEvent} resetEventForm={resetEventForm} deleteEvent={deleteEvent} />
      )}

      {activeTab === 'weeklyPlanner' && (
        <WeeklyPlannerPage schedules={schedules} habits={habits} todos={todos} />
      )}

      {activeTab === 'todos' && (
        <TodosPage todos={todos} todoForm={todoForm} todoErrors={todoErrors} updateTodoFormField={updateTodoFormField} handleCreateTodo={handleCreateTodo} resetTodoForm={resetTodoForm} toggleTodoCompleted={toggleTodoCompleted} deleteTodo={deleteTodo} todayKey={todayKey} today={today} />
      )}

      {activeTab === 'habits' && (
        <HabitsPage habits={habits} form={habitForm} habitErrors={habitErrors} quickSettings={quickSettings} updateFormField={updateHabitFormField} updateQuickSetting={updateQuickSetting} toggleQuickActiveDay={toggleQuickActiveDay} toggleDay={toggleDay} handleCreateHabit={handleCreateHabit} resetHabitForm={resetHabitForm} addQuickHabit={addQuickHabit} deleteHabit={deleteHabit} onEditHabit={openEditHabitModal} />
      )}

      {activeTab === 'records' && (
        <RecordsPage habits={habits} completions={completions} selectedDateKey={selectedDateKey} selectedDate={selectedDate} selectedHabits={selectedHabits} todayKey={todayKey} today={today} matrixDates={matrixDates} updateHabitLog={updateHabitLog} deleteHabit={deleteHabit} />
      )}

      {activeTab === 'companion' && (
        <CompanionPage
          rpgProfile={rpgProfile}
          developerMode={developerMode}
          rewardedCompletions={rewardedCompletions}
          onUpdateSlimeProfile={updateSlimeProfile}
          onResetRewardHistory={resetRewardHistory}
        />
      )}

      {habitModal.isOpen && (
        <HabitModal
          mode={habitModal.mode}
          habit={habitModal.habit}
          onClose={closeHabitModal}
          onSave={saveDashboardHabit}
        />
      )}

      {weekDetailModal.isOpen && (
        <WeekDetailModal
          week={weekDetailModal.week}
          habits={habits}
          completions={completions}
          todayKey={todayKey}
          onClose={closeWeekDetailModal}
          onToggleHabitDate={toggleDashboardHabitDate}
        />
      )}

      {isSettingsOpen && (
        <SettingsPanel
          selectedThemeId={selectedTheme.id}
          periodMode={periodMode}
          appData={{ version, habits, completions, events, schedules, todos, companion, rewardedCompletions, settings }}
          onSelectTheme={selectTheme}
          onImportData={importAppData}
          onResetData={resetAppData}
          developerMode={developerMode}
          onDeveloperModeChange={setDeveloperMode}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </main>
  )
}

export default App
