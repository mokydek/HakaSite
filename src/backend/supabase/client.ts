import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error(
    'Missing VITE_SUPABASE_URL. Copy .env.example to .env and set it to your Supabase project URL, found in the dashboard under Project Settings, Data API.',
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and set it to your Supabase anon public key, found in the dashboard under Project Settings, API Keys. Never use the service role key in the frontend.',
  )
}

/**
 * The single shared Supabase client for the browser. Typed with the hand
 * written Database type so queries return real row shapes with autocompletion.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
