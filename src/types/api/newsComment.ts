export interface NewsComment {
  id: number
  news_id: number
  user_id: number
  parent_id?: number | null
  content: string
  is_approved: boolean
  created_at: string
  updated_at: string
  user?: {
    id: number
    username: string
    full_name: string
    avatar_url?: string
  }
  replies?: NewsComment[]
}

export interface NewsCommentListData {
  items: NewsComment[]
  pagination?: import('./index').Pagination
}
