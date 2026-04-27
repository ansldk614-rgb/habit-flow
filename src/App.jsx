import { useEffect, useState } from 'react'
import {
  AlarmClock,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Dumbbell,
  Flame,
  LineChart,
  MoonStar,
  NotebookPen,
  Plus,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  TrendingUp,
} from 'lucide-react'
import habitBuddySlimeCute from './assets/habit-buddy-slime-cute.png'

const STORAGE_KEY = 'habit-flow-mvp'
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const COLOR_OPTIONS = ['#86ff5d', '#ffffff', '#00e5ff', '#f8ff7a']
const EMOJI_OPTIONS = ['⏰', '💪', '📚', '📝', '🧘', '💧', '🥗', '🚀', '✨', '🔥', '🎯', '💼']
const HABIT_TYPES = [
  { value: 'wake', label: '기상' },
  { value: 'workout', label: '운동' },
  { value: 'study', label: '공부' },
  { value: 'custom', label: '일반' },
]
const QUICK_HABITS = [
  { id: 'wake', emoji: '⏰', name: '기상하기', type: 'wake', color: '#86ff5d', defaults: { targetTime: '07:00' } },
  { id: 'workout', emoji: '💪', name: '운동하기', type: 'workout', color: '#ffffff', defaults: { targetVolume: 5000 } },
  { id: 'study', emoji: '📚', name: '공부하기', type: 'study', color: '#00e5ff', defaults: { subject: '영어', targetMinutes: 90 } },
  { id: 'reading', emoji: '📖', name: '독서하기', type: 'study', color: '#f8ff7a', defaults: { subject: '독서', targetMinutes: 20 } },
]
const PROGRESS_STEPS = [0, 25, 50, 75, 100]
const TABS = [
  { id: 'home', label: '홈' },
  { id: 'habits', label: '습관 관리' },
  { id: 'records', label: '기록' },
  { id: 'companion', label: '슬라임' },
]

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function getDateKey(date = new Date()) {
  const localDate = new Date(date)
  return `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}`
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatHeroDate(date = new Date()) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date)
}

function formatMonthLabel(date = new Date()) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function getHabitDayIndex(dateKey) {
  return parseDateKey(dateKey).getDay()
}

function isHabitScheduledForDate(habit, dateKey) {
  return habit.days.includes(getHabitDayIndex(dateKey))
}

function enumeratePastDates(days, anchorDate = new Date()) {
  const dates = []
  const base = new Date(anchorDate)
  base.setHours(0, 0, 0, 0)

  for (let index = 0; index < days; index += 1) {
    const current = new Date(base)
    current.setDate(base.getDate() - index)
    dates.push(getDateKey(current))
  }

  return dates
}

function timeToMinutes(timeText = '') {
  const [hours, minutes] = timeText.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null
  }
  return hours * 60 + minutes
}

function normalizeProgress(value) {
  if (value === true) {
    return 100
  }
  if (value === false || value == null) {
    return 0
  }
  return Math.max(0, Math.min(100, Number(value) || 0))
}

function safeNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function safePercent(value) {
  return Math.max(0, Math.min(100, Math.round(safeNumber(value, 0))))
}

function formatPercent(value) {
  return `${safePercent(value)}%`
}

function formatCount(value, fallback = 0) {
  return String(Math.max(0, Math.round(safeNumber(value, fallback))))
}

function getProgressCellStyle(progress, scheduled) {
  if (!scheduled) {
    return undefined
  }

  const percent = safePercent(progress)
  const alpha = Math.max(0.08, percent / 100)
  const glow = Math.max(0, (percent - 35) / 65)

  return {
    background: `rgba(134, 255, 93, ${0.08 + alpha * 0.82})`,
    borderColor: `rgba(134, 255, 93, ${0.08 + alpha * 0.36})`,
    boxShadow: glow > 0 ? `0 0 ${Math.round(4 + glow * 10)}px rgba(134, 255, 93, ${0.12 + glow * 0.22})` : 'none',
  }
}

function getDefaultEmoji(type) {
  switch (type) {
    case 'wake':
      return '⏰'
    case 'workout':
      return '💪'
    case 'study':
      return '📚'
    default:
      return '🎯'
  }
}

function getHabitEmoji(habit) {
  return habit.emoji || getDefaultEmoji(habit.type)
}

function getHabitDisplayName(habit) {
  const rawName = String(habit.name || '').trim()
  const withoutLeadingTime = rawName.replace(/^\d{1,2}:\d{2}\s*/, '').trim()
  const withoutTrailingDuration = withoutLeadingTime.replace(/\s*\d+\s*분$/, '').trim()

  if (habit.type === 'wake') {
    return withoutLeadingTime.includes('하기') ? withoutLeadingTime : '기상하기'
  }

  if (habit.type === 'study' && withoutTrailingDuration === '독서') {
    return '독서하기'
  }

  return withoutTrailingDuration || rawName || '습관'
}

function defaultTargetForType(type) {
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

function defaultLogForType(type) {
  switch (type) {
    case 'wake':
      return { actualTime: '', progressPercent: 0 }
    case 'workout':
      return { bodyPart: '', weight: 0, reps: 0, sets: 0, progressPercent: 0 }
    case 'study':
      return { minutes: 0, progressPercent: 0 }
    default:
      return { progressPercent: 0, note: '' }
  }
}

function migrateHabit(habit) {
  if (habit.type) {
    return {
      ...habit,
      emoji: habit.emoji || getDefaultEmoji(habit.type),
      target: habit.target ?? defaultTargetForType(habit.type),
    }
  }

  return {
    ...habit,
    type: 'custom',
    emoji: habit.emoji || '🎯',
    target: { targetPercent: 100 },
  }
}

function normalizeSavedCompletions(completions, habitsById) {
  const normalized = {}

  Object.entries(completions ?? {}).forEach(([dateKey, entries]) => {
    normalized[dateKey] = {}

    Object.entries(entries ?? {}).forEach(([habitId, value]) => {
      const habitType = habitsById[habitId]?.type ?? 'custom'

      if (typeof value === 'object' && value !== null) {
        normalized[dateKey][habitId] = {
          ...defaultLogForType(habitType),
          ...value,
          progressPercent: normalizeProgress(value.progressPercent),
        }
        return
      }

      normalized[dateKey][habitId] = {
        ...defaultLogForType(habitType),
        progressPercent: normalizeProgress(value),
      }
    })
  })

  return normalized
}

function loadInitialState() {
  const fallback = { habits: [], completions: {}, memo: '' }
  const saved = window.localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return fallback
  }

  try {
    const parsed = JSON.parse(saved)
    const habits = (parsed.habits ?? []).map(migrateHabit)
    const habitsById = Object.fromEntries(habits.map((habit) => [habit.id, habit]))

    return {
      habits,
      completions: normalizeSavedCompletions(parsed.completions ?? {}, habitsById),
      memo: parsed.memo ?? '',
    }
  } catch {
    return fallback
  }
}

function getHabitLog(completions, dateKey, habit) {
  return {
    ...defaultLogForType(habit.type),
    ...(completions[dateKey]?.[habit.id] ?? {}),
  }
}

