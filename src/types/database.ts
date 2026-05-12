// Auto-generated shape matching our Supabase schema
// Run `npm run db:types` to regenerate from live DB

export type MatchStatus = 'scheduled' | 'live' | 'halftime' | 'finished' | 'postponed' | 'cancelled'
export type MatchStage = 'group' | 'round_of_16' | 'quarter' | 'semi' | 'third_place' | 'final'
export type MemberRole = 'owner' | 'admin' | 'member'

export interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  country: string | null
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  code: string
  name: string
  flag_url: string | null
  group_letter: string | null
  created_at: string
}

export interface Tournament {
  id: string
  slug: string
  name: string
  starts_at: string
  ends_at: string
  is_active: boolean
}

export interface Match {
  id: string
  tournament_id: string
  external_id: string | null
  stage: MatchStage
  group_letter: string | null
  home_team_id: string
  away_team_id: string
  kickoff_at: string
  venue: string | null
  status: MatchStatus
  home_score: number | null
  away_score: number | null
  minute: number | null
  scored_at: string | null
  created_at: string
  updated_at: string
}

export interface MatchWithTeams extends Match {
  home_team: Team
  away_team: Team
}

export interface Group {
  id: string
  tournament_id: string
  name: string
  slug: string
  invite_code: string
  owner_id: string
  is_private: boolean
  max_members: number
  created_at: string
  updated_at: string
}

export interface GroupWithMemberCount extends Group {
  member_count: number
}

export interface Membership {
  group_id: string
  user_id: string
  role: MemberRole
  joined_at: string
}

export interface Prediction {
  id: string
  match_id: string
  user_id: string
  group_id: string
  home_score: number
  away_score: number
  is_joker: boolean
  points_awarded: number | null
  bonus_awarded: number
  is_scored: boolean
  scored_at: string | null
  created_at: string
  updated_at: string
}

export interface GroupStanding {
  group_id: string
  user_id: string
  total_points: number
  exact_scores: number
  correct_results: number
  predictions_made: number
  predictions_scored: number
  current_streak: number
  best_streak: number
  last_scored_at: string | null
  updated_at: string
}

export interface GroupStandingWithProfile extends GroupStanding {
  profiles: Profile
}

export interface Notification {
  id: string
  user_id: string
  kind: string
  title: string
  body: string | null
  payload: Record<string, unknown>
  read_at: string | null
  created_at: string
}

// Supabase Database shape for typed client
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at' | 'updated_at'>; Update: Partial<Profile> }
      teams: { Row: Team; Insert: Omit<Team, 'id' | 'created_at'>; Update: Partial<Team> }
      tournaments: { Row: Tournament; Insert: Omit<Tournament, 'id'>; Update: Partial<Tournament> }
      matches: { Row: Match; Insert: Omit<Match, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Match> }
      groups: { Row: Group; Insert: Omit<Group, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Group> }
      memberships: { Row: Membership; Insert: Membership; Update: Partial<Membership> }
      predictions: { Row: Prediction; Insert: Omit<Prediction, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Prediction> }
      group_standings: { Row: GroupStanding; Insert: GroupStanding; Update: Partial<GroupStanding> }
      notifications: { Row: Notification; Insert: Omit<Notification, 'id' | 'created_at'>; Update: Partial<Notification> }
    }
    Functions: {
      join_group_by_code: { Args: { p_invite_code: string }; Returns: string }
    }
  }
}
