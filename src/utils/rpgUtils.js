import { calculateStreak, getHabitLog, getHabitMetrics, safeNumber, safePercent } from './habitUtils'

export function calculateRpgProfile(habits, completions, todayKey, weeklyRate) {
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