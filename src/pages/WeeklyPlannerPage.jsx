import { useEffect, useMemo, useState } from 'react'
import ScheduleToolbar from '../components/schedule/ScheduleToolbar'
import ScheduleEventModal from '../components/schedule/ScheduleEventModal'
import WeeklyScheduleGrid from '../components/schedule/WeeklyScheduleGrid'
import { SCHEDULE_STORAGE_KEY } from '../constants/scheduleConstants'
import { createDefaultScheduleEvent, getScheduleEventsForWeek, getWeekDays, minutesToTime, normalizeScheduleEvents } from '../utils/scheduleUtils'
import { getDateKey, parseDateKey } from '../utils/dateUtils'

export default function WeeklyPlannerPage({ schedules = [], habits = [], todos = [] }) {
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [scheduleEvents, setScheduleEvents] = useState(() => loadStoredSchedules(schedules))
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', event: null })
  const weekDays = useMemo(() => getWeekDays(anchorDate), [anchorDate])
  const visibleSchedules = useMemo(() => getScheduleEventsForWeek(scheduleEvents, weekDays), [scheduleEvents, weekDays])

  useEffect(() => {
    window.localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(normalizeScheduleEvents(scheduleEvents)))
  }, [scheduleEvents])

  function moveWeek(direction) {
    setAnchorDate((current) => {
      const nextDate = new Date(current)
      nextDate.setDate(current.getDate() + direction * 7)
      return nextDate
    })
  }

  function returnToToday() {
    setAnchorDate(new Date())
  }

  function selectAnchorDate(dateKey) {
    if (!dateKey) return
    setAnchorDate(parseDateKey(dateKey))
  }

  function openAddSchedule(partial = {}) {
    setModalState({
      isOpen: true,
      mode: 'add',
      event: createDefaultScheduleEvent({
        ...getDefaultScheduleTime(),
        dayOfWeek: new Date().getDay(),
        dateKey: getDateKey(),
        ...partial,
      }),
    })
  }

  function openEditSchedule(event) {
    setModalState({ isOpen: true, mode: 'edit', event })
  }

  function closeScheduleModal() {
    setModalState({ isOpen: false, mode: 'add', event: null })
  }

  function saveSchedule(event) {
    const now = new Date().toISOString()
    const nextEvent = ensureScheduleDateKey(event, weekDays)

    // TODO: When schedule completion is implemented, propagate linkedHabitId into habit completions,
    // connect XP/Gold rewards, and surface linked items in Today Focus.
    setScheduleEvents((current) => {
      if (modalState.mode === 'edit') {
        return current.map((item) => (
          item.id === nextEvent.id
            ? { ...nextEvent, createdAt: item.createdAt, updatedAt: now }
            : item
        ))
      }

      return [
        createDefaultScheduleEvent({
          ...nextEvent,
          createdAt: now,
          updatedAt: now,
        }),
        ...current,
      ]
    })

    closeScheduleModal()
  }

  function deleteSchedule(eventId) {
    setScheduleEvents((current) => current.filter((event) => event.id !== eventId))
    closeScheduleModal()
  }

  function openSlotSchedule(dayOfWeek, minutes) {
    const startTime = minutesToTime(minutes)
    const endTime = minutesToTime(Math.min(minutes + 60, 24 * 60))
    const targetDay = weekDays.find((day) => day.dayOfWeek === dayOfWeek)
    openAddSchedule({ dayOfWeek, dateKey: targetDay?.dateKey, startTime, endTime })
  }

  return (
    <section className="panel weekly-planner-page">
      <ScheduleToolbar
        weekDays={weekDays}
        onPreviousWeek={() => moveWeek(-1)}
        onNextWeek={() => moveWeek(1)}
        onToday={returnToToday}
        selectedDateKey={getDateKey(anchorDate)}
        onSelectDate={selectAnchorDate}
        onAddSchedule={() => openAddSchedule()}
      />
      <WeeklyScheduleGrid
        weekDays={weekDays}
        schedules={visibleSchedules}
        habits={habits}
        todos={todos}
        onScheduleClick={openEditSchedule}
        onSlotClick={openSlotSchedule}
      />

      {modalState.isOpen ? (
        <ScheduleEventModal
          mode={modalState.mode}
          event={modalState.event}
          schedules={scheduleEvents}
          habits={habits}
          todos={todos}
          onClose={closeScheduleModal}
          onSave={saveSchedule}
          onDelete={deleteSchedule}
        />
      ) : null}
    </section>
  )
}

function ensureScheduleDateKey(event, weekDays) {
  if (event.repeatType !== 'none') return event
  const matchedDay = weekDays.find((day) => day.dayOfWeek === Number(event.dayOfWeek))
  return {
    ...event,
    dateKey: matchedDay?.dateKey ?? event.dateKey ?? getDateKey(),
  }
}

function loadStoredSchedules(fallbackSchedules = []) {
  if (typeof window === 'undefined') return normalizeScheduleEvents(fallbackSchedules)

  try {
    const saved = window.localStorage.getItem(SCHEDULE_STORAGE_KEY)
    return saved ? normalizeScheduleEvents(JSON.parse(saved)) : normalizeScheduleEvents(fallbackSchedules)
  } catch {
    return normalizeScheduleEvents(fallbackSchedules)
  }
}

function getDefaultScheduleTime() {
  const now = new Date()
  const nextHour = Math.min(now.getHours() + 1, 23)
  const startTime = minutesToTime(nextHour * 60)
  const endTime = minutesToTime(Math.min((nextHour + 1) * 60, 24 * 60))

  return { startTime, endTime }
}
