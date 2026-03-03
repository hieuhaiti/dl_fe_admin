export interface AuditLog {
  id: number
  user_id?: number
  action: string
  method: string
  endpoint: string
  status_code: number
  ip_address?: string
  user_agent?: string
  request_payload?: Record<string, unknown> | null
  response_time_ms?: number
  created_at: string
  user?: {
    username: string
    full_name: string
  } | null
}

export interface AuditLogListData {
  logs: AuditLog[]
  pagination: import('./index').Pagination
}

export interface AuditLogListParams {
  page?: number
  limit?: number
  user_id?: number
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  status_code?: number
  from_date?: string
  to_date?: string
  search?: string
}

export interface VisitorStatisticsOverview {
  total_visits: string | number
  unique_users: string | number
  unique_ips: string | number
  post_requests: string | number
  put_requests: string | number
  delete_requests: string | number
  successful_requests: string | number
  failed_requests: string | number
  avg_response_time: string | number
}

export interface VisitorStatisticsTimeSeries {
  period: string
  visits: string | number
  unique_users: string | number
  unique_ips: string | number
}

export interface VisitorStatisticsTopUser {
  user_id: number
  username: string
  full_name: string
  action_count: string | number
}

export interface VisitorStatistics {
  overview: VisitorStatisticsOverview
  timeSeries: VisitorStatisticsTimeSeries[]
  topUsers?: VisitorStatisticsTopUser[]
}

export interface VisitorStatsParams {
  from_date?: string
  to_date?: string
  group_by?: 'day' | 'week' | 'month'
}
