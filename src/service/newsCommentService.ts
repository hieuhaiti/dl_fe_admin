import apiClient from './common/apiClient'
import type { ApiResponse, NewsComment, NewsCommentListData } from '@/types/api'
import { serviceNewsCommentPath } from '@/constant/serviceConstant'

export default {
  /** GET /news-comments/news/:newsId */
  getByNewsId: (newsId: number, params?: { search?: string }) =>
    apiClient.get<ApiResponse<NewsCommentListData>>(
      `${serviceNewsCommentPath}/news/${newsId}`,
      params
    ),

  /** GET /news-comments/news/:newsId/count */
  getCountByNewsId: (newsId: number) =>
    apiClient.get<ApiResponse<{ count: number }>>(`${serviceNewsCommentPath}/news/${newsId}/count`),

  /** GET /news-comments/:id */
  getById: (id: number) =>
    apiClient.get<ApiResponse<NewsComment>>(`${serviceNewsCommentPath}/${id}`),

  /** GET /news-comments/admin/pending/count */
  getPendingCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>(`${serviceNewsCommentPath}/admin/pending/count`),

  /** DELETE /news-comments/:id  (own comment) */
  delete: (id: number) => apiClient.del<ApiResponse<{}>>(`${serviceNewsCommentPath}/${id}`),

  /** DELETE /news-comments/admin/:id  (admin force-delete) */
  adminDelete: (id: number) =>
    apiClient.del<ApiResponse<{}>>(`${serviceNewsCommentPath}/admin/${id}`),

  /** PATCH /news-comments/admin/:id/approve */
  approve: (id: number) =>
    apiClient.patch<ApiResponse<NewsComment>>(`${serviceNewsCommentPath}/admin/${id}/approve`),
}
