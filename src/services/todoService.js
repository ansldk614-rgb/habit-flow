import { cleanObject, getClientResult, mapSupabaseResult, missingIdResult, missingUserIdResult } from './serviceUtils'

function todoFromRow(row) {
  return {
    id: row.id,
    title: row.title,
    dueDate: row.due_date ?? '',
    priority: row.priority ?? 'medium',
    category: row.category ?? '',
    memo: row.memo ?? '',
    isCompleted: Boolean(row.is_completed),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function todoToRow(userId, todo) {
  return cleanObject({
    id: todo.id,
    user_id: userId,
    title: todo.title,
    due_date: todo.dueDate,
    priority: todo.priority,
    category: todo.category,
    memo: todo.memo,
    is_completed: todo.isCompleted,
    created_at: todo.createdAt,
    updated_at: todo.updatedAt,
  })
}

export async function getUserTodos(userId) {
  if (!userId) return missingUserIdResult()
  const { client, error } = await getClientResult()
  if (error) return { data: null, error }

  const result = await client
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true })

  return mapSupabaseResult(result, todoFromRow)
}

export async function upsertTodo(userId, todo) {
  if (!userId) return missingUserIdResult()
  if (!todo?.title) return { data: null, error: new Error('todo.title is required.') }
  const { client, error } = await getClientResult()
  if (error) return { data: null, error }

  const result = await client
    .from('todos')
    .upsert(todoToRow(userId, todo))
    .select()
    .single()

  return mapSupabaseResult(result, todoFromRow)
}

export async function deleteTodo(userId, todoId) {
  if (!userId) return missingUserIdResult()
  if (!todoId) return missingIdResult('todoId')
  const { client, error } = await getClientResult()
  if (error) return { data: null, error }

  const result = await client
    .from('todos')
    .delete()
    .eq('user_id', userId)
    .eq('id', todoId)
    .select()

  return mapSupabaseResult(result, todoFromRow)
}
