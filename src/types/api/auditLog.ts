export interface AuditLog {
  id: number
  user_id?: number
  action: string
  resource_type: string
  resource_id?: number
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
  user?: {
    id: number
    username: string
    full_name: string
  }
}

export interface AuditLogListData {
  items: AuditLog[]
  pagination: import('./index').Pagination
}

export interface VisitorStatistics {
  total_visits: number
  unique_visitors: number
  daily: Array<{ date: string; count: number }>
  weekly?: Array<{ week: string; count: number }>
}
