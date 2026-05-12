'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({
  children,
  initialSession,
  initialProfile,
}: {
  children: ReactNode
  initialSession: Session | null
  initialProfile: Profile | null
}) {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null)
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [session, setSession] = useState<Session | null>(initialSession)
  const [loading, setLoading] = useState(!initialSession)

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return data
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const p = await loadProfile(user.id)
    setProfile(p)
  }, [user, loadProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }, [supabase])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setLoading(false)

        if (newSession?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
          const p = await loadProfile(newSession.user.id)
          setProfile(p)
        }
        if (event === 'SIGNED_OUT') {
          setProfile(null)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [supabase, loadProfile])

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useUser() {
  const { user, profile } = useAuth()
  return { user, profile }
}
