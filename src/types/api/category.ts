export interface Category {
  id: number
  name: string
  description?: string
  icon_url?: string | null
  color?: string
  is_active: boolean
  is_landmark: boolean
  is_border_guard_station: boolean
  is_enable_default: boolean
  is_monitoring_feature: 'reference' | 'monitoring' | 'none'
  created_by: number
  created_at: string
  updated_at: string
}

export interface CategoryListData {
  categories: Category[]
  pagination: import('./index').Pagination
}

export interface CategoryListParams {
  page?: number
  limit?: number
  is_active?: boolean
  is_monitoring_feature?: 'reference' | 'monitoring' | 'none'
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface CategoryFormData {
  name: string
  description?: string
  icon_url?: File
  color?: string
  is_active?: boolean
  is_landmark?: boolean
  is_border_guard_station?: boolean
  is_enable_default?: boolean
  is_monitoring_feature?: 'reference' | 'monitoring' | 'none'
}
