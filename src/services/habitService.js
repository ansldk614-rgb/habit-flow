import { cleanObject, ensureArray, getClientResult, isUuid, mapSupabaseResult, missingIdResult, missingUserIdResult } from './serviceUtils'

function habitFromRow(row) {
  const type = row.type ?? 'custom'
  const target = type === 'wake'
    ? { targetTime: row.target_wake_time ?? '07:00' }
    : type === 'workout'
      ? { targetVolume: row.target_amount ?? 5000 }
      : type === 'study'
        ? { targetMinutes: row.target_minutes ?? 90 }
        : { targetPercent: row.target_amount ?? 100 }

  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji ?? '',
    category: row.category ?? '',
    goal: row.goal ?? 20,
    monthlyGoal: row.goal ?? 20,
    activeDays: ensureArray(row.active_days),
    days: ensureArray(row.active_days),
    type,
    color: '#86ff5d',
    target,
    targetWakeTime: row.target_wake_time ?? undefined,
    targetMinutes: row.target_minutes ?? undefined,
    targetAmount: row.target_amount ?? undefined,
    unit: row.unit ?? '',
    memo: row.memo ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function habitToRow(userId, habit) {
  return cleanObject({
    id: isUuid(habit.id) ? habit.id : undefined,
    user_id: userId,
    name: habit.name,
    emoji: habit.emoji,
    category: habit.category,
    goal: habit.goal ?? habit.monthlyGoal,
    active_days: habit.activeDays ?? habit.days,
    type: habit.type,
    target_wake_time: habit.targetWakeTime ?? habit.target?.targetTime,
    target_minutes: habit.targetMinutes ?? habit.target?.targetMinutes,
    target_amount: habit.targetAmount ?? habit.target?.targetVolume,
    unit: habit.unit,
    memo: habit.memo ?? habit.description,
    created_at: habit.createdAt,
    updated_at: habit.updatedAt,
  })
}

function completionFromRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    habitId: row.habit_id,
    dateKey: row.date_key,
    value: row.value,
    progressPercent: row.progress_percent,
    isCompleted: row.is_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function completionToRow(userId, completion) {
  return cleanObject({
    id: completion.id,
    user_id: userId,
    habit_id: completion.habitId,
    date_key: completion.dateKey,
    value: completion.value,
    progress_percent: completion.progressPercent,
    is_completed: completion.isCompleted,
    created_at: completion.createdAt,
    updated_at: completion.updatedAt,
  })
}

export async function getUserHabits(userId) {
  if (!userId) return missingUserIdResult()
  const { client, error } = await getClientResult()
  if (error) return { data: null, error }

  const result = await client
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return mapSupabaseResult(result, habitFromRow)
}

export async function upsertHabit(userId, habit) {
  if (!userId) return missingUserIdResult()
  if (!habit?.name) return { data: null, error: new Error('habit.name is required.') }
  const { client, error } = await getClientResult()
  if (error) return { data: null, error }

  const result = await client
    .from('habits')
    .upsert(habitToRow(userId, habit))
    .select()
    .single()

  return mapSupabaseResult(result, habitFromRow)
}

export async function deleteHabit(userId, habitId) {
  if (!userId) return missingUserIdResult()
  if (!habitId) return missingIdResult('habitId')
  const { client, error } = await getClientResult()
  if (error) return { data: null, error }

  const result = await client
    .from('habits')
    .delete()
    .eq('user_id', userId)
    .eq('id', habitId)
    .select()

  return mapSupabaseResult(result, habitFromRow)
}

export async function getUserCompletions(userId) {
  if (!userId) return missingUserIdResult()
  const { client, error } = await getClientResult()
  if (error) return { data: null, error }

  const result = await client
    .from('habit_completions')
    .select('*')
    .eq('user_id', userId)
    .order('date_key', { ascending: false })

  return mapSupabaseResult(result, completionFromRow)
}

export async function upsertCompletion(userId, completion) {
  if (!userId) return missingUserIdResult()
  if (!completion?.habitId) return missingIdResult('habitId')
  if (!completion?.dateKey) return missingIdResult('dateKey')
  const { client, error } = await getClientResult()
  if (error) return { data: null, error }

  const result = await client
    .from('habit_completions')
    .upsert(completionToRow(userId, completion), { onConflict: 'user_id,habit_id,date_key' })
    .select()
    .single()

  return mapSupabaseResult(result, completionFromRow)
}
