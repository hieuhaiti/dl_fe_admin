export type FeedbackStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected' | 'closed'
export type FeedbackPriority = 'low' | 'normal' | 'high' | 'urgent'
export type ModerationStatus = 'pending' | 'approved' | 'rejected'

export interface CitizenFeedback {
  id: number
  user_id: number
  title: string
  content: string
  latitude?: number
  longitude?: number
  location_text?: string
  priority: FeedbackPriority
  status: FeedbackStatus
  moderation_status: ModerationStatus
  admin_response?: string
  resolution_note?: string
  forest_loss_area_estimate_m2?: number
  images?: string[]
  responded_at?: string
  created_at: string
  updated_at: string
  user?: {
    id: number
    username: string
    full_name: string
    avatar_url?: string
  }
}

export interface CitizenFeedbackListData {
  items: CitizenFeedback[]
  pagination: import('./index').Pagination
}

export interface FeedbackStatistics {
  total: number
  by_status: Record<FeedbackStatus, number>
  by_priority: Record<FeedbackPriority, number>
  by_moderation: Record<ModerationStatus, number>
  resolved_avg_hours?: number
}

export interface UpdateFeedbackStatusBody {
  status: FeedbackStatus
  admin_response?: string
  resolution_note?: string
}

export interface UpdateModerationBody {
  moderation_status: ModerationStatus
  admin_response?: string
}
