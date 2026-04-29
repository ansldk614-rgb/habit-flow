import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient'

const AuthContext = createContext(null)

const emptyAuthState = {
  user: null,
  session: null,
  loading: false,
  isAuthenticated: false,
  isSupabaseConfigured,
  authError: null,
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => ({
    ...emptyAuthState,
    loading: isSupabaseConfigured,
  }))

  useEffect(() => {
    let isMounted = true
    let subscription = null

    async function initializeAuth() {
      if (!isSupabaseConfigured) {
        setAuthState(emptyAuthState)
        return
      }

      try {
        const client = await getSupabaseClient()
        if (!client || !isMounted) return

        const { data, error } = await client.auth.getSession()
        if (!isMounted) return

        if (error) {
          setAuthState({
            ...emptyAuthState,
            isSupabaseConfigured,
            authError: error,
          })
          return
        }

        const currentSession = data?.session ?? null
        setAuthState({
          user: currentSession?.user ?? null,
          session: currentSession,
          loading: false,
          isAuthenticated: Boolean(currentSession?.user),
          isSupabaseConfigured,
          authError: null,
        })

        const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
          setAuthState({
            user: nextSession?.user ?? null,
            session: nextSession ?? null,
            loading: false,
            isAuthenticated: Boolean(nextSession?.user),
            isSupabaseConfigured,
            authError: null,
          })
        })
        subscription = listener?.subscription ?? null
      } catch (error) {
        if (!isMounted) return

        setAuthState({
          ...emptyAuthState,
          isSupabaseConfigured,
          authError: error,
        })
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
      subscription?.unsubscribe?.()
    }
  }, [])

  const signUp = useCallback(async (email, password) => {
    const client = await getSupabaseClient()
    if (!client) {
      return { data: null, error: new Error('Supabase is not configured.') }
    }

    return client.auth.signUp({ email, password })
  }, [])

  const signIn = useCallback(async (email, password) => {
    const client = await getSupabaseClient()
    if (!client) {
      return { data: null, error: new Error('Supabase is not configured.') }
    }

    return client.auth.signInWithPassword({ email, password })
  }, [])

  const signOut = useCallback(async () => {
    const client = await getSupabaseClient()
    if (!client) {
      return { error: new Error('Supabase is not configured.') }
    }

    return client.auth.signOut()
  }, [])

  const resetPassword = useCallback(async (email) => {
    const client = await getSupabaseClient()
    if (!client) {
      return { data: null, error: new Error('Supabase is not configured.') }
    }

    return client.auth.resetPasswordForEmail(email)
  }, [])

  const value = useMemo(() => ({
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }), [authState, resetPassword, signIn, signOut, signUp])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }

  return context
}
