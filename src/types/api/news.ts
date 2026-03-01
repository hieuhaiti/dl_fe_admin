export interface News {
  id: number
  title: string
  slug: string
  summary: string | null
  content: string
  thumbnail_url: string | null
  author_name: string | null
  is_published: boolean
  is_featured: boolean
  published_at: string | null
  tags: string[]
  view_count: number
  created_by: number | null
  updated_by: number | null
  lang?: string
  created_at: string
  updated_at: string
}

/** Wrapper returned by GET /news/:id */
export interface NewsData {
  news: News
}

export interface NewsListData {
  news: News[]
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
