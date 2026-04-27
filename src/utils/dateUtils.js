export function pad(value) {
  return String(value).padStart(2, '0')
}

export function getDateKey(date = new Date()) {
  const localDate = new Date(date)
  return `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}`
}

export function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatHeroDate(date = new Date()) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date)
}

export function formatMonthLabel(date = new Date()) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function enumeratePastDates(days, anchorDate = new Date()) {
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

export function timeToMinutes(timeText = '') {
  const [hours, minutes] = timeText.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null
  }
  return hours * 60 + minutes
}