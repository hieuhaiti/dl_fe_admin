export interface NewsComment {
  id: number
  news_id: number
  user_id: number | null
  /** Populated when commenter is a registered user */
  user: {
    id: number
    full_name: string | null
    avatar_url: string | null
  } | null
  content: string
  user_name?: string
  user_email?: string
  is_approved: boolean
  parent_comment_id?: number | null
  replies: NewsComment[]
  created_at: string
  updated_at?: string
}

/** Wrapper returned by GET /news-comments/:id */
export interface NewsCommentData {
  comment: NewsComment
}

/** Response from GET /news-comments/admin/all */
export interface NewsCommentListData {
  comments: NewsComment[]
  pagination: import('./index').Pagination
}

/** Response from GET /news-comments/news/:newsId (public, flat list) */
export type NewsCommentPublicList = NewsComment[]

/** Response from GET /news-comments/news/:newsId (public, with data wrapper) */
export interface NewsCommentPublicListData {
  comments: NewsComment[]
}
