import { supabase } from '../supabase/client'
import type { Profile } from '../types'

/**
 * Thin typed wrappers over the Supabase auth and profiles APIs. Components and
 * providers call these rather than touching the Supabase client directly.
 * Errors are thrown so the calling UI can surface a message.
 */

export async function signUpWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export type OAuthProvider = 'google' | 'github'

/**
 * Starts an OAuth sign in. Supabase redirects the browser to the provider and
 * back to redirectTo, where AuthProvider picks up the new session. The provider
 * must be enabled in the Supabase dashboard for this to succeed.
 */
export async function signInWithOAuth(provider: OAuthProvider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/hackathon` },
  })
  if (error) throw error
  return data
}

/** Returns the profiles row for a user, or null when it does not exist yet. */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export interface ProfileUpdateInput {
  full_name: string
  country: string
  bio?: string | null
}

/** Updates the current user profile and returns the saved row. */
export async function updateProfile(userId: string, fields: ProfileUpdateInput): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(fields)
    .eq('id', userId)
    .select('*')
    .single()
  if (error) throw error
  return data
}
