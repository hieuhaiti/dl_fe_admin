export type FeedbackStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected' | 'closed'
export type FeedbackPriority = 'low' | 'normal' | 'high' | 'urgent'
export type ModerationStatus = 'pending' | 'approved' | 'rejected'

export interface FeedbackAttachment {
  id: number
  file_name: string
  file_path: string
  file_url: string
  mime_type: string
  file_size: number | null
  uploaded_at: string
}

export interface CitizenFeedback {
  id: number
  user_id?: number
  title: string
  content: string
  location_coordinates?: string | null
  location_text?: string | null
  priority: FeedbackPriority
  status: FeedbackStatus
  moderation_status: ModerationStatus
  admin_response?: string
  responded_by?: number
  responded_at?: string
  resolution_note?: string
  resolved_at?: string
  forest_loss_area_estimate_m2?: number
  ip_address?: string
  created_at: string
  updated_at: string
  user?: {
    id: number
    username: string
    full_name: string
    email_registered?: string
    avatar_url?: string
  }
  responder?: {
    id: number
    full_name: string
  }
  attachments: FeedbackAttachment[]
}

/** Server getAllFeedbacks returns: { feedbacks: CitizenFeedback[], pagination } */
export interface CitizenFeedbackListData {
  feedbacks: CitizenFeedback[]
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
  moderation_status?: ModerationStatus
}

export interface UpdateModerationBody {
  moderation_status: ModerationStatus
  admin_response?: string
}

export interface FeedbackListParams {
  page?: number
  limit?: number
  search?: string
  status?: FeedbackStatus
  moderation_status?: ModerationStatus
  priority?: FeedbackPriority
  user_id?: number
  start_date?: string
  end_date?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}
