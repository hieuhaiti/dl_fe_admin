export interface User {
  id: number
  username: string
  email: string
  full_name?: string | null
  phone?: string | null
  /** Used in detail view */
  address_detail?: string | null
  /** Used in list view and create/update API */
  avatar_url?: string | null
  role_id: number
  /** Flat role name returned in list query */
  role_name?: string
  role?: UserRole
  is_active: boolean
  is_deleted?: boolean
  deleted_at?: string | null
  deleted_by?: string | null
  last_login?: string | null
  login_count?: number
  locked_until?: string | null
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: number
  name: string
  description?: string
  permissions?: Record<string, string[]>
}

export interface UserListData {
  users: User[]
  pagination: import('./index').Pagination
}
