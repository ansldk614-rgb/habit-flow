export const STORAGE_KEY = 'habit-flow-mvp'
export const STORAGE_VERSION = 1
export const DEFAULT_SETTINGS = {
  theme: 'light',
  weekStartsOn: 'monday',
}

export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
export const COLOR_OPTIONS = ['#86ff5d', '#ffffff', '#00e5ff', '#f8ff7a']
export const EMOJI_OPTIONS = ['⏰', '💪', '📚', '📝', '🧘', '💧', '🥗', '🚀', '✨', '🔥', '🎯', '💼']

export const HABIT_TYPES = [
  { value: 'wake', label: '기상' },
  { value: 'workout', label: '운동' },
  { value: 'study', label: '공부' },
  { value: 'custom', label: '일반' },
]

export const QUICK_HABITS = [
  { id: 'wake', emoji: '⏰', name: '기상하기', type: 'wake', color: '#86ff5d', defaults: { targetTime: '07:00' } },
  { id: 'workout', emoji: '💪', name: '운동하기', type: 'workout', color: '#ffffff', defaults: { targetVolume: 5000 } },
  { id: 'study', emoji: '📚', name: '공부하기', type: 'study', color: '#00e5ff', defaults: { subject: '영어', targetMinutes: 90 } },
  { id: 'reading', emoji: '📖', name: '독서하기', type: 'study', color: '#f8ff7a', defaults: { subject: '독서', targetMinutes: 20 } },
]

export const PROGRESS_STEPS = [0, 25, 50, 75, 100]

export const TABS = [
  { id: 'home', label: '홈' },
  { id: 'calendar', label: '캘린더' },
  { id: 'todos', label: '할 일' },
  { id: 'habits', label: '습관 관리' },
  { id: 'records', label: '기록' },
  { id: 'companion', label: '슬라임' },
]

export const EVENT_CATEGORY_OPTIONS = ['개인', '업무', '공부', '운동', '약속', '기타']
export const EVENT_COLOR_OPTIONS = ['#86ff5d', '#00e5ff', '#f8ff7a', '#ff806e', '#ffffff']
export const TODO_CATEGORY_OPTIONS = ['개인', '업무', '공부', '운동', '정리', '기타']
export const TODO_PRIORITY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]
