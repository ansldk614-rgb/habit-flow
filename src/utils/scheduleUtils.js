import {
  DEFAULT_SCHEDULE_CATEGORY,
  SCHEDULE_CATEGORIES,
  SCHEDULE_DAY_ORDER,
  SCHEDULE_REPEAT_TYPES,
  SCHEDULE_TIME_GRID,
  SCHEDULE_WEEKDAYS,
} from '../constants/scheduleConstants'
import { getDateKey, pad } from './dateUtils'

function createScheduleId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `schedule-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function ensureValidDayOfWeek(value, fallback = 1) {
  const day = Number(value)
  return Number.isInteger(day) && day >= 0 && day <= 6 ? day : fallback
}

function ensureRepeatDays(value, dayOfWeek) {
  if (!Array.isArray(value)) {
    return [dayOfWeek]
  }

  const days = [...new Set(value.map((day) => ensureValidDayOfWeek(day, null)).filter((day) => day !== null))]
  return days.length > 0 ? days.sort((left, right) => SCHEDULE_DAY_ORDER.indexOf(left) - SCHEDULE_DAY_ORDER.indexOf(right)) : [dayOfWeek]
}

function isDateKey(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function normalizeLinkType(partial) {
  if (partial?.linkType === 'habit' || partial?.linkedHabitId) return 'habit'
  if (partial?.linkType === 'todo' || partial?.linkedTodoId) return 'todo'
  return 'none'
}

export function getCategoryMeta(category) {
  return SCHEDULE_CATEGORIES[category] ?? SCHEDULE_CATEGORIES[DEFAULT_SCHEDULE_CATEGORY]
}

export function timeToMinutes(time) {
  if (typeof time !== 'string') return null

  const match = time.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null
  if (hours < 0 || hours > 24 || minutes < 0 || minutes > 59) return null
  if (hours === 24 && minutes !== 0) return null

  return hours * 60 + minutes
}

export function minutesToTime(minutes) {
  const safeMinutes = Math.max(0, Math.min(24 * 60, Number(minutes) || 0))
  const hours = Math.floor(safeMinutes / 60)
  const restMinutes = safeMinutes % 60
  return `${pad(hours)}:${pad(restMinutes)}`
}

export function createDefaultScheduleEvent(partial = {}) {
  const now = new Date().toISOString()
  const dayOfWeek = ensureValidDayOfWeek(partial.dayOfWeek, new Date().getDay())
  const category = getCategoryMeta(partial.category)?.id ?? DEFAULT_SCHEDULE_CATEGORY
  const dateKey = isDateKey(partial.dateKey) ? partial.dateKey : getDateKey()
  const linkType = normalizeLinkType(partial)

  return {
    id: String(partial.id || createScheduleId()),
    title: String(partial.title || ''),
    dateKey,
    dayOfWeek,
    startTime: String(partial.startTime || '09:00'),
    endTime: String(partial.endTime || '10:00'),
    category,
    color: String(partial.color || getCategoryMeta(category).defaultColor),
    memo: String(partial.memo || ''),
    repeatType: SCHEDULE_REPEAT_TYPES.includes(partial.repeatType) ? partial.repeatType : 'none',
    repeatDays: ensureRepeatDays(partial.repeatDays, dayOfWeek),
    linkType,
    linkedHabitId: linkType === 'habit' && partial.linkedHabitId ? String(partial.linkedHabitId) : null,
    linkedTodoId: linkType === 'todo' && partial.linkedTodoId ? String(partial.linkedTodoId) : null,
    isCompleted: Boolean(partial.isCompleted),
    createdAt: String(partial.createdAt || now),
    updatedAt: String(partial.updatedAt || partial.createdAt || now),
  }
}

export function normalizeScheduleEvent(event) {
  const normalized = createDefaultScheduleEvent(event)
  return {
    ...normalized,
    occurrenceDateKey: isDateKey(event?.occurrenceDateKey) ? event.occurrenceDateKey : undefined,
    occurrenceId: event?.occurrenceId ? String(event.occurrenceId) : undefined,
  }
}

export function normalizeScheduleEvents(events) {
  return Array.isArray(events)
    ? events.map(normalizeScheduleEvent).filter((event) => event.id && event.title.trim())
    : []
}

export function getRepeatLabel(repeatType) {
  switch (repeatType) {
    case 'weekly':
      return '매주'
    case 'weekdays':
      return '평일'
    case 'weekends':
      return '주말'
    case 'custom':
      return '사용자 지정'
    default:
      return ''
  }
}

export function getScheduleLinkType(event) {
  return normalizeLinkType(event)
}

export function getScheduleLinkLabel(event, habits = [], todos = []) {
  const linkType = getScheduleLinkType(event)

  if (linkType === 'habit') {
    const linkedHabit = habits.find((habit) => habit.id === event.linkedHabitId)
    return {
      type: 'habit',
      badge: '습관 연결',
      name: linkedHabit?.name || linkedHabit?.title || linkedHabit?.label || '',
      isMissing: Boolean(event.linkedHabitId && !linkedHabit),
    }
  }

  if (linkType === 'todo') {
    const linkedTodo = todos.find((todo) => todo.id === event.linkedTodoId)
    return {
      type: 'todo',
      badge: '할 일 연결',
      name: linkedTodo?.title || '',
      isMissing: Boolean(event.linkedTodoId && !linkedTodo),
    }
  }

  return { type: 'none', badge: '', name: '', isMissing: false }
}

export function getRepeatDaysForEvent(event) {
  const normalized = normalizeScheduleEvent(event)

  switch (normalized.repeatType) {
    case 'weekly':
      return [normalized.dayOfWeek]
    case 'weekdays':
      return [1, 2, 3, 4, 5]
    case 'weekends':
      return [6, 0]
    case 'custom':
      return ensureRepeatDays(normalized.repeatDays, normalized.dayOfWeek)
    default:
      return [normalized.dayOfWeek]
  }
}

export function getScheduleEventsForWeek(events, weekDays) {
  const weekDayByDayOfWeek = new Map(weekDays.map((day) => [day.dayOfWeek, day]))
  const weekDateKeys = new Set(weekDays.map((day) => day.dateKey))
  const occurrences = []

  normalizeScheduleEvents(events).forEach((event) => {
    if (event.repeatType === 'none') {
      if (!weekDateKeys.has(event.dateKey)) return
      occurrences.push({
        ...event,
        occurrenceDateKey: event.dateKey,
        occurrenceId: `${event.id}:${event.dateKey}`,
      })
      return
    }

    getRepeatDaysForEvent(event).forEach((dayOfWeek) => {
      const weekDay = weekDayByDayOfWeek.get(dayOfWeek)
      if (!weekDay) return

      occurrences.push({
        ...event,
        dayOfWeek,
        occurrenceDateKey: weekDay.dateKey,
        occurrenceId: `${event.id}:${weekDay.dateKey}`,
      })
    })
  })

  return sortScheduleEvents(occurrences)
}

export function getWeekDays(baseDate = new Date()) {
  const base = new Date(baseDate)
  base.setHours(0, 0, 0, 0)
  const todayKey = getDateKey()
  const mondayOffset = (base.getDay() + 6) % 7
  const monday = new Date(base)
  monday.setDate(base.getDate() - mondayOffset)

  return SCHEDULE_DAY_ORDER.map((dayOfWeek, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    const meta = SCHEDULE_WEEKDAYS.find((day) => day.dayOfWeek === dayOfWeek)
    const dateKey = getDateKey(date)

    return {
      date,
      dateKey,
      dayOfWeek,
      label: meta?.label ?? '',
      longLabel: meta?.longLabel ?? '',
      isToday: dateKey === todayKey,
    }
  })
}

export function getTimeSlots(
  startHour = SCHEDULE_TIME_GRID.startHour,
  endHour = SCHEDULE_TIME_GRID.endHour,
  slotMinutes = SCHEDULE_TIME_GRID.slotMinutes,
) {
  const start = Math.max(0, Math.min(24, Number(startHour) || SCHEDULE_TIME_GRID.startHour)) * 60
  const end = Math.max(0, Math.min(24, Number(endHour) || SCHEDULE_TIME_GRID.endHour)) * 60
  const step = Math.max(5, Number(slotMinutes) || SCHEDULE_TIME_GRID.slotMinutes)
  const slots = []

  for (let minutes = start; minutes <= end; minutes += step) {
    slots.push(minutesToTime(minutes))
  }

  return slots
}

export function getEventDurationMinutes(event) {
  const start = timeToMinutes(event?.startTime)
  const end = timeToMinutes(event?.endTime)
  if (start === null || end === null || end <= start) return 0
  return end - start
}

export function getEventTopAndHeight(
  event,
  startHour = SCHEDULE_TIME_GRID.startHour,
  slotMinutes = SCHEDULE_TIME_GRID.slotMinutes,
) {
  const start = timeToMinutes(event?.startTime)
  const duration = getEventDurationMinutes(event)
  const gridStart = Number(startHour) * 60
  const safeSlotMinutes = Math.max(1, Number(slotMinutes) || SCHEDULE_TIME_GRID.slotMinutes)

  if (start === null || duration <= 0) {
    return { top: 0, height: 0, startSlot: 0, durationSlots: 0 }
  }

  const startSlot = Math.max(0, (start - gridStart) / safeSlotMinutes)
  const durationSlots = duration / safeSlotMinutes

  return {
    top: startSlot,
    height: durationSlots,
    startSlot,
    durationSlots,
  }
}

export function validateScheduleEvent(event) {
  const errors = []
  const start = timeToMinutes(event?.startTime)
  const end = timeToMinutes(event?.endTime)
  const dayOfWeek = Number(event?.dayOfWeek)

  if (!String(event?.title || '').trim()) {
    errors.push('일정 제목을 입력해 주세요.')
  }

  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    errors.push('요일을 선택해 주세요.')
  }

  if (start === null || end === null) {
    errors.push('시작 시간과 종료 시간을 올바르게 입력해 주세요.')
  } else if (start >= end) {
    errors.push('시작 시간은 종료 시간보다 빨라야 합니다.')
  }

  return errors
}

export function detectScheduleConflicts(events, targetEvent) {
  const target = normalizeScheduleEvent(targetEvent)
  const targetStart = timeToMinutes(target.startTime)
  const targetEnd = timeToMinutes(target.endTime)

  if (targetStart === null || targetEnd === null || targetStart >= targetEnd) {
    return []
  }

  return normalizeScheduleEvents(events).filter((event) => {
    if (event.id === target.id) return false
    if (event.dayOfWeek !== target.dayOfWeek) return false

    const start = timeToMinutes(event.startTime)
    const end = timeToMinutes(event.endTime)
    if (start === null || end === null) return false

    return start < targetEnd && end > targetStart
  })
}

export function sortScheduleEvents(events) {
  return normalizeScheduleEvents(events).sort((left, right) => {
    const leftDayIndex = SCHEDULE_DAY_ORDER.indexOf(left.dayOfWeek)
    const rightDayIndex = SCHEDULE_DAY_ORDER.indexOf(right.dayOfWeek)
    if (leftDayIndex !== rightDayIndex) return leftDayIndex - rightDayIndex
    return left.startTime.localeCompare(right.startTime)
  })
}

export function getEventsForDay(events, dayOfWeek) {
  const normalizedDay = ensureValidDayOfWeek(dayOfWeek, 1)
  return sortScheduleEvents(events).filter((event) => event.dayOfWeek === normalizedDay)
}
