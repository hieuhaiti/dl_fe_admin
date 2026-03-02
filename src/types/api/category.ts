export interface Category {
  id: number
  name: string
  description?: string
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CategoryListData {
  items: Category[]
  pagination: import('./index').Pagination
}

export interface CategoryListParams {
  page?: number
  limit?: number
  is_active?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface CategoryFormData {
  name: string
  description?: string
  image_url?: File
}
