/**
 * Hand written Supabase Database types for HakaSite.
 *
 * These mirror supabase/migrations/0001_init.sql exactly, including
 * nullability and defaults. Row is what a select returns. Insert marks
 * columns with a default or a nullable type as optional. Update makes every
 * column optional. Keep this file in sync with the migration by hand.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProfileRole = 'participant' | 'organizer' | 'judge'
export type HackathonStatus = 'draft' | 'published' | 'live' | 'ended'
export type TeamMemberRole = 'owner' | 'member'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          country: string | null
          bio: string | null
          role: ProfileRole
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          country?: string | null
          bio?: string | null
          role?: ProfileRole
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          country?: string | null
          bio?: string | null
          role?: ProfileRole
          created_at?: string
        }
        Relationships: []
      }
      hackathons: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          long_description: string | null
          cover_url: string | null
          rules: string | null
          prizes: string | null
          status: HackathonStatus
          registration_deadline: string | null
          cases_reveal_at: string | null
          submission_deadline: string | null
          start_at: string | null
          end_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          long_description?: string | null
          cover_url?: string | null
          rules?: string | null
          prizes?: string | null
          status?: HackathonStatus
          registration_deadline?: string | null
          cases_reveal_at?: string | null
          submission_deadline?: string | null
          start_at?: string | null
          end_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          long_description?: string | null
          cover_url?: string | null
          rules?: string | null
          prizes?: string | null
          status?: HackathonStatus
          registration_deadline?: string | null
          cases_reveal_at?: string | null
          submission_deadline?: string | null
          start_at?: string | null
          end_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string
          hackathon_id: string
          name: string
          invite_code: string
          owner_id: string
          looking_for_members: boolean
          created_at: string
        }
        Insert: {
          id?: string
          hackathon_id: string
          name: string
          invite_code: string
          owner_id: string
          looking_for_members?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          hackathon_id?: string
          name?: string
          invite_code?: string
          owner_id?: string
          looking_for_members?: boolean
          created_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          hackathon_id: string
          profile_id: string
          role: TeamMemberRole
          joined_at: string
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          hackathon_id: string
          profile_id: string
          role?: TeamMemberRole
          joined_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          hackathon_id?: string
          profile_id?: string
          role?: TeamMemberRole
          joined_at?: string
          created_at?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          id: string
          hackathon_id: string
          profile_id: string
          team_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          hackathon_id: string
          profile_id: string
          team_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          hackathon_id?: string
          profile_id?: string
          team_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      cases: {
        Row: {
          id: string
          hackathon_id: string
          title: string
          summary: string | null
          full_description: string | null
          attachments: Json
          order_index: number
          reveal_at: string | null
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          hackathon_id: string
          title: string
          summary?: string | null
          full_description?: string | null
          attachments?: Json
          order_index?: number
          reveal_at?: string | null
          is_published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          hackathon_id?: string
          title?: string
          summary?: string | null
          full_description?: string | null
          attachments?: Json
          order_index?: number
          reveal_at?: string | null
          is_published?: boolean
          created_at?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          id: string
          hackathon_id: string
          case_id: string | null
          team_id: string
          repo_url: string | null
          demo_url: string | null
          description: string | null
          files: Json
          submitted_by: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          hackathon_id: string
          case_id?: string | null
          team_id: string
          repo_url?: string | null
          demo_url?: string | null
          description?: string | null
          files?: Json
          submitted_by: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          hackathon_id?: string
          case_id?: string | null
          team_id?: string
          repo_url?: string | null
          demo_url?: string | null
          description?: string | null
          files?: Json
          submitted_by?: string
          updated_at?: string
          created_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          id: string
          hackathon_id: string
          title: string
          body: string | null
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          hackathon_id: string
          title: string
          body?: string | null
          is_published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          hackathon_id?: string
          title?: string
          body?: string | null
          is_published?: boolean
          created_at?: string
        }
        Relationships: []
      }
      schedule_items: {
        Row: {
          id: string
          hackathon_id: string
          title: string
          description: string | null
          starts_at: string | null
          ends_at: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          hackathon_id: string
          title: string
          description?: string | null
          starts_at?: string | null
          ends_at?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          hackathon_id?: string
          title?: string
          description?: string | null
          starts_at?: string | null
          ends_at?: string | null
          order_index?: number
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_organizer: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_registered: {
        Args: { h: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { t: string }
        Returns: boolean
      }
      create_team: {
        Args: { p_hackathon_id: string; p_name: string }
        Returns: Database['public']['Tables']['teams']['Row']
      }
      join_team_by_code: {
        Args: { p_code: string }
        Returns: Database['public']['Tables']['teams']['Row']
      }
      join_team_by_id: {
        Args: { p_team_id: string }
        Returns: Database['public']['Tables']['teams']['Row']
      }
      leave_team: {
        Args: { p_team_id: string }
        Returns: undefined
      }
      delete_team: {
        Args: { p_team_id: string }
        Returns: undefined
      }
      remove_member: {
        Args: { p_team_id: string; p_profile_id: string }
        Returns: undefined
      }
      get_open_teams: {
        Args: { p_hackathon_id: string }
        Returns: { id: string; name: string; member_count: number; looking_for_members: boolean }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

/** Convenience helpers for the row, insert, and update shapes of a table. */
type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Row']

export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type Hackathon = Tables<'hackathons'>
export type Team = Tables<'teams'>
export type TeamMember = Tables<'team_members'>
export type Registration = Tables<'registrations'>
export type Case = Tables<'cases'>
export type Submission = Tables<'submissions'>
export type Announcement = Tables<'announcements'>
export type ScheduleItem = Tables<'schedule_items'>
