import { useEffect, useState } from 'react'
import { DEFAULT_SETTINGS, STORAGE_KEY, STORAGE_VERSION } from '../constants/habitConstants'
import { migrateHabit, normalizeSavedCompletions } from '../utils/habitUtils'
import { normalizeEvents } from '../utils/eventUtils'
import { normalizeTodos } from '../utils/todoUtils'
import { createDefaultSlimeProfile, normalizeSlimeProfile } from '../utils/rpgUtils'

export const fallbackState = {
  version: STORAGE_VERSION,
  habits: [],
  completions: {},
  events: [],
  todos: [],
  companion: createDefaultSlimeProfile(),
  rewardedCompletions: {},
  settings: DEFAULT_SETTINGS,
}

function ensureArray(value) {
  return Array.isArray(value) ? value : []
}

function ensureObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function normalizeRewardedCompletions(value) {
  return Object.fromEntries(
    Object.entries(ensureObject(value))
      .filter(([key, rewarded]) => typeof key === 'string' && rewarded === true),
  )
}

export function migrateStoredState(parsed) {
  const source = ensureObject(parsed)
  const habits = ensureArray(source.habits).map(migrateHabit)
  const habitsById = Object.fromEntries(habits.map((habit) => [habit.id, habit]))

  return {
    version: STORAGE_VERSION,
    habits,
    completions: normalizeSavedCompletions(ensureObject(source.completions), habitsById),
    events: normalizeEvents(source.events),
    todos: normalizeTodos(source.todos),
    companion: normalizeSlimeProfile(source.companion),
    rewardedCompletions: normalizeRewardedCompletions(source.rewardedCompletions),
    settings: {
      ...DEFAULT_SETTINGS,
      ...ensureObject(source.settings),
    },
  }
}

function loadInitialState() {
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (!saved) return fallbackState

  try {
    const parsed = JSON.parse(saved)
    return migrateStoredState(parsed)
  } catch {
    return fallbackState
  }
}

export function useLocalStorage() {
  const [state, setState] = useState(loadInitialState)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrateStoredState(state)))
  }, [state])

  return [state, setState]
}
