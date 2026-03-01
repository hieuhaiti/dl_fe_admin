export interface User {
  id: number
  username: string
  email: string
  full_name: string
  phone?: string
  /** Server field name is address_detail (not address) */
  address_detail?: string
  avatar_url?: string
  role_id: number
  role?: UserRole
  is_active: boolean
  locked_until?: string | null
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: number
  name: string
  description?: string
}

export interface UserListData {
  users: User[]
  pagination: import('./index').Pagination
}
