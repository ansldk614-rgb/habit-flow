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

function ensureArray(value) {
  return Array.isArray(value) ? value : []
}

function ensureObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function getScheduledHabits(habits, dateKey) {
  return ensureArray(habits).filter((habit) => isHabitScheduledForDate(habit, dateKey))
}

function isHabitDone(habit, completions, dateKey) {
  const metrics = getHabitMetrics(habit, getHabitLog(ensureObject(completions), dateKey, habit))
  return safePercent(metrics.progressPercent) >= 100
}

function getCompletedHabitCount(habits, completions, dateKey) {
  return getScheduledHabits(habits, dateKey).filter((habit) => isHabitDone(habit, completions, dateKey)).length
}

function getHabitScheduledDates(habit, year, month) {
  return getMonthDates(year, month).filter((dateKey) => isHabitScheduledForDate(habit, dateKey))
}

export function getMonthDates(year, month) {
  const monthIndex = safeNumber(month, 0)
  const lastDay = new Date(year, monthIndex + 1, 0).getDate()

  return Array.from({ length: lastDay }, (_, index) => getDateKey(new Date(year, monthIndex, index + 1)))
}

export function getMonthWeeks(year, month) {
  const monthDates = getMonthDates(year, month)
  const weeks = []

  monthDates.forEach((dateKey) => {
    const day = parseDateKey(dateKey).getDate()
    const weekIndex = Math.floor((day - 1) / 7)

    if (!weeks[weekIndex]) {
      weeks[weekIndex] = {
        label: `Week ${weekIndex + 1}`,
        weekNumber: weekIndex + 1,
        dates: [],
      }
    }

    weeks[weekIndex].dates.push(dateKey)
  })

  return weeks
}

export function calculateDailyCompletionRate(habits, completions, dateKey) {
  const scheduledHabits = getScheduledHabits(habits, dateKey)
  const total = scheduledHabits.length

  if (total === 0) {
    return 0
  }

  const done = getCompletedHabitCount(scheduledHabits, completions, dateKey)
  return safePercent((done / total) * 100)
}

export function calculateWeeklyCompletionRate(habits, completions, weekDates) {
  const dates = ensureArray(weekDates)

  if (dates.length === 0) {
    return 0
  }

  const totalRate = dates.reduce((sum, dateKey) => sum + calculateDailyCompletionRate(habits, completions, dateKey), 0)
  return safePercent(totalRate / dates.length)
}

export function calculateMonthlyProgress(habits, completions, year, month) {
  const dates = getMonthDates(year, month)
  let done = 0
  let total = 0

  dates.forEach((dateKey) => {
    const scheduledHabits = getScheduledHabits(habits, dateKey)
    total += scheduledHabits.length
    done += getCompletedHabitCount(scheduledHabits, completions, dateKey)
  })

  return {
    done,
    total,
    left: Math.max(0, total - done),
    percent: total === 0 ? 0 : safePercent((done / total) * 100),
  }
}

export function calculateHabitMonthlyProgress(habit, completions, year, month) {
  const scheduledDates = getHabitScheduledDates(habit, year, month)
  const monthlyGoal = safeNumber(habit?.monthlyGoal, 0)
  const total = monthlyGoal > 0 ? monthlyGoal : scheduledDates.length
  const done = scheduledDates.filter((dateKey) => isHabitDone(habit, completions, dateKey)).length

  return {
    habit,
    done,
    total,
    left: Math.max(0, total - done),
    percent: total === 0 ? 0 : safePercent((done / total) * 100),
  }
}

export function getTopHabits(habits, completions, year, month) {
  return ensureArray(habits)
    .map((habit) => {
      const progress = calculateHabitMonthlyProgress(habit, completions, year, month)
      return {
        ...habit,
        done: progress.done,
        left: progress.left,
        percent: progress.percent,
      }
    })
    .sort((left, right) => right.done - left.done || right.percent - left.percent || getHabitDisplayName(left).localeCompare(getHabitDisplayName(right)))
}

export function getOverallProgressRows(habits, completions, year, month) {
  return ensureArray(habits).map((habit) => {
    const progress = calculateHabitMonthlyProgress(habit, completions, year, month)

    return {
      id: habit.id,
      emoji: getHabitEmoji(habit),
      name: getHabitDisplayName(habit),
      done: progress.done,
      left: progress.left,
      percent: progress.percent,
    }
  })
}

export function getDailyChartData(habits, completions, year, month) {
  return getMonthDates(year, month).map((dateKey) => {
    const date = parseDateKey(dateKey)

    return {
      date: dateKey,
      day: date.getDate(),
      rate: calculateDailyCompletionRate(habits, completions, dateKey),
    }
  })
}
