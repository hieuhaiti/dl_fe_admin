export interface News {
  id: number
  title: string
  slug: string
  summary?: string
  content: string
  thumbnail_url?: string
  is_published: boolean
  is_featured: boolean
  published_at?: string
  tags?: string[]
  view_count: number
  author_id?: number
  lang?: string
  created_at: string
  updated_at: string
}

export interface NewsListData {
  items: News[]
  pagination: import('./index').Pagination
}

export interface NewsFormData {
  title: string
  content: string
  slug?: string
  summary?: string
  /** Upload as File in multipart/form-data */
  thumbnail_url?: File
  is_published?: boolean
  is_featured?: boolean
  /** Server expects array of strings — split(',') before appending to FormData */
  tags?: string[]
  published_at?: string
}
