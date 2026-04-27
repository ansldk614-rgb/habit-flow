import { AlarmClock, BookOpen, Dumbbell, Target } from 'lucide-react'
import { enumeratePastDates, getDateKey, parseDateKey, timeToMinutes } from './dateUtils'

export function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function normalizeProgress(value) {
  if (value === true) {
    return 100
  }
  if (value === false || value == null) {
    return 0
  }
  return Math.max(0, Math.min(100, Number(value) || 0))
}

export function safeNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

export function safePercent(value) {
  return Math.max(0, Math.min(100, Math.round(safeNumber(value, 0))))
}

export function formatPercent(value) {
  return `${safePercent(value)}%`
}

export function formatCount(value, fallback = 0) {
  return String(Math.max(0, Math.round(safeNumber(value, fallback))))
}

export function getProgressCellStyle(progress, scheduled) {
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

export function getDefaultEmoji(type) {
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

export function getHabitEmoji(habit) {
  return habit.emoji || getDefaultEmoji(habit.type)
}

export function getHabitDisplayName(habit) {
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

export function defaultTargetForType(type) {
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

export function defaultLogForType(type) {
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

export function migrateHabit(habit) {
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

export function normalizeSavedCompletions(completions, habitsById) {
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

export function getHabitLog(completions, dateKey, habit) {
  return {
    ...defaultLogForType(habit.type),
    ...(completions[dateKey]?.[habit.id] ?? {}),
  }
}

export function getHabitMetrics(habit, log) {
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

export function getHabitDayIndex(dateKey) {
  return parseDateKey(dateKey).getDay()
}

export function isHabitScheduledForDate(habit, dateKey) {
  return habit.days.includes(getHabitDayIndex(dateKey))
}

export function calculateStreak(habit, completions, todayKey) {
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

export function calculateHabitWeeklyRate(habit, completions, anchorDate = new Date()) {
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

export function getCompletionCount(habit, completions) {
  return Object.keys(completions).filter((dateKey) => {
    const progress = getHabitMetrics(habit, getHabitLog(completions, dateKey, habit)).progressPercent
    return progress === 100
  }).length
}

export function calculateDayRate(habits, completions, dateKey) {
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

export function calculateOverallWeeklyRate(habits, completions, anchorDate = new Date()) {
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

export function buildTrendData(habits, completions, anchorDate = new Date()) {
  return enumeratePastDates(30, anchorDate)
    .reverse()
    .map((dateKey) => ({
      dateKey,
      rate: calculateDayRate(habits, completions, dateKey),
      label: parseDateKey(dateKey).getDate(),
    }))
}

export function buildTrendPath(points, width, height) {
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

export function buildCalendarDays(anchorDate, habits, completions, todayKey, selectedDateKey) {
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

export function getHabitTypeIcon(type) {
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

export function getMonthlySummary(habits, completions, anchorDate = new Date()) {
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

export function getTopHabits(habits, completions, anchorDate = new Date()) {
  return habits
    .map((habit) => {
      const count = getCompletionCount(habit, completions)
      const weekly = calculateHabitWeeklyRate(habit, completions, anchorDate)
      return { ...habit, count, weekly }
    })
    .sort((left, right) => right.count - left.count || right.weekly - left.weekly)
    .slice(0, 8)
}

export function getOverallRows(habits, completions, anchorDate = new Date()) {
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

export function getWeeklyBlocks(habits, completions, anchorDate = new Date()) {
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

export function getHabitGoalLabel(habit) {
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