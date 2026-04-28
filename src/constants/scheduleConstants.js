export const SCHEDULE_STORAGE_KEY = 'habitFlowSchedules'

export const SCHEDULE_TIME_GRID = {
  startHour: 6,
  endHour: 24,
  slotMinutes: 30,
}

export const SCHEDULE_DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

export const SCHEDULE_WEEKDAYS = [
  { dayOfWeek: 1, label: '월', longLabel: '월요일' },
  { dayOfWeek: 2, label: '화', longLabel: '화요일' },
  { dayOfWeek: 3, label: '수', longLabel: '수요일' },
  { dayOfWeek: 4, label: '목', longLabel: '목요일' },
  { dayOfWeek: 5, label: '금', longLabel: '금요일' },
  { dayOfWeek: 6, label: '토', longLabel: '토요일' },
  { dayOfWeek: 0, label: '일', longLabel: '일요일' },
]

export const SCHEDULE_REPEAT_TYPES = ['none', 'weekly', 'weekdays', 'weekends', 'custom']

export const SCHEDULE_CATEGORIES = {
  study: {
    id: 'study',
    label: '공부',
    colorToken: 'schedule-study',
    defaultColor: '#00E5FF',
  },
  exercise: {
    id: 'exercise',
    label: '운동',
    colorToken: 'schedule-exercise',
    defaultColor: '#86FF5D',
  },
  class: {
    id: 'class',
    label: '수업',
    colorToken: 'schedule-class',
    defaultColor: '#A78BFA',
  },
  work: {
    id: 'work',
    label: '업무',
    colorToken: 'schedule-work',
    defaultColor: '#F8FF7A',
  },
  personal: {
    id: 'personal',
    label: '개인',
    colorToken: 'schedule-personal',
    defaultColor: '#FF806E',
  },
  rest: {
    id: 'rest',
    label: '휴식',
    colorToken: 'schedule-rest',
    defaultColor: '#7DD3FC',
  },
  routine: {
    id: 'routine',
    label: '루틴',
    colorToken: 'schedule-routine',
    defaultColor: '#34C37A',
  },
  important: {
    id: 'important',
    label: '중요',
    colorToken: 'schedule-important',
    defaultColor: '#E45B5B',
  },
}

export const DEFAULT_SCHEDULE_CATEGORY = 'personal'
