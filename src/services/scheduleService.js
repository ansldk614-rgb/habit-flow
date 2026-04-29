import { cleanObject, ensureArray, getClientResult, mapSupabaseResult, missingIdResult, missingUserIdResult } from './serviceUtils'

function scheduleFromRow(row) {
  return {
    id: row.id,
    title: row.title,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time ?? '',
    endTime: row.end_time ?? '',
    category: row.category ?? '',
    color: row.color ?? '',
    memo: row.memo ?? '',
    repeatType: row.repeat_type ?? 'none',
    repeatDays: ensureArray(row.repeat_days),
    linkedHabitId: row.linked_habit_id,
    linkedTodoId: row.linked_todo_id,
    isCompleted: Boolean(row.is_completed),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function scheduleToRow(userId, schedule) {
  return cleanObject({
    id: schedule.id,
    user_id: userId,
    title: schedule.title,
    day_of_week: schedule.dayOfWeek,
    start_time: schedule.startTime,
    end_time: schedule.endTime,
    category: schedule.category,
    color: schedule.color,
    memo: schedule.memo,
    repeat_type: schedule.repeatType,
    repeat_days: schedule.repeatDays,
    linked_habit_id: schedule.linkedHabitId || null,
    linked_todo_id: schedule.linkedTodoId || null,
    is_completed: schedule.isCompleted,
    created_at: schedule.createdAt,
    updated_at: schedule.updatedAt,
  })
}

export async function getUserSchedules(userId) {
  if (!userId) return missingUserIdResult()
  const { client, error } = await getClientResult()
  if (error) return { data: null, error }

  const result = await client
    .from('schedules')
    .select('*')
    .eq('user_id', userId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })

  return mapSupabaseResult(result, scheduleFromRow)
}

export async function upsertSchedule(userId, schedule) {
  if (!userId) return missingUserIdResult()
  if (!schedule?.title) return { data: null, error: new Error('schedule.title is required.') }
  const { client, error } = await getClientResult()
  if (error) return { data: null, error }

  const result = await client
    .from('schedules')
    .upsert(scheduleToRow(userId, schedule))
    .select()
    .single()

  return mapSupabaseResult(result, scheduleFromRow)
}

export async function deleteSchedule(userId, scheduleId) {
  if (!userId) return missingUserIdResult()
  if (!scheduleId) return missingIdResult('scheduleId')
  const { client, error } = await getClientResult()
  if (error) return { data: null, error }

  const result = await client
    .from('schedules')
    .delete()
    .eq('user_id', userId)
    .eq('id', scheduleId)
    .select()

  return mapSupabaseResult(result, scheduleFromRow)
}
