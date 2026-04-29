import { cleanObject, getClientResult, mapSupabaseResult, missingUserIdResult } from './serviceUtils'

function settingsFromRow(row) {
  return {
    themeId: row.theme_id ?? undefined,
    developerMode: Boolean(row.developer_mode),
    settings: row.settings ?? {},
    updatedAt: row.updated_at,
  }
}

function settingsToRow(userId, settings) {
  return cleanObject({
    user_id: userId,
    theme_id: settings.themeId,
    developer_mode: settings.developerMode,
    settings: settings.settings ?? {},
  })
}

export async function getUserSettings(userId) {
  if (!userId) return missingUserIdResult()
  const { client, error } = await getClientResult()
  if (error) return { data: null, error }

  const result = await client
    .from('app_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  return mapSupabaseResult(result, settingsFromRow)
}

export async function upsertUserSettings(userId, settings) {
  if (!userId) return missingUserIdResult()
  const { client, error } = await getClientResult()
  if (error) return { data: null, error }

  const result = await client
    .from('app_settings')
    .upsert(settingsToRow(userId, settings))
    .select()
    .single()

  return mapSupabaseResult(result, settingsFromRow)
}
