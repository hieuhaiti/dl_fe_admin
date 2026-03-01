import apiClient from './common/apiClient'
import type { ApiResponse, NewsComment, NewsCommentData, NewsCommentListData } from '@/types/api'
import { serviceNewsCommentPath } from '@/constant/serviceConstant'

export interface NewsCommentAdminListParams {
  page?: number
  limit?: number
  news_id?: number
  is_approved?: boolean
  sortBy?: 'created_at' | 'updated_at'
  sortOrder?: 'ASC' | 'DESC'
}

export default {
  /** GET /news-comments/admin/all  (admin, paginated) */
  getAll: (params?: NewsCommentAdminListParams) =>
    apiClient.get<ApiResponse<NewsCommentListData>>(`${serviceNewsCommentPath}/admin/all`, params),

  /** GET /news-comments/news/:newsId  (public flat list) */
  getByNewsId: (newsId: number) =>
    apiClient.get<ApiResponse<NewsComment[]>>(`${serviceNewsCommentPath}/news/${newsId}`),

  /** GET /news-comments/news/:newsId/count */
  getCountByNewsId: (newsId: number) =>
    apiClient.get<ApiResponse<{ count: number }>>(`${serviceNewsCommentPath}/news/${newsId}/count`),

  /** GET /news-comments/:id */
  getById: (id: number) =>
    apiClient.get<ApiResponse<NewsCommentData>>(`${serviceNewsCommentPath}/${id}`),

  /** GET /news-comments/admin/pending/count */
  getPendingCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>(`${serviceNewsCommentPath}/admin/pending/count`),

  /** DELETE /news-comments/:id  (own comment) */
  delete: (id: number) => apiClient.del<ApiResponse<object>>(`${serviceNewsCommentPath}/${id}`),

  /** DELETE /news-comments/admin/:id  (admin force-delete) */
  adminDelete: (id: number) =>
    apiClient.del<ApiResponse<object>>(`${serviceNewsCommentPath}/admin/${id}`),

  /** PATCH /news-comments/admin/:id/approve */
  approve: (id: number) =>
    apiClient.patch<ApiResponse<NewsComment>>(`${serviceNewsCommentPath}/admin/${id}/approve`),
}
