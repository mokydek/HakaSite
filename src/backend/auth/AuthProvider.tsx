import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../supabase/client'
import type { Profile } from '../types'
import { getProfile, signInWithPassword, signOut as signOutQuery, signUpWithPassword } from '../queries/auth'

export interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ user: User | null; session: Session | null }>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessionResolved, setSessionResolved] = useState(false)
  // The user id whose profile is currently held in state, used to know when
  // the profile for the active user has actually been fetched.
  const [profileLoadedFor, setProfileLoadedFor] = useState<string | null>(null)

  const userId = user?.id ?? null

  // The gate. Stays true until the session is resolved and, when a user is
  // signed in, until that user profile has been fetched. This stops guards
  // from redirecting prematurely on a page refresh.
  const loading = !sessionResolved || (userId !== null && profileLoadedFor !== userId)

  // Session lifecycle: read the initial session, then keep it in sync.
  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setSessionResolved(true)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setSessionResolved(true)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Load the profile whenever the signed in user id changes. A missing profile
  // is stored as null rather than treated as an error.
  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setProfileLoadedFor(null)
      return
    }
    let active = true
    getProfile(userId)
      .then((row) => {
        if (!active) return
        setProfile(row)
        setProfileLoadedFor(userId)
      })
      .catch(() => {
        if (!active) return
        setProfile(null)
        setProfileLoadedFor(userId)
      })
    return () => {
      active = false
    }
  }, [userId])

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null)
      setProfileLoadedFor(null)
      return
    }
    try {
      const row = await getProfile(userId)
      setProfile(row)
    } catch {
      setProfile(null)
    } finally {
      setProfileLoadedFor(userId)
    }
  }, [userId])

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithPassword(email, password)
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    return await signUpWithPassword(email, password)
  }, [])

  const signOut = useCallback(async () => {
    await signOutQuery()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ session, user, profile, loading, signUp, signIn, signOut, refreshProfile }),
    [session, user, profile, loading, signUp, signIn, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
