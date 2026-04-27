import { calculateStreak, getHabitLog, getHabitMetrics, safeNumber, safePercent } from './habitUtils'

const DEFAULT_SLIME_PROFILE = {
  level: 1,
  xp: 0,
  totalXp: 0,
  gold: 0,
  crystals: 0,
  energy: 50,
  maxEnergy: 100,
  evolutionStage: 'baby',
  evolutionType: null,
  lastLevelUpAt: null,
  unlockedRewards: [],
  growthLog: [],
}

const EVOLUTION_STAGES = [
  { stage: 'baby', minLevel: 1, maxLevel: 4 },
  { stage: 'tiny', minLevel: 5, maxLevel: 9 },
  { stage: 'rookie', minLevel: 10, maxLevel: 24 },
  { stage: 'evolved', minLevel: 25, maxLevel: 49 },
  { stage: 'master', minLevel: 50, maxLevel: Infinity },
]

const EVOLUTION_MILESTONES = [
  { level: 10, type: 'firstEvolutionAvailable', label: 'First Evolution Available', stage: 'rookie' },
  { level: 25, type: 'secondEvolutionAvailable', label: 'Second Evolution Available', stage: 'evolved' },
  { level: 50, type: 'finalEvolutionAvailable', label: 'Final Evolution Available', stage: 'master' },
]

function ensureArray(value) {
  return Array.isArray(value) ? value : []
}

function ensureObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function createGrowthLogEntry(type, message, createdAt = new Date().toISOString()) {
  return {
    id: `${createdAt}-${type}-${Math.random().toString(16).slice(2)}`,
    type,
    message,
    createdAt,
  }
}

function trimGrowthLog(entries) {
  return ensureArray(entries)
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => ({
      id: String(entry.id ?? createGrowthLogEntry('xp', 'Imported growth event').id),
      type: ['xp', 'levelUp', 'evolution', 'reward'].includes(entry.type) ? entry.type : 'xp',
      message: String(entry.message ?? ''),
      createdAt: typeof entry.createdAt === 'string' ? entry.createdAt : null,
    }))
    .filter((entry) => entry.createdAt)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 50)
}

function addGrowthLog(growthLog, entry) {
  return trimGrowthLog([entry, ...ensureArray(growthLog)])
}

function getHabitRewardName(habit) {
  return String(habit?.name || 'Habit').trim() || 'Habit'
}

function getCategoryXpBonus(_habit) {
  return 0
}

function getLatestAvailableEvolutionMilestone(profile) {
  const current = normalizeSlimeProfile(profile)
  return [...EVOLUTION_MILESTONES].reverse().find((milestone) => current.level >= milestone.level) ?? null
}

export function createDefaultSlimeProfile() {
  return {
    ...DEFAULT_SLIME_PROFILE,
    unlockedRewards: [],
    growthLog: [],
  }
}

export function normalizeSlimeProfile(profile) {
  const source = ensureObject(profile)
  const maxEnergy = Math.max(1, safeNumber(source.maxEnergy, DEFAULT_SLIME_PROFILE.maxEnergy))
  const level = Math.max(1, Math.floor(safeNumber(source.level, DEFAULT_SLIME_PROFILE.level)))
  const xp = Math.max(0, Math.floor(safeNumber(source.xp, DEFAULT_SLIME_PROFILE.xp)))
  const totalXp = Math.max(xp, Math.floor(safeNumber(source.totalXp, DEFAULT_SLIME_PROFILE.totalXp)))
  const evolutionAvailabilityTypes = new Set(EVOLUTION_MILESTONES.map((milestone) => milestone.type))
  const storedEvolutionType = typeof source.evolutionType === 'string' ? source.evolutionType : null
  const unlockedRewards = new Set(ensureArray(source.unlockedRewards).filter((reward) => typeof reward === 'string'))

  if (storedEvolutionType && evolutionAvailabilityTypes.has(storedEvolutionType)) {
    unlockedRewards.add(storedEvolutionType)
  }

  return {
    level,
    xp,
    totalXp,
    gold: Math.max(0, Math.floor(safeNumber(source.gold, DEFAULT_SLIME_PROFILE.gold))),
    crystals: Math.max(0, Math.floor(safeNumber(source.crystals, DEFAULT_SLIME_PROFILE.crystals))),
    energy: Math.max(0, Math.min(maxEnergy, Math.floor(safeNumber(source.energy, DEFAULT_SLIME_PROFILE.energy)))),
    maxEnergy,
    evolutionStage: getEvolutionStageByLevel(level),
    evolutionType: storedEvolutionType && !evolutionAvailabilityTypes.has(storedEvolutionType) ? storedEvolutionType : null,
    lastLevelUpAt: typeof source.lastLevelUpAt === 'string' ? source.lastLevelUpAt : null,
    unlockedRewards: [...unlockedRewards],
    growthLog: trimGrowthLog(source.growthLog),
  }
}

