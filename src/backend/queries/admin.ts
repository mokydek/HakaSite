import { supabase } from '../supabase/client'
import type {
  Announcement,
  Case,
  Hackathon,
  Json,
  ScheduleItem,
  TablesInsert,
  TablesUpdate,
} from '../types'

/** The single hackathon to administer, regardless of status. */
export async function getAdminHackathon(): Promise<Hackathon | null> {
  const { data, error } = await supabase
    .from('hackathons')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function updateHackathon(
  id: string,
  fields: TablesUpdate<'hackathons'>,
): Promise<Hackathon> {
  const { data, error } = await supabase
    .from('hackathons')
    .update(fields)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}

// Cases ----------------------------------------------------------------------

export async function getAllCases(hackathonId: string): Promise<Case[]> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('hackathon_id', hackathonId)
    .order('order_index', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createCase(payload: TablesInsert<'cases'>): Promise<Case> {
  const { data, error } = await supabase.from('cases').insert(payload).select('*').single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateCase(id: string, fields: TablesUpdate<'cases'>): Promise<Case> {
  const { data, error } = await supabase
    .from('cases')
    .update(fields)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteCase(id: string): Promise<void> {
  const { error } = await supabase.from('cases').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// Announcements --------------------------------------------------------------

export async function getAllAnnouncements(hackathonId: string): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('hackathon_id', hackathonId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createAnnouncement(
  payload: TablesInsert<'announcements'>,
): Promise<Announcement> {
  const { data, error } = await supabase
    .from('announcements')
    .insert(payload)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateAnnouncement(
  id: string,
  fields: TablesUpdate<'announcements'>,
): Promise<Announcement> {
  const { data, error } = await supabase
    .from('announcements')
    .update(fields)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const { error } = await supabase.from('announcements').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// Schedule -------------------------------------------------------------------

export async function getAllScheduleItems(hackathonId: string): Promise<ScheduleItem[]> {
  const { data, error } = await supabase
    .from('schedule_items')
    .select('*')
    .eq('hackathon_id', hackathonId)
    .order('order_index', { ascending: true })
    .order('starts_at', { ascending: true, nullsFirst: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createScheduleItem(
  payload: TablesInsert<'schedule_items'>,
): Promise<ScheduleItem> {
  const { data, error } = await supabase
    .from('schedule_items')
    .insert(payload)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateScheduleItem(
  id: string,
  fields: TablesUpdate<'schedule_items'>,
): Promise<ScheduleItem> {
  const { data, error } = await supabase
    .from('schedule_items')
    .update(fields)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteScheduleItem(id: string): Promise<void> {
  const { error } = await supabase.from('schedule_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// People and submissions, through the organizer only functions ---------------

export interface AdminRegistration {
  profile_id: string
  full_name: string | null
  country: string | null
  email: string | null
  team_name: string | null
  registered_at: string
}

export async function getAdminRegistrations(hackathonId: string): Promise<AdminRegistration[]> {
  const { data, error } = await supabase.rpc('get_registrations', { p_hackathon_id: hackathonId })
  if (error) throw new Error(error.message)
  return data ?? []
}

export interface AdminSubmission {
  team_name: string
  case_title: string | null
  repo_url: string | null
  demo_url: string | null
  description: string | null
  files: Json
  submitted_by_name: string | null
  updated_at: string
}

export async function getAdminSubmissions(hackathonId: string): Promise<AdminSubmission[]> {
  const { data, error } = await supabase.rpc('get_submissions', { p_hackathon_id: hackathonId })
  if (error) throw new Error(error.message)
  return data ?? []
}
