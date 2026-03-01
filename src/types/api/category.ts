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

export interface CategoryFormData {
  name: string
  description?: string
  image_url?: File
}