export function getRequiredXpForLevel(level) {
  return 100 + Math.max(0, Math.floor(safeNumber(level, 1)) - 1) * 25
}

export function getEvolutionStageByLevel(level) {
  const safeLevel = Math.max(1, Math.floor(safeNumber(level, 1)))
  return EVOLUTION_STAGES.find((stage) => safeLevel >= stage.minLevel && safeLevel <= stage.maxLevel)?.stage ?? 'baby'
}

export function getEvolutionMilestone(level) {
  const safeLevel = Math.max(1, Math.floor(safeNumber(level, 1)))
  return EVOLUTION_MILESTONES.find((milestone) => milestone.level === safeLevel)?.type ?? null
}

export function calculateHabitCompletionReward(habit) {
  return {
    xp: 10 + getCategoryXpBonus(habit),
    gold: 5,
    energy: 5,
    crystals: 0,
  }
}

export function applyXpAndLevelUp(profile, gainedXp) {
  const now = new Date().toISOString()
  const nextProfile = normalizeSlimeProfile(profile)
  let remainingXp = Math.max(0, Math.floor(safeNumber(gainedXp)))
  let levelUpCount = 0
  const unlockedRewards = new Set(nextProfile.unlockedRewards)
  let growthLog = [...nextProfile.growthLog]

  if (remainingXp > 0) {
    growthLog = addGrowthLog(growthLog, createGrowthLogEntry('xp', `Gained ${remainingXp} XP.`, now))
  }

  nextProfile.totalXp += remainingXp
  nextProfile.xp += remainingXp

  while (nextProfile.xp >= getRequiredXpForLevel(nextProfile.level)) {
    nextProfile.xp -= getRequiredXpForLevel(nextProfile.level)
    nextProfile.level += 1
    levelUpCount += 1
    nextProfile.lastLevelUpAt = now
    growthLog = addGrowthLog(growthLog, createGrowthLogEntry('levelUp', `Level ${nextProfile.level} reached! Your slime is getting softer.`, now))

    const levelRewardKey = `level-${nextProfile.level}-reward`
    if (!unlockedRewards.has(levelRewardKey)) {
      nextProfile.gold += 50
      unlockedRewards.add(levelRewardKey)
      growthLog = addGrowthLog(growthLog, createGrowthLogEntry('reward', `Lv.${nextProfile.level} reward: +50 Gold.`, now))
    }

    const crystalRewardKey = `level-${nextProfile.level}-crystal-bonus`
    if (nextProfile.level % 10 === 0 && !unlockedRewards.has(crystalRewardKey)) {
      nextProfile.crystals += 5
      unlockedRewards.add(crystalRewardKey)
      growthLog = addGrowthLog(growthLog, createGrowthLogEntry('reward', `Lv.${nextProfile.level} crystal bonus: +5 Crystal.`, now))
    } else if (nextProfile.level % 5 === 0 && !unlockedRewards.has(crystalRewardKey)) {
      nextProfile.crystals += 2
      unlockedRewards.add(crystalRewardKey)
      growthLog = addGrowthLog(growthLog, createGrowthLogEntry('reward', `Lv.${nextProfile.level} crystal bonus: +2 Crystal.`, now))
    }

    const evolutionMilestone = EVOLUTION_MILESTONES.find((milestone) => milestone.level === nextProfile.level)
    if (evolutionMilestone && !unlockedRewards.has(evolutionMilestone.type)) {
      unlockedRewards.add(evolutionMilestone.type)
      growthLog = addGrowthLog(growthLog, createGrowthLogEntry('evolution', `Lv.${nextProfile.level} reached! ${evolutionMilestone.label}.`, now))
    }
  }

  nextProfile.evolutionStage = getEvolutionStageByLevel(nextProfile.level)
  nextProfile.unlockedRewards = [...unlockedRewards]
  nextProfile.growthLog = trimGrowthLog(growthLog)

  return {
    ...nextProfile,
    levelUpCount,
  }
}

export function applyHabitReward(profile, habit) {
  const reward = calculateHabitCompletionReward(habit)
  const nextProfile = applyXpAndLevelUp(profile, reward.xp)
  const maxEnergy = Math.max(1, safeNumber(nextProfile.maxEnergy, 100))
  const habitName = getHabitRewardName(habit)

  return normalizeSlimeProfile({
    ...nextProfile,
    gold: safeNumber(nextProfile.gold) + reward.gold,
    crystals: safeNumber(nextProfile.crystals) + reward.crystals,
    energy: Math.min(maxEnergy, safeNumber(nextProfile.energy) + reward.energy),
    growthLog: addGrowthLog(
      nextProfile.growthLog,
      createGrowthLogEntry('reward', `${habitName} complete! +${reward.xp} XP, +${reward.gold} Gold, +${reward.energy} Energy`),
    ),
  })
}

