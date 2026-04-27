import { getDateKey, parseDateKey } from './dateUtils'
import {
  getHabitDisplayName,
  getHabitEmoji,
  getHabitLog,
  getHabitMetrics,
  isHabitScheduledForDate,
  safeNumber,
  safePercent,
} from './habitUtils'

const RECENT_DAYS = 28
const WEEK_DAYS = 7

const shortRangeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'numeric',
  day: 'numeric',
})

const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
})

function ensureArray(value) {
  return Array.isArray(value) ? value : []
}

function ensureObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function getStartOfDay(date = new Date()) {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

function isHabitDone(habit, completions, dateKey) {
  const log = getHabitLog(ensureObject(completions), dateKey, habit)
  const metrics = getHabitMetrics(habit, log)
  return safePercent(metrics.progressPercent) >= 100
}

function getRecentHabitScheduledDates(habit, today = new Date()) {
  return getRecentFourWeekDates(today).filter((dateKey) => isHabitScheduledForDate(habit, dateKey))
}

export function getRecentFourWeekDates(today = new Date()) {
  const anchorDate = getStartOfDay(today)

  return Array.from({ length: RECENT_DAYS }, (_, index) => {
    const current = new Date(anchorDate)
    current.setDate(anchorDate.getDate() - (RECENT_DAYS - 1 - index))
    return getDateKey(current)
  })
}

export function getRecentFourWeeks(today = new Date()) {
  const dates = getRecentFourWeekDates(today)

  return Array.from({ length: 4 }, (_, index) => {
    const weekDates = dates.slice(index * WEEK_DAYS, (index + 1) * WEEK_DAYS)

    return {
      label: index === 3 ? 'This Week' : `Week ${index + 1}`,
      weekNumber: index + 1,
      startDate: weekDates[0] ?? '',
      endDate: weekDates.at(-1) ?? '',
      dates: weekDates,
    }
  })
}

export function getRecentPeriodLabel(today = new Date()) {
  const dates = getRecentFourWeekDates(today)
  const startDate = dates[0] ? parseDateKey(dates[0]) : getStartOfDay(today)
  const endDate = dates.at(-1) ? parseDateKey(dates.at(-1)) : getStartOfDay(today)

  return `${shortRangeFormatter.format(startDate)} - ${shortRangeFormatter.format(endDate)}`
}

export function calculateRecentDailyCompletionRate(habits, completions, dateKey) {
  const scheduledHabits = ensureArray(habits).filter((habit) => isHabitScheduledForDate(habit, dateKey))
  const total = scheduledHabits.length
  const done = scheduledHabits.filter((habit) => isHabitDone(habit, completions, dateKey)).length

  return {
    done,
    total,
    rate: total === 0 ? 0 : safePercent((done / total) * 100),
  }
}

export function calculateRecentFourWeekProgress(habits, completions, today = new Date()) {
  return getRecentFourWeekDates(today).reduce(
    (progress, dateKey) => {
      const daily = calculateRecentDailyCompletionRate(habits, completions, dateKey)
      const done = progress.done + daily.done
      const total = progress.total + daily.total

      return {
        done,
        total,
        left: Math.max(0, total - done),
        percent: total === 0 ? 0 : safePercent((done / total) * 100),
      }
    },
    { done: 0, total: 0, left: 0, percent: 0 },
  )
}

export function getEffectiveRecentGoal(habit) {
  const monthlyGoal = safeNumber(habit?.monthlyGoal, 0)

  if (monthlyGoal > 0) {
    return Math.min(RECENT_DAYS, monthlyGoal)
  }

  return RECENT_DAYS
}

export function calculateRecentHabitProgress(habit, completions, today = new Date()) {
  const scheduledDates = getRecentHabitScheduledDates(habit, today)
  const done = scheduledDates.filter((dateKey) => isHabitDone(habit, completions, dateKey)).length
  const target = getEffectiveRecentGoal(habit)

  return {
    habit,
    done,
    target,
    left: Math.max(0, target - done),
    percent: target === 0 ? 0 : safePercent((done / target) * 100),
  }
}

export function getRecentDailyChartData(habits, completions, today = new Date()) {
  return getRecentFourWeekDates(today).map((dateKey) => {
    const date = parseDateKey(dateKey)
    const daily = calculateRecentDailyCompletionRate(habits, completions, dateKey)

    return {
      date: dateKey,
      dateKey,
      day: date.getDate(),
      label: shortDateFormatter.format(date),
      weekday: weekdayFormatter.format(date),
      rate: daily.rate,
      done: daily.done,
      total: daily.total,
    }
  })
}

export function getRecentTopHabits(habits, completions, today = new Date()) {
  return ensureArray(habits)
    .map((habit) => {
      const progress = calculateRecentHabitProgress(habit, completions, today)

      return {
        ...habit,
        done: progress.done,
        left: progress.left,
        target: progress.target,
        percent: progress.percent,
      }
    })
    .sort((left, right) => right.done - left.done || right.percent - left.percent || getHabitDisplayName(left).localeCompare(getHabitDisplayName(right)))
}

export function getRecentOverallProgressRows(habits, completions, today = new Date()) {
  return ensureArray(habits).map((habit) => {
    const progress = calculateRecentHabitProgress(habit, completions, today)

    return {
      id: habit.id,
      emoji: getHabitEmoji(habit),
      name: getHabitDisplayName(habit),
      done: progress.done,
      left: progress.left,
      percent: progress.percent,
      target: progress.target,
    }
  })
}