function getHabitMetrics(habit, log) {
  switch (habit.type) {
    case 'wake': {
      const targetMinutes = timeToMinutes(habit.target?.targetTime)
      const actualMinutes = timeToMinutes(log.actualTime)

      if (targetMinutes == null || actualMinutes == null) {
        return {
          progressPercent: 0,
          rewardGold: 0,
          rewardCrystal: 0,
          xp: 0,
          penalty: 0,
          detailText: '기상 시간이 아직 기록되지 않았어요.',
          doneCount: 0,
          leftCount: 1,
        }
      }

      const lateMinutes = Math.max(0, actualMinutes - targetMinutes)
      const progressPercent = lateMinutes === 0 ? 100 : Math.max(0, 100 - lateMinutes * 2)
      const rewardGold = Math.max(0, 34 - Math.floor(lateMinutes / 5) * 3)
      const rewardCrystal = lateMinutes === 0 ? 2 : progressPercent >= 80 ? 1 : 0
      const penalty = Math.floor(lateMinutes / 10)

      return {
        progressPercent: safePercent(progressPercent),
        rewardGold: Math.max(0, Math.round(safeNumber(rewardGold))),
        rewardCrystal: Math.max(0, Math.round(safeNumber(rewardCrystal))),
        xp: Math.max(0, Math.round(safeNumber(progressPercent))),
        penalty: Math.max(0, Math.round(safeNumber(penalty))),
        detailText:
          lateMinutes === 0
            ? '정시에 기상해서 보너스를 받았어요.'
            : `${lateMinutes}분 늦어서 보상이 조금 줄었어요.`,
        doneCount: progressPercent === 100 ? 1 : 0,
        leftCount: progressPercent === 100 ? 0 : 1,
      }
    }

    case 'workout': {
      const volume = Math.max(0, safeNumber(log.weight) * safeNumber(log.reps) * safeNumber(log.sets))
      const targetVolume = Math.max(1, safeNumber(habit.target?.targetVolume, 1))
      const progressPercent = safePercent((volume / targetVolume) * 100)

      return {
        progressPercent,
        rewardGold: Math.max(0, Math.floor(safeNumber(volume) / 120)),
        rewardCrystal: progressPercent >= 100 ? 2 : progressPercent >= 75 ? 1 : 0,
        xp: Math.max(0, Math.floor(safeNumber(volume) / 20)),
        penalty: 0,
        detailText: volume > 0 ? `${log.bodyPart || '운동'} 볼륨 ${volume}` : '운동 기록을 입력해 주세요.',
        doneCount: progressPercent === 100 ? 1 : 0,
        leftCount: progressPercent === 100 ? 0 : 1,
      }
    }

    case 'study': {
      const minutes = Math.max(0, safeNumber(log.minutes))
      const targetMinutes = Math.max(1, safeNumber(habit.target?.targetMinutes, 1))
      const progressPercent = safePercent((minutes / targetMinutes) * 100)

      return {
        progressPercent,
        rewardGold: Math.max(0, Math.floor(safeNumber(minutes) / 8)),
        rewardCrystal: progressPercent >= 100 ? 1 : 0,
        xp: Math.max(0, Math.floor(safeNumber(minutes) * 1.4)),
        penalty: 0,
        detailText: minutes > 0 ? `${minutes}분 공부했어요.` : '공부 시간을 입력해 주세요.',
        doneCount: progressPercent === 100 ? 1 : 0,
        leftCount: progressPercent === 100 ? 0 : 1,
      }
    }

    default: {
      const progressPercent = normalizeProgress(log.progressPercent)
      return {
        progressPercent,
        rewardGold: Math.max(0, Math.floor(safeNumber(progressPercent) / 5)),
        rewardCrystal: progressPercent >= 100 ? 1 : 0,
        xp: Math.max(0, Math.floor(safeNumber(progressPercent) * 0.8)),
        penalty: 0,
        detailText: `목표 대비 ${progressPercent}% 진행`,
        doneCount: progressPercent === 100 ? 1 : 0,
        leftCount: progressPercent === 100 ? 0 : 1,
      }
    }
  }
}

function calculateStreak(habit, completions, todayKey) {
  const anchor = parseDateKey(todayKey)
  let streak = 0

  for (let offset = 0; offset < 365; offset += 1) {
    const current = new Date(anchor)
    current.setDate(anchor.getDate() - offset)
    const dateKey = getDateKey(current)

    if (!isHabitScheduledForDate(habit, dateKey)) {
      continue
    }

    const progress = getHabitMetrics(habit, getHabitLog(completions, dateKey, habit)).progressPercent
    if (progress === 100) {
      streak += 1
      continue
    }

    break
  }

  return streak
}

function calculateHabitWeeklyRate(habit, completions, anchorDate = new Date()) {
  const recentDates = enumeratePastDates(7, anchorDate)
  const scheduledDates = recentDates.filter((dateKey) => isHabitScheduledForDate(habit, dateKey))

  if (scheduledDates.length === 0) {
    return 0
  }

  const totalProgress = scheduledDates.reduce((sum, dateKey) => {
    const metrics = getHabitMetrics(habit, getHabitLog(completions, dateKey, habit))
    return sum + metrics.progressPercent
  }, 0)

  return safePercent(totalProgress / scheduledDates.length)
}

function getCompletionCount(habit, completions) {
  return Object.keys(completions).filter((dateKey) => {
    const progress = getHabitMetrics(habit, getHabitLog(completions, dateKey, habit)).progressPercent
    return progress === 100
  }).length
}

function calculateDayRate(habits, completions, dateKey) {
  const scheduled = habits.filter((habit) => isHabitScheduledForDate(habit, dateKey))
  if (scheduled.length === 0) {
    return 0
  }

  const totalProgress = scheduled.reduce((sum, habit) => {
    const metrics = getHabitMetrics(habit, getHabitLog(completions, dateKey, habit))
    return sum + metrics.progressPercent
  }, 0)

  return safePercent(totalProgress / scheduled.length)
}

function calculateOverallWeeklyRate(habits, completions, anchorDate = new Date()) {
  const recentDates = enumeratePastDates(7, anchorDate)
  let scheduledCount = 0
  let totalProgress = 0

  recentDates.forEach((dateKey) => {
    const scheduledHabits = habits.filter((habit) => isHabitScheduledForDate(habit, dateKey))
    scheduledCount += scheduledHabits.length
    totalProgress += scheduledHabits.reduce((sum, habit) => {
      const metrics = getHabitMetrics(habit, getHabitLog(completions, dateKey, habit))
      return sum + metrics.progressPercent
    }, 0)
  })

  if (scheduledCount === 0) {
    return 0
  }

  return safePercent(totalProgress / scheduledCount)
}

function buildTrendData(habits, completions, anchorDate = new Date()) {
  return enumeratePastDates(30, anchorDate)
    .reverse()
    .map((dateKey) => ({
      dateKey,
      rate: calculateDayRate(habits, completions, dateKey),
      label: parseDateKey(dateKey).getDate(),
    }))
}

function buildTrendPath(points, width, height) {
  if (points.length === 0) {
    return ''
  }

  const stepX = points.length === 1 ? 0 : width / (points.length - 1)
  const coordinates = points.map((point, index) => ({
    x: index * stepX,
    y: height - (safePercent(point.rate) / 100) * height,
  }))

  if (coordinates.length === 1) {
    return `M ${coordinates[0].x} ${coordinates[0].y}`
  }

  return coordinates.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`
    }

    const previous = coordinates[index - 1]
    const controlDistance = (point.x - previous.x) * 0.46
    const controlOneX = previous.x + controlDistance
    const controlTwoX = point.x - controlDistance
    return `${path} C ${controlOneX} ${previous.y}, ${controlTwoX} ${point.y}, ${point.x} ${point.y}`
  }, '')
}

function buildCalendarDays(anchorDate, habits, completions, todayKey, selectedDateKey) {
  const year = anchorDate.getFullYear()
  const month = anchorDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = firstDay.getDay()
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(year, month, index - startOffset + 1)
    const dateKey = getDateKey(date)
    const inMonth = date.getMonth() === month
    const dayHabits = habits.filter((habit) => isHabitScheduledForDate(habit, dateKey))
    const totalProgress = dayHabits.reduce((sum, habit) => {
      const metrics = getHabitMetrics(habit, getHabitLog(completions, dateKey, habit))
      return sum + metrics.progressPercent
    }, 0)
    const averageProgress = dayHabits.length === 0 ? 0 : safePercent(totalProgress / dayHabits.length)

    return {
      dateKey,
      dayNumber: date.getDate(),
      inMonth,
      isToday: dateKey === todayKey,
      isSelected: dateKey === selectedDateKey,
      habitCount: dayHabits.length,
      averageProgress,
    }
  })
}

function calculateRpgProfile(habits, completions, todayKey, weeklyRate) {
  let gold = 0
  let crystals = 0
  let xp = 0
  let penalties = 0
  let totalStreak = 0

  Object.keys(completions).forEach((dateKey) => {
    habits.forEach((habit) => {
      const metrics = getHabitMetrics(habit, getHabitLog(completions, dateKey, habit))
      gold += safeNumber(metrics.rewardGold)
      crystals += safeNumber(metrics.rewardCrystal)
      xp += safeNumber(metrics.xp)
      penalties += safeNumber(metrics.penalty)
    })
  })

  habits.forEach((habit) => {
    totalStreak += safeNumber(calculateStreak(habit, completions, todayKey))
  })

  const safeWeeklyRate = safePercent(weeklyRate)
  const softenedXp = Math.max(0, safeNumber(xp) + safeWeeklyRate * 5 - safeNumber(penalties) * 4)
  const xpMax = 220
  const level = Math.max(1, Math.floor(softenedXp / xpMax) + 1)
  const stageIndex = Math.min(5, Math.floor((level - 1) / 3))
  const stage =
    stageIndex === 0
      ? '씨앗 슬라임'
      : stageIndex === 1
        ? '새싹 슬라임'
        : stageIndex === 2
          ? '말랑 슬라임'
          : stageIndex === 3
            ? '네온 슬라임'
            : stageIndex === 4
              ? '엘리트 슬라임'
              : '가디언 슬라임'

  return {
    stage,
    stageIndex,
    growthScale: Math.min(1.18, 0.82 + safeNumber(level, 1) * 0.028),
    maturityText:
      stageIndex === 0
        ? '아주 작은 시작 단계'
        : stageIndex === 1
          ? '조금씩 탄력이 붙는 단계'
          : stageIndex === 2
            ? '표정과 존재감이 커지는 단계'
            : stageIndex === 3
              ? '빛과 기운이 선명해지는 단계'
              : stageIndex === 4
                ? '든든한 동료로 자라는 단계'
                : '완전히 각성한 슬라임 단계',
    level,
    gold: Math.max(0, Math.round(safeNumber(gold) - safeNumber(penalties) * 3)),
    crystals: Math.max(0, Math.round(safeNumber(crystals))),
    energy: safePercent(safeWeeklyRate + Math.max(0, safeNumber(totalStreak) * 2 - safeNumber(penalties))),
    xpCurrent: Math.round(softenedXp % xpMax),
    xpMax,
    strength: Math.min(99, 10 + Math.floor(Math.sqrt(Math.max(0, safeNumber(gold))) / 1.8)),
    focus: Math.min(99, 10 + Math.floor(Math.sqrt(Math.max(0, softenedXp)) / 2.2)),
    discipline: Math.min(99, 10 + Math.floor(safeNumber(totalStreak) * 1.2)),
    vitality: Math.min(99, 10 + Math.floor(Math.max(0, safeWeeklyRate - safeNumber(penalties)) / 2.4)),
    penalties: Math.max(0, Math.round(safeNumber(penalties))),
  }
}

function getHabitTypeIcon(type) {
  switch (type) {
    case 'wake':
      return AlarmClock
    case 'workout':
      return Dumbbell
    case 'study':
      return BookOpen
    default:
      return Target
  }
}

function getMonthlySummary(habits, completions, anchorDate = new Date()) {
  const year = anchorDate.getFullYear()
  const month = anchorDate.getMonth()
  let scheduledCount = 0
  let totalProgress = 0

  const lastDay = new Date(year, month + 1, 0).getDate()
  for (let day = 1; day <= lastDay; day += 1) {
    const dateKey = getDateKey(new Date(year, month, day))
    const scheduledHabits = habits.filter((habit) => isHabitScheduledForDate(habit, dateKey))
    scheduledCount += scheduledHabits.length
    totalProgress += scheduledHabits.reduce((sum, habit) => {
      const metrics = getHabitMetrics(habit, getHabitLog(completions, dateKey, habit))
      return sum + metrics.progressPercent
    }, 0)
  }

  const percent = scheduledCount === 0 ? 0 : safePercent(totalProgress / scheduledCount)
  return {
    percent,
    done: Math.round((scheduledCount * percent) / 100),
    left: Math.max(0, scheduledCount - Math.round((scheduledCount * percent) / 100)),
  }
}

function getTopHabits(habits, completions, anchorDate = new Date()) {
  return habits
    .map((habit) => {
      const count = getCompletionCount(habit, completions)
      const weekly = calculateHabitWeeklyRate(habit, completions, anchorDate)
      return { ...habit, count, weekly }
    })
    .sort((left, right) => right.count - left.count || right.weekly - left.weekly)
    .slice(0, 8)
}

function getOverallRows(habits, completions, anchorDate = new Date()) {
  return habits
    .map((habit) => {
      const recentDates = enumeratePastDates(7, anchorDate).filter((dateKey) => isHabitScheduledForDate(habit, dateKey))
      const done = recentDates.filter((dateKey) => getHabitMetrics(habit, getHabitLog(completions, dateKey, habit)).progressPercent === 100).length
      const left = Math.max(0, recentDates.length - done)
      const percent = recentDates.length === 0 ? 0 : safePercent((done / recentDates.length) * 100)
      return { habit, done, left, percent }
    })
    .sort((left, right) => right.percent - left.percent)
}

function getWeeklyBlocks(habits, completions, anchorDate = new Date()) {
  const dates = enumeratePastDates(35, anchorDate).reverse()
  const weeks = []

  for (let index = 0; index < dates.length; index += 7) {
    const chunk = dates.slice(index, index + 7)
    const label = `W${Math.floor(index / 7) + 1}`
    const percent =
      chunk.length === 0
        ? 0
        : safePercent(chunk.reduce((sum, dateKey) => sum + calculateDayRate(habits, completions, dateKey), 0) / chunk.length)

    weeks.push({
      label,
      dates: chunk,
      percent,
    })
  }

  return weeks
}

function getHabitGoalLabel(habit) {
  if (habit.type === 'wake') {
    return `${habit.target?.targetTime ?? '07:00'} 기상`
  }

  if (habit.type === 'workout') {
    return `볼륨 ${safeNumber(habit.target?.targetVolume, 0)}`
  }

  if (habit.type === 'study') {
    return `${safeNumber(habit.target?.targetMinutes, 0)}분`
  }

  return formatPercent(habit.target?.targetPercent)
}

function getQuickHabitInitialState() {
  return Object.fromEntries(
    QUICK_HABITS.map((habit) => [
      habit.id,
      {
        ...habit.defaults,
      },
    ]),
  )
}

function App() {
  const [{ habits, completions, memo }, setState] = useState(loadInitialState)
  const [activeTab, setActiveTab] = useState('home')
  const [form, setForm] = useState({
    name: '',
    type: 'custom',
    color: COLOR_OPTIONS[0],
    emoji: '🎯',
    days: [1, 2, 3, 4, 5],
    targetTime: '07:00',
    targetVolume: 5000,
    targetMinutes: 90,
    targetPercent: 100,
  })
  const [quickSettings, setQuickSettings] = useState(getQuickHabitInitialState)
  const [selectedDateKey, setSelectedDateKey] = useState(getDateKey())

  const today = new Date()
  const todayKey = getDateKey(today)
  const calendarDays = buildCalendarDays(today, habits, completions, todayKey, selectedDateKey)
  const selectedDate = parseDateKey(selectedDateKey)
  const selectedHabits = habits.filter((habit) => isHabitScheduledForDate(habit, selectedDateKey))
  const todayHabits = habits.filter((habit) => isHabitScheduledForDate(habit, todayKey))
  const completedToday = todayHabits.filter((habit) => {
    const metrics = getHabitMetrics(habit, getHabitLog(completions, todayKey, habit))
    return metrics.progressPercent === 100
  }).length
  const todayRate = calculateDayRate(habits, completions, todayKey)
  const weeklyRate = calculateOverallWeeklyRate(habits, completions, today)
  const trendData = buildTrendData(habits, completions, today)
  const trendPath = buildTrendPath(trendData, 620, 120)
  const matrixDates = enumeratePastDates(35, today).reverse()
  const rpgProfile = calculateRpgProfile(habits, completions, todayKey, weeklyRate)
  const bestHabit = habits
    .map((habit) => ({
      ...habit,
      streak: calculateStreak(habit, completions, todayKey),
    }))
    .sort((left, right) => right.streak - left.streak)[0]
  const monthlySummary = getMonthlySummary(habits, completions, today)
  const topHabits = getTopHabits(habits, completions, today)
  const overallRows = getOverallRows(habits, completions, today)
  const weeklyBlocks = getWeeklyBlocks(habits, completions, today)
  const latestWeek = weeklyBlocks[weeklyBlocks.length - 1] ?? { label: '이번 주', dates: [], percent: 0 }
  const latestWeekDetails = latestWeek.dates.map((dateKey) => {
    const date = parseDateKey(dateKey)
    const dayHabits = habits.filter((habit) => isHabitScheduledForDate(habit, dateKey))
    const completedCount = dayHabits.filter((habit) => {
      const metrics = getHabitMetrics(habit, getHabitLog(completions, dateKey, habit))
      return metrics.progressPercent === 100
    }).length

    return {
      dateKey,
      date,
      rate: calculateDayRate(habits, completions, dateKey),
      habits: dayHabits.slice(0, 5).map((habit) => ({
        id: habit.id,
        name: getHabitDisplayName(habit),
        emoji: getHabitEmoji(habit),
        progress: getHabitMetrics(habit, getHabitLog(completions, dateKey, habit)).progressPercent,
      })),
      completedCount,
      totalCount: dayHabits.length,
    }
  })
  const matrixHabits = topHabits.slice(0, 6)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ habits, completions, memo }))
  }, [habits, completions, memo])

  function toggleDay(day) {
    setForm((current) => {
      const exists = current.days.includes(day)
      const nextDays = exists ? current.days.filter((item) => item !== day) : [...current.days, day].sort()
      return { ...current, days: nextDays }
    })
  }

  function updateFormField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
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

  function createTargetFromForm() {
    switch (form.type) {
      case 'wake':
        return { targetTime: form.targetTime }
      case 'workout':
        return { targetVolume: Number(form.targetVolume) || 5000 }
      case 'study':
        return { targetMinutes: Number(form.targetMinutes) || 90 }
      default:
        return { targetPercent: Number(form.targetPercent) || 100 }
    }
  }

  function handleCreateHabit(event) {
    event.preventDefault()
    const name = form.name.trim()
    if (!name || form.days.length === 0) {
      return
    }

    const nextHabit = {
      id: createId(),
      name,
      type: form.type,
      color: form.color,
      emoji: form.emoji || getDefaultEmoji(form.type),
      days: form.days,
      target: createTargetFromForm(),
      createdAt: new Date().toISOString(),
    }

    setState((current) => ({
      ...current,
      habits: [nextHabit, ...current.habits],
    }))

    setForm((current) => ({
      ...current,
      name: '',
      days: [1, 2, 3, 4, 5],
    }))
  }

  function addQuickHabit(template) {
    const settings = quickSettings[template.id] ?? template.defaults
    const subject = String(settings.subject ?? '').trim()
    const targetMinutes = Math.max(1, safeNumber(settings.targetMinutes, template.defaults.targetMinutes ?? 30))
    const targetTime = String(settings.targetTime ?? template.defaults.targetTime ?? '07:00')
    const targetVolume = Math.max(1, safeNumber(settings.targetVolume, template.defaults.targetVolume ?? 5000))
    const name =
      template.type === 'wake'
        ? '기상하기'
        : template.id === 'reading'
          ? '독서하기'
          : template.type === 'study'
            ? `${subject || '공부'} 공부하기`
            : template.name
    const target =
      template.type === 'wake'
        ? { targetTime }
        : template.type === 'workout'
          ? { targetVolume }
          : { targetMinutes }

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

    setState((current) => ({
      ...current,
      habits: [nextHabit, ...current.habits],
    }))
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

  function nudgeCustomProgress(habit, dateKey, direction) {
    const currentProgress = getHabitLog(completions, dateKey, habit).progressPercent
    const currentIndex = PROGRESS_STEPS.findIndex((step) => step === currentProgress)
    const safeIndex = currentIndex === -1 ? 0 : currentIndex
    const nextIndex = Math.max(0, Math.min(PROGRESS_STEPS.length - 1, safeIndex + direction))
    updateHabitLog(habit, dateKey, { progressPercent: PROGRESS_STEPS[nextIndex] })
  }

  function updateMemo(event) {
    setState((current) => ({
      ...current,
      memo: event.target.value,
    }))
  }

  function renderHabitCard(habit) {
    const HabitIcon = getHabitTypeIcon(habit.type)
    const log = getHabitLog(completions, selectedDateKey, habit)
    const metrics = getHabitMetrics(habit, log)

    return (
      <article key={habit.id} className={`habit-card ${metrics.progressPercent === 100 ? 'habit-card--done' : ''}`}>
        <span className="habit-accent" style={{ backgroundColor: habit.color }} />
        <div className="habit-main">
          <div className="habit-title-row">
            <div className="habit-title-group">
              <HabitIcon size={18} />
              <span className="habit-emoji" aria-hidden="true">{getHabitEmoji(habit)}</span>
              <strong>{getHabitDisplayName(habit)}</strong>
            </div>
            <span className="progress-pill">{formatPercent(metrics.progressPercent)}</span>
            <button
              type="button"
              className="icon-danger-button"
              onClick={() => deleteHabit(habit.id)}
              aria-label={`${habit.name} 삭제`}
              title="삭제"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="habit-meta">
            <span>
              <Flame size={14} />
              {calculateStreak(habit, completions, todayKey)}일 연속
            </span>
            <span>
              <TrendingUp size={14} />
              二쇨컙 {calculateHabitWeeklyRate(habit, completions, today)}%
            </span>
            <span>
              <Sparkles size={14} />
              골드 +{formatCount(metrics.rewardGold)}
            </span>
          </div>

          <div className="habit-detail-card">
            {habit.type === 'wake' && (
              <div className="detail-grid detail-grid--time">
                <label className="compact-field">
                  <span>목표 기상</span>
                  <input type="time" value={habit.target?.targetTime ?? '07:00'} disabled />
                </label>
                <label className="compact-field">
                  <span>실제 기상</span>
                  <input
                    type="time"
                    value={log.actualTime ?? ''}
                    onChange={(event) => updateHabitLog(habit, selectedDateKey, { actualTime: event.target.value })}
                  />
                </label>
              </div>
            )}

            {habit.type === 'workout' && (
              <div className="detail-grid detail-grid--workout">
                <label className="compact-field compact-field--wide">
                  <span>부위</span>
                  <input
                    type="text"
                    value={log.bodyPart}
                    placeholder="예: 하체"
                    onChange={(event) => updateHabitLog(habit, selectedDateKey, { bodyPart: event.target.value })}
                  />
                </label>
                <label className="compact-field">
                  <span>무게</span>
                  <input
                    type="number"
                    value={log.weight}
                    onChange={(event) => updateHabitLog(habit, selectedDateKey, { weight: Number(event.target.value) || 0 })}
                  />
                </label>
                <label className="compact-field">
                  <span>횟수</span>
                  <input
                    type="number"
                    value={log.reps}
                    onChange={(event) => updateHabitLog(habit, selectedDateKey, { reps: Number(event.target.value) || 0 })}
                  />
                </label>
                <label className="compact-field">
                  <span>세트</span>
                  <input
                    type="number"
                    value={log.sets}
                    onChange={(event) => updateHabitLog(habit, selectedDateKey, { sets: Number(event.target.value) || 0 })}
                  />
                </label>
                <div className="metric-inline">
                  <span>목표 볼륨</span>
                  <strong>{formatCount(habit.target?.targetVolume)}</strong>
                </div>
              </div>
            )}

            {habit.type === 'study' && (
              <div className="detail-grid detail-grid--study">
                <label className="compact-field">
                  <span>목표 시간</span>
                  <input type="number" value={formatCount(habit.target?.targetMinutes)} disabled />
                </label>
                <label className="compact-field">
                  <span>공부 시간(분)</span>
                  <input
                    type="number"
                  value={safeNumber(log.minutes)}
                    onChange={(event) => updateHabitLog(habit, selectedDateKey, { minutes: Number(event.target.value) || 0 })}
                  />
                </label>
              </div>
            )}

            {habit.type === 'custom' && (
              <div className="habit-progress-row">
                <button
                  type="button"
                  className="progress-button"
                  onClick={() => nudgeCustomProgress(habit, selectedDateKey, -1)}
                  aria-label={`${habit.name} 진행률 낮추기`}
                >
                  <ChevronDown size={16} />
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="25"
                  value={safePercent(log.progressPercent)}
                  className="progress-slider"
                  onChange={(event) =>
                    updateHabitLog(habit, selectedDateKey, {
                      progressPercent: Number(event.target.value),
                    })
                  }
                />
                <button
                  type="button"
                  className="progress-button"
                  onClick={() => nudgeCustomProgress(habit, selectedDateKey, 1)}
                  aria-label={`${habit.name} 진행률 높이기`}
                >
                  <ChevronUp size={16} />
                </button>
              </div>
            )}

            <p className="detail-text">{metrics.detailText}</p>
          </div>
        </div>
      </article>
    )
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">
            <Sparkles size={16} />
            해빗 플로우
          </p>
          <h1>습관과 성장을 한 화면에</h1>
          <p className="hero-date">{formatHeroDate(today)}</p>
        </div>

        <div className="tabs-bar" role="tablist" aria-label="메인 탭">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`tab-chip ${activeTab === tab.id ? 'tab-chip--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === 'home' && (
        <>
          <section className="panel dashboard-home">
            <div className="dashboard-home__header">
              <div>
                <p className="section-kicker">대시보드</p>
                <h2>한눈에 보는 전체 흐름</h2>
              </div>
              <span className="dashboard-home__meta">최근 30일 기준</span>
            </div>

            <div className="command-grid">
              <section className="dense-panel dense-panel--trend dense-panel--hero-chart">
                <div className="dense-panel__header">
                  <strong>일간 완료율</strong>
                  <span>{formatPercent(todayRate)}</span>
                </div>
                <div className="trend-chart">
                  <svg viewBox="0 0 620 120" className="trend-svg" preserveAspectRatio="none" aria-hidden="true">
                    {[0, 25, 50, 75, 100].map((tick) => {
                      const y = 120 - (tick / 100) * 120
                      return <line key={tick} x1="0" y1={y} x2="620" y2={y} className="trend-grid-line" />
                    })}
                    <path d={trendPath} className="trend-line" />
                  </svg>
                  <div className="trend-labels trend-labels--dense">
                    {trendData.map((point) => (
                      <span key={point.dateKey}>{point.label}</span>
                    ))}
                  </div>
                </div>
              </section>

              <section className="dense-panel dense-panel--ring dense-panel--month-progress">
                <div className="dense-panel__header">
                  <strong>월간 진행도</strong>
                  <span>{monthlySummary.percent}%</span>
                </div>
                <div className="gauge-wrap gauge-wrap--compact">
                  <div
                    className="radial-gauge radial-gauge--compact"
                    style={{
                      background: `conic-gradient(from -90deg, #d8ffb0 0deg, #86ff5d ${Math.max(0, safePercent(monthlySummary.percent) * 3.6 - 10)}deg, rgba(134,255,93,0.34) ${safePercent(monthlySummary.percent) * 3.6}deg, rgba(255,255,255,0.08) ${Math.min(360, safePercent(monthlySummary.percent) * 3.6 + 10)}deg 360deg)`,
                    }}
                  >
                    <div className="radial-gauge-inner">
                      <strong>{formatPercent(monthlySummary.percent)}</strong>
                  <span>{formatCount(monthlySummary.done)} 완료</span>
                    </div>
                  </div>
                </div>
                <div className="ring-meta">
                  <span>남음 {formatCount(monthlySummary.left)}</span>
                  <span>{formatMonthLabel(today)}</span>
                </div>
              </section>

              <section className="dense-panel dense-panel--weeks dense-panel--weekly-strip">
                <div className="dense-panel__header">
                  <strong>주간 요약 스트립</strong>
                  <span>{formatPercent(weeklyRate)}</span>
                </div>
                <div className="weeks-board">
                  {weeklyBlocks.map((week) => (
                    <article key={week.label} className="week-card">
                      <div className="week-card__top">
                        <span>{week.label}</span>
                        <strong>{formatPercent(week.percent)}</strong>
                      </div>
                      <div className="mini-bars">
                        {week.dates.map((dateKey) => (
                          <span
                            key={dateKey}
                            className="mini-bar"
                            style={{ height: `${Math.max(10, safePercent(calculateDayRate(habits, completions, dateKey)))}%` }}
                          />
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="dense-panel dense-panel--leaderboard dense-panel--rank">
                <div className="dense-panel__header">
                  <strong>상위 습관</strong>
                  <span>TOP {topHabits.length}</span>
                </div>
                <div className="leaderboard-list">
                  {topHabits.length === 0 ? (
                    <p className="muted-copy">아직 집계된 습관이 없어요.</p>
                  ) : (
                    topHabits.map((habit, index) => (
                      <div key={habit.id} className="leaderboard-row">
                        <span className="leaderboard-rank">{index + 1}</span>
                        <span className="leaderboard-name">
                          <span className="leaderboard-badge">
                            {index === 0 ? <Trophy size={13} /> : <Target size={13} />}
                          </span>
                          <span className="habit-emoji" aria-hidden="true">{getHabitEmoji(habit)}</span>
                          {getHabitDisplayName(habit)}
                        </span>
                        <strong className="leaderboard-score">{formatCount(habit.count)}</strong>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="dense-panel dense-panel--daily dense-panel--habit-table">
                <div className="dense-panel__header">
                  <strong>오늘의 습관</strong>
                  <span>{todayHabits.length}개</span>
                </div>
                <div className="table-head table-head--daily">
                  <span>이름</span>
                  <span>목표</span>
                  <span>오늘</span>
                </div>
                <div className="table-body">
                  {todayHabits.length === 0 ? (
                    <p className="muted-copy">오늘 일정에 잡힌 습관이 없어요.</p>
                  ) : (
                    todayHabits.map((habit) => {
                      const metrics = getHabitMetrics(habit, getHabitLog(completions, todayKey, habit))
                      return (
                        <div key={habit.id} className="table-row table-row--daily">
                          <span><span className="habit-emoji" aria-hidden="true">{getHabitEmoji(habit)}</span>{getHabitDisplayName(habit)}</span>
                          <span>{getHabitGoalLabel(habit)}</span>
                          <span>{formatPercent(metrics.progressPercent)}</span>
                        </div>
                      )
                    })
                  )}
                </div>
              </section>

              <section className="dense-panel dense-panel--overall dense-panel--overall-board">
                <div className="dense-panel__header">
                  <strong>전체 진행률</strong>
                  <span>주간 기준</span>
                </div>
                <div className="table-head table-head--overall">
                  <span>습관</span>
                  <span>완료</span>
                  <span>남음</span>
                  <span>%</span>
                  <span>바</span>
                </div>
                <div className="table-body">
                  {overallRows.length === 0 ? (
                    <p className="muted-copy">표시할 집계 데이터가 아직 없어요.</p>
                  ) : (
                    overallRows.map(({ habit, done, left, percent }) => (
                      <div key={habit.id} className="table-row table-row--overall">
                        <span className="overall-habit-name"><span className="habit-emoji" aria-hidden="true">{getHabitEmoji(habit)}</span>{getHabitDisplayName(habit)}</span>
                        <span className="good">{formatCount(done)}</span>
                        <span className="bad">{formatCount(left)}</span>
                        <span>{formatPercent(percent)}</span>
                        <span className="row-progress">
                          <span style={{ width: formatPercent(percent) }} />
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="dense-panel dense-panel--matrix dense-panel--history">
                <div className="dense-panel__header">
                  <strong>실행 히스토리</strong>
                  <span>최근 35일</span>
                </div>

                {matrixHabits.length === 0 ? (
                  <p className="muted-copy">먼저 습관을 추가하면 히스토리 보드가 채워져요.</p>
                ) : (
                  <div className="mini-matrix">
                    <div className="mini-matrix__header">
                      <span>습관</span>
                      <div className="mini-matrix__dates">
                        {matrixDates.map((dateKey) => (
                          <span key={dateKey}>{parseDateKey(dateKey).getDate()}</span>
                        ))}
                      </div>
                    </div>

                    {matrixHabits.map((habit) => (
                      <div key={habit.id} className="mini-matrix__row">
                        <span className="mini-matrix__label"><span className="habit-emoji" aria-hidden="true">{getHabitEmoji(habit)}</span>{getHabitDisplayName(habit)}</span>
                        <div className="mini-matrix__cells">
                          {matrixDates.map((dateKey) => {
                            const scheduled = isHabitScheduledForDate(habit, dateKey)
                            const progress = getHabitMetrics(habit, getHabitLog(completions, dateKey, habit)).progressPercent

                            return (
                              <span
                                key={`${habit.id}-${dateKey}`}
                                className={[
                                  'mini-matrix__cell',
                                  scheduled ? 'mini-matrix__cell--scheduled' : '',
                                  progress === 100 ? 'mini-matrix__cell--done' : '',
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                            style={getProgressCellStyle(progress, scheduled)}
                              >
                                {scheduled && safePercent(progress) === 100 ? '✓' : ''}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="dense-panel dense-panel--week-detail">
                <div className="dense-panel__header">
                  <strong>{latestWeek.label} 디테일</strong>
                  <span>{formatPercent(latestWeek.percent)}</span>
                </div>

                <div className="week-detail-grid">
                  {latestWeekDetails.map((day) => (
                    <article
                      key={day.dateKey}
                      className={`day-detail-card ${day.dateKey === todayKey ? 'day-detail-card--today' : ''}`}
                    >
                      <div className="day-detail-card__head">
                        <strong>{WEEKDAY_LABELS[day.date.getDay()]}</strong>
                        <span>{`${day.date.getMonth() + 1}.${day.date.getDate()}`}</span>
                      </div>

                      <div className="day-ring">
                        <div
                          className="day-ring__track"
                          style={{
                            background: `conic-gradient(from -90deg, #d8ffb0 0deg, #86ff5d ${Math.max(0, safePercent(day.rate) * 3.6 - 8)}deg, rgba(134,255,93,0.34) ${safePercent(day.rate) * 3.6}deg, rgba(255,255,255,0.08) ${Math.min(360, safePercent(day.rate) * 3.6 + 8)}deg 360deg)`,
                          }}
                        >
                          <div className="day-ring__inner">{formatPercent(day.rate)}</div>
                        </div>
                      </div>

                      <div className="day-task-list">
                        {day.habits.length === 0 ? (
                          <span className="day-task-list__empty">예정된 습관 없음</span>
                        ) : (
                          day.habits.map((habit) => (
                            <div key={habit.id} className="day-task-row">
                              <span className="day-task-row__name"><span className="habit-emoji" aria-hidden="true">{habit.emoji}</span>{habit.name}</span>
                              <span className={`day-task-row__value ${habit.progress === 100 ? 'is-done' : ''}`}>
                                {formatPercent(habit.progress)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="day-detail-card__foot">
                        <span>완료 {formatCount(day.completedCount)}</span>
                        <span>총 {formatCount(day.totalCount)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </section>
        </>
      )}

      {activeTab === 'habits' && (
        <>
          <section className="panel">
            <div className="section-header">
              <div>
                <p className="section-kicker">빠른 추가</p>
                <h2>자주 쓰는 습관</h2>
              </div>
              <Plus size={18} />
            </div>

            <div className="quick-habit-grid">
              {QUICK_HABITS.map((habit) => {
                const settings = quickSettings[habit.id] ?? habit.defaults
                return (
                  <article key={habit.id} className="quick-habit-card">
                    <div className="quick-habit-card__head">
                      <strong><span className="habit-emoji" aria-hidden="true">{habit.emoji}</span>{habit.name}</strong>
                      <span>{HABIT_TYPES.find((item) => item.value === habit.type)?.label}</span>
                    </div>

                    {habit.type === 'wake' && (
                      <label className="quick-field">
                        <span>목표 기상 시간</span>
                        <input
                          type="time"
                          value={settings.targetTime ?? '07:00'}
                          onChange={(event) => updateQuickSetting(habit.id, 'targetTime', event.target.value)}
                        />
                      </label>
                    )}

                    {habit.type === 'workout' && (
                      <label className="quick-field">
                        <span>목표 운동 볼륨</span>
                        <input
                          type="number"
                          min="1"
                  value={safeNumber(settings.targetVolume, 5000)}
                          onChange={(event) => updateQuickSetting(habit.id, 'targetVolume', event.target.value)}
                        />
                      </label>
                    )}

                    {habit.type === 'study' && (
                      <div className="quick-field-grid">
                        <label className="quick-field">
                          <span>{habit.id === 'reading' ? '읽을 내용' : '공부할 내용'}</span>
                          <input
                            type="text"
                            value={settings.subject ?? ''}
                            onChange={(event) => updateQuickSetting(habit.id, 'subject', event.target.value)}
                            placeholder={habit.id === 'reading' ? '예: 경제 책' : '예: 영어 단어'}
                          />
                        </label>
                        <label className="quick-field">
                          <span>목표 시간(분)</span>
                          <input
                            type="number"
                            min="1"
                            value={safeNumber(settings.targetMinutes, 30)}
                            onChange={(event) => updateQuickSetting(habit.id, 'targetMinutes', event.target.value)}
                          />
                        </label>
                      </div>
                    )}

                    <button type="button" className="quick-add-button" onClick={() => addQuickHabit(habit)}>
                      <Plus size={16} />
                      추가
                    </button>
                  </article>
                )
              })}
            </div>
          </section>

          <section className="panel">
            <div className="section-header">
              <div>
                <p className="section-kicker">직접 추가</p>
                <h2>새 습관 만들기</h2>
              </div>
              <Plus size={18} />
            </div>

            <form className="habit-form" onSubmit={handleCreateHabit}>
              <label className="field">
                <span>습관 이름</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateFormField('name', event.target.value)}
                  placeholder="예: 하체 운동"
                />
              </label>

              <div className="form-split">
                <label className="field">
                  <span>습관 유형</span>
                  <select
                    className="select-field"
                    value={form.type}
                    onChange={(event) => updateFormField('type', event.target.value)}
                  >
                    {HABIT_TYPES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>이모지</span>
                  <div className="emoji-row">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={`emoji-chip ${form.emoji === emoji ? 'emoji-chip--active' : ''}`}
                        onClick={() => updateFormField('emoji', emoji)}
                        aria-label={`${emoji} 이모지 선택`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </label>
              </div>

              <div className="form-split">
                <label className="field">
                  <span>강조 색상</span>
                  <div className="color-row">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`color-swatch ${form.color === color ? 'color-swatch--active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateFormField('color', color)}
                        aria-label={`${color} 색상 선택`}
                      />
                    ))}
                  </div>
                </label>
              </div>

              <div className="field">
                <span>반복 요일</span>
                <div className="day-grid">
                  {WEEKDAY_LABELS.map((label, index) => {
                    const active = form.days.includes(index)
                    return (
                      <button
                        key={label}
                        type="button"
                        className={`day-chip ${active ? 'day-chip--active' : ''}`}
                        onClick={() => toggleDay(index)}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {form.type === 'wake' && (
                <label className="field">
                  <span>목표 기상 시간</span>
                  <input
                    type="time"
                    value={form.targetTime}
                    onChange={(event) => updateFormField('targetTime', event.target.value)}
                  />
                </label>
              )}

              {form.type === 'workout' && (
                <label className="field">
                  <span>목표 볼륨</span>
                  <input
                    type="number"
                    value={safeNumber(form.targetVolume, 5000)}
                    onChange={(event) => updateFormField('targetVolume', event.target.value)}
                  />
                </label>
              )}

              {form.type === 'study' && (
                <label className="field">
                  <span>목표 공부 시간(분)</span>
                  <input
                    type="number"
                    value={safeNumber(form.targetMinutes, 90)}
                    onChange={(event) => updateFormField('targetMinutes', event.target.value)}
                  />
                </label>
              )}

              {form.type === 'custom' && (
                <label className="field">
                  <span>목표 퍼센트 기준</span>
                  <input
                    type="number"
                    value={safeNumber(form.targetPercent, 100)}
                    onChange={(event) => updateFormField('targetPercent', event.target.value)}
                  />
                </label>
              )}

              <button className="primary-button" type="submit">
                <Plus size={18} />
                습관 추가
              </button>
            </form>
          </section>

          <section className="panel">
            <div className="section-header">
              <div>
                <p className="section-kicker">수정</p>
                <h2>등록된 습관 관리</h2>
              </div>
              <ClipboardList size={18} />
            </div>

            <div className="manage-list">
              {habits.length === 0 ? (
                <div className="empty-card">
                  <p>아직 등록된 습관이 없어요.</p>
                  <span>빠른 추가나 직접 추가로 먼저 습관을 만들어 보세요.</span>
                </div>
              ) : (
                habits.map((habit) => (
                  <article key={habit.id} className="manage-row">
                    <span className="overview-dot" style={{ backgroundColor: habit.color }} />
                    <div>
                      <strong><span className="habit-emoji" aria-hidden="true">{getHabitEmoji(habit)}</span>{getHabitDisplayName(habit)}</strong>
                      <span>{HABIT_TYPES.find((item) => item.value === habit.type)?.label} · {getHabitGoalLabel(habit)}</span>
                    </div>
                    <button
                      type="button"
                      className="icon-danger-button"
                      onClick={() => deleteHabit(habit.id)}
                      aria-label={`${habit.name} 삭제`}
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>
        </>
      )}

      {activeTab === 'records' && (
        <>
          <section className="panel">
            <div className="section-header">
              <div>
                <p className="section-kicker">오늘 기록</p>
                <h2>{selectedDateKey === todayKey ? '오늘의 일정' : formatHeroDate(selectedDate)}</h2>
              </div>
              <ClipboardList size={18} />
            </div>

            <div className="schedule-head">
              <strong>{selectedDateKey === todayKey ? '오늘' : formatHeroDate(selectedDate)}</strong>
              <span>{formatPercent(calculateDayRate(habits, completions, selectedDateKey))} 완료</span>
            </div>

            <div className="habit-list">
              {selectedHabits.length === 0 ? (
                <div className="empty-card">
                  <p>예정된 일이 없어요.</p>
                  <span>습관 관리 탭에서 먼저 습관을 추가해 보세요.</span>
                </div>
              ) : (
                selectedHabits.map(renderHabitCard)
              )}
            </div>
          </section>

          <section className="panel">
            <div className="section-header">
              <div>
                <p className="section-kicker">기록 보드</p>
                <h2>최근 35일 실행 기록</h2>
              </div>
              <TrendingUp size={18} />
            </div>

            <div className="matrix-header">
              <span>습관</span>
              <div className="matrix-days">
                {matrixDates.map((dateKey) => (
                  <span key={dateKey}>{parseDateKey(dateKey).getDate()}</span>
                ))}
              </div>
            </div>

            <div className="overview-list">
              {habits.length === 0 ? (
                <div className="empty-card">
                  <p>아직 습관이 없어요.</p>
                  <span>빠른 추가나 직접 추가로 첫 습관을 만들어 보세요.</span>
                </div>
              ) : (
                habits.map((habit) => (
                  <article key={habit.id} className="overview-card overview-card--matrix">
                    <div className="overview-top">
                      <span className="overview-dot" style={{ backgroundColor: habit.color }} />
                      <strong><span className="habit-emoji" aria-hidden="true">{getHabitEmoji(habit)}</span>{getHabitDisplayName(habit)}</strong>
                      <button
                        type="button"
                        className="icon-danger-button"
                        onClick={() => deleteHabit(habit.id)}
                        aria-label={`${habit.name} 삭제`}
                        title="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="matrix-row">
                      {matrixDates.map((dateKey) => {
                        const scheduled = isHabitScheduledForDate(habit, dateKey)
                        const progress = getHabitMetrics(habit, getHabitLog(completions, dateKey, habit)).progressPercent

                        return (
                          <span
                            key={dateKey}
                            className={[
                              'matrix-cell',
                              scheduled ? 'matrix-cell--scheduled' : '',
                              progress === 100 ? 'matrix-cell--done' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            style={getProgressCellStyle(progress, scheduled)}
                          >
                            {scheduled && safePercent(progress) === 100 ? '✓' : ''}
                          </span>
                        )
                      })}
                    </div>
                    <div className="overview-stats">
                      <span>{calculateStreak(habit, completions, todayKey)}일 연속</span>
                      <span>주간 {formatPercent(calculateHabitWeeklyRate(habit, completions, today))}</span>
                      <span>총 {formatCount(getCompletionCount(habit, completions))}회 완전 달성</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </>
      )}

      {activeTab === 'companion' && (
        <section className="panel character-panel">
          <div className="section-header">
            <div>
              <p className="section-kicker">동료</p>
              <h2>슬라임 성장 보드</h2>
            </div>
            <MoonStar size={18} />
          </div>

          <div className="character-layout">
            <div className="character-visual-card">
              <div className={`slime-stage-frame slime-stage-frame--${rpgProfile.stageIndex + 1}`}>
                <div className="slime-aura" />
                <img
                  src={habitBuddySlimeCute}
                  alt="성장형 슬라임 동료"
                  className="character-image"
                  style={{ '--slime-scale': rpgProfile.growthScale }}
                />
              </div>
              <div className="character-caption">
                <strong>{rpgProfile.stage} Lv. {rpgProfile.level}</strong>
                <span>{rpgProfile.maturityText}</span>
              </div>
            </div>

            <div className="character-stats-panel">
              <div className="currency-grid">
                <article className="currency-card">
                  <strong>{formatCount(rpgProfile.gold)}</strong>
                  <span>골드</span>
                </article>
                <article className="currency-card">
                  <strong>{formatCount(rpgProfile.crystals)}</strong>
                  <span>크리스탈</span>
                </article>
                <article className="currency-card">
                  <strong>{formatPercent(rpgProfile.energy)}</strong>
                  <span>에너지</span>
                </article>
              </div>

              <div className="xp-panel">
                <div className="schedule-head">
                  <strong>다음 레벨까지 XP</strong>
                  <span>
                    {formatCount(rpgProfile.xpCurrent)}/{formatCount(rpgProfile.xpMax, 220)}
                  </span>
                </div>
                <div className="progress-bar">
                  <span style={{ width: formatPercent((safeNumber(rpgProfile.xpCurrent) / safeNumber(rpgProfile.xpMax, 220)) * 100) }} />
                </div>
              </div>

              <div className="stat-board">
                <article className="stat-row">
                  <span>근성</span>
                  <strong>{formatCount(rpgProfile.strength)}</strong>
                </article>
                <article className="stat-row">
                  <span>집중력</span>
                  <strong>{formatCount(rpgProfile.focus)}</strong>
                </article>
                <article className="stat-row">
                  <span>규율</span>
                  <strong>{formatCount(rpgProfile.discipline)}</strong>
                </article>
                <article className="stat-row">
                  <span>체력</span>
                  <strong>{formatCount(rpgProfile.vitality)}</strong>
                </article>
              </div>

              <div className="summary-list">
                <article className="summary-item">
                  <strong>{formatCount(rpgProfile.level, 1)}</strong>
                  <span>현재 레벨</span>
                </article>
                <article className="summary-item">
                  <strong>{formatCount(safeNumber(rpgProfile.stageIndex) + 1, 1)}</strong>
                  <span>성장 단계</span>
                </article>
                <article className="summary-item">
                  <strong>{formatCount(rpgProfile.penalties)}</strong>
                  <span>누적 패널티</span>
                </article>
              </div>

              <p className="summary-highlight">
                기상은 정시 보상과 지각 패널티, 운동은 볼륨 기반 보상, 공부는 시간 기반 보상으로 연결됩니다.
              </p>

              <div className="reward-guide">
                <article className="reward-guide-card">
                  <strong>골드</strong>
                  <p>일반 할 일, 정시 기상, 운동 볼륨, 공부 시간에서 조금씩 얻습니다. 일을 해낸 총량을 보여주는 기본 재화예요.</p>
                </article>
                <article className="reward-guide-card">
                  <strong>에너지</strong>
                  <p>운동 기록과 주간 완료율, 연속 달성일이 높을수록 잘 유지됩니다. 하루 컨디션과 활동성을 나타내는 값으로 쓰면 좋아요.</p>
                </article>
                <article className="reward-guide-card">
                  <strong>경험치</strong>
                  <p>공부 시간, 운동 볼륨, 기상 성공, 일반 습관 진행률이 모두 누적됩니다. 슬라임 레벨과 성장 단계에 직접 연결됩니다.</p>
                </article>
                <article className="reward-guide-card">
                  <strong>크리스탈</strong>
                  <p>목표를 100% 달성하거나 기상 시간을 잘 지킨 날처럼 품질이 좋은 기록에서 얻습니다. 희귀 보상이나 진화 재료로 쓰기 좋습니다.</p>
                </article>
                <article className="reward-guide-card reward-guide-card--warning">
                  <strong>패널티</strong>
                  <p>기상 시간이 늦어질수록 조금씩 쌓입니다. 누적되면 골드와 경험치 성장 효율이 줄어드는 방향으로 반영됩니다.</p>
                </article>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

export default App


