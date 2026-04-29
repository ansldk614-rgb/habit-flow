import { requireSupabaseClient } from '../lib/supabaseClient'

export function missingUserIdResult() {
  return { data: null, error: new Error('userId is required.') }
}

export function missingIdResult(idName = 'id') {
  return { data: null, error: new Error(`${idName} is required.`) }
}

export async function getClientResult() {
  try {
    return { client: await requireSupabaseClient(), error: null }
  } catch (error) {
    return { client: null, error }
  }
}

export function mapSupabaseResult(result, mapper = (value) => value) {
  if (result.error) {
    return { data: null, error: result.error }
  }

  if (Array.isArray(result.data)) {
    return { data: result.data.map(mapper), error: null }
  }

  return { data: result.data == null ? null : mapper(result.data), error: null }
}

export function cleanObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  )
}

export function ensureArray(value) {
  return Array.isArray(value) ? value : []
}

export function isUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}
