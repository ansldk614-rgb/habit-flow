import { getDateKey } from './dateUtils'

export function createDefaultEvent(dateKey = getDateKey()) {
  return {
    title: '',
    date: dateKey,
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    category: '개인',
    memo: '',
    color: '#86ff5d',
    isAllDay: false,
  }
}

export function normalizeEvent(event) {
  const now = new Date().toISOString()

  return {
    id: String(event.id || ''),
    title: String(event.title || '').trim(),
    date: String(event.date || getDateKey()),
    startTime: String(event.startTime || ''),
    endTime: String(event.endTime || ''),
    location: String(event.location || ''),
    category: String(event.category || '개인'),
    memo: String(event.memo || ''),
    color: String(event.color || '#86ff5d'),
    isAllDay: Boolean(event.isAllDay),
    createdAt: String(event.createdAt || now),
    updatedAt: String(event.updatedAt || event.createdAt || now),
  }
}

export function normalizeEvents(events) {
  return Array.isArray(events)
    ? events.map(normalizeEvent).filter((event) => event.id && event.title && event.date)
    : []
}

export function getEventsForDate(events, dateKey) {
  return normalizeEvents(events)
    .filter((event) => event.date === dateKey)
    .sort((left, right) => {
      if (left.isAllDay !== right.isAllDay) return left.isAllDay ? -1 : 1
      return left.startTime.localeCompare(right.startTime)
    })
}

export function getTodayEvents(events, todayKey = getDateKey()) {
  return getEventsForDate(events, todayKey)
}

export function countEventsByDate(events) {
  return normalizeEvents(events).reduce((acc, event) => {
    acc[event.date] = (acc[event.date] || 0) + 1
    return acc
  }, {})
}

export function formatEventTime(event) {
  if (event.isAllDay) return '하루 종일'
  if (event.startTime && event.endTime) return `${event.startTime} - ${event.endTime}`
  if (event.startTime) return event.startTime
  return '시간 미정'
}
