export interface Notification {
  id: number
  user_id?: number | null
  type: string
  title?: string | null
  message?: string | null
  payload?: Record<string, any> | null
  is_read: boolean
  created_at: string
  read_at?: string | null
}

export interface NotificationListData {
  notifications: Notification[]
  pagination: import('./index').Pagination
  unread_count: number
}

export interface NotificationListParams {
  page?: number
  limit?: number
  unread_only?: boolean
  user_id?: number
}
