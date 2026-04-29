const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_JS_URL = 'https://esm.sh/@supabase/supabase-js@2.49.4'

let supabaseClientPromise = null

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = null

export async function getSupabaseClient() {
  if (!isSupabaseConfigured) {
    return null
  }

  if (!supabaseClientPromise) {
    supabaseClientPromise = import(/* @vite-ignore */ SUPABASE_JS_URL).then(({ createClient }) => (
      createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    ))
  }

  return supabaseClientPromise
}

export async function requireSupabaseClient() {
  const client = await getSupabaseClient()

  if (!client) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your local environment.',
    )
  }

  return client
}