export function getNextEvolutionInfo(profile) {
  const current = normalizeSlimeProfile(profile)
  const nextMilestone = EVOLUTION_MILESTONES.find((milestone) => current.level < milestone.level)
  const availableMilestone = getLatestAvailableEvolutionMilestone(current)

  if (!nextMilestone) {
    return {
      nextLevel: null,
      type: availableMilestone?.type ?? 'finalEvolutionAvailable',
      label: availableMilestone?.label ?? 'Final Evolution Available',
      stage: 'master',
      remainingLevels: 0,
      isAvailable: current.level >= 50 && !current.evolutionType,
      isFinalUnlocked: current.level >= 50,
    }
  }

  return {
    nextLevel: nextMilestone.level,
    type: availableMilestone?.type ?? nextMilestone.type,
    label: availableMilestone?.label ?? nextMilestone.label,
    stage: nextMilestone.stage,
    remainingLevels: Math.max(0, nextMilestone.level - current.level),
    isAvailable: Boolean(availableMilestone) && !current.evolutionType,
    isFinalUnlocked: current.level >= 50,
  }
}

export function getSlimeProgressSummary(profile) {
  const current = normalizeSlimeProfile(profile)
  const requiredXp = getRequiredXpForLevel(current.level)
  const nextEvolution = getNextEvolutionInfo(current)

  return {
    level: current.level,
    xp: current.xp,
    totalXp: current.totalXp,
    requiredXp,
    xpRemaining: Math.max(0, requiredXp - current.xp),
    xpPercent: safePercent((current.xp / Math.max(1, requiredXp)) * 100),
    evolutionStage: current.evolutionStage,
    evolutionType: current.evolutionType,
    nextEvolution,
  }
}

function getLegacyStageLabel(evolutionStage) {
  switch (evolutionStage) {
    case 'tiny':
      return 'Tiny Slime'
    case 'rookie':
      return 'Rookie Slime'
    case 'evolved':
      return 'Evolved Slime'
    case 'master':
      return 'Master Slime'
    default:
      return 'Baby Slime'
  }
}

function getLegacyStageIndex(evolutionStage) {
  return ['baby', 'tiny', 'rookie', 'evolved', 'master'].indexOf(evolutionStage)
}

function getLegacyMaturityText(evolutionStage) {
  switch (evolutionStage) {
    case 'tiny':
      return 'Growing through consistent habits'
    case 'rookie':
      return 'First evolution is available'
    case 'evolved':
      return 'Second evolution has opened'
    case 'master':
      return 'Final growth stage reached'
    default:
      return 'A small companion at the start'
  }
}

export function calculateRpgProfile(habits, completions, todayKey, weeklyRate, slimeProfile) {
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

  const storedProfile = normalizeSlimeProfile(slimeProfile)
  const summary = getSlimeProgressSummary(storedProfile)
  const hasStoredGrowth =
    storedProfile.totalXp > 0 ||
    storedProfile.gold > 0 ||
    storedProfile.crystals > 0 ||
    storedProfile.growthLog.length > 0
  const safeWeeklyRate = safePercent(weeklyRate)
  const softenedXp = Math.max(0, safeNumber(xp) + safeWeeklyRate * 5 - safeNumber(penalties) * 4)
  const stageIndex = Math.max(0, getLegacyStageIndex(summary.evolutionStage))

  return {
    ...storedProfile,
    ...summary,
    stage: getLegacyStageLabel(summary.evolutionStage),
    stageIndex,
    growthScale: Math.min(1.18, 0.82 + safeNumber(storedProfile.level, 1) * 0.028),
    maturityText: getLegacyMaturityText(summary.evolutionStage),
    level: storedProfile.level,
    gold: hasStoredGrowth
      ? Math.max(0, Math.round(safeNumber(storedProfile.gold)))
      : Math.max(0, Math.round(safeNumber(gold) - safeNumber(penalties) * 3)),
    crystals: hasStoredGrowth
      ? Math.max(0, Math.round(safeNumber(storedProfile.crystals)))
      : Math.max(0, Math.round(safeNumber(crystals))),
    energy: hasStoredGrowth
      ? safePercent(storedProfile.energy)
      : safePercent(safeWeeklyRate + Math.max(0, safeNumber(totalStreak) * 2 - safeNumber(penalties))),
    xpCurrent: storedProfile.xp,
    xpMax: getRequiredXpForLevel(storedProfile.level),
    strength: Math.min(99, 10 + Math.floor(Math.sqrt(Math.max(0, safeNumber(gold))) / 1.8)),
    focus: Math.min(99, 10 + Math.floor(Math.sqrt(Math.max(0, softenedXp + storedProfile.totalXp)) / 2.2)),
    discipline: Math.min(99, 10 + Math.floor(safeNumber(totalStreak) * 1.2)),
    vitality: Math.min(99, 10 + Math.floor(Math.max(0, safeWeeklyRate - safeNumber(penalties)) / 2.4)),
    penalties: Math.max(0, Math.round(safeNumber(penalties))),
  }
}
