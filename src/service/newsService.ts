import apiClient from './common/apiClient'
import type { ApiResponse, News, NewsData, NewsListData } from '@/types/api'
import { serviceNewsPath } from '@/constant/serviceConstant'

export interface NewsListParams {
  page?: number
  limit?: number
  /** Server queryNewsSchema: is_published (not is_active) */
  is_published?: boolean
  is_featured?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  lang?: string
}

export default {
  /** GET /news/featured */
  getFeatured: () => apiClient.get<ApiResponse<News[]>>(`${serviceNewsPath}/featured`),

  /** GET /news/recent */
  getRecent: () => apiClient.get<ApiResponse<News[]>>(`${serviceNewsPath}/recent`),

  /** GET /news */
  getAll: (params?: NewsListParams) =>
    apiClient.get<ApiResponse<NewsListData>>(serviceNewsPath, params),

  /** GET /news/:id */
  getById: (id: number) => apiClient.get<ApiResponse<NewsData>>(`${serviceNewsPath}/${id}`),

  /** POST /news  (multipart/form-data: title, content, slug?, summary?, thumbnail_url?, is_published?, is_featured?, tags?, published_at?) */
  create: (data: FormData) => apiClient.post<ApiResponse<News>>(serviceNewsPath, data, true),

  /** PUT /news/:id  (multipart/form-data: same fields as create) */
  update: (id: number, data: FormData) =>
    apiClient.put<ApiResponse<News>>(`${serviceNewsPath}/${id}`, data, true),

  /** PATCH /news/:id/toggle-published */
  togglePublished: (id: number) =>
    apiClient.patch<ApiResponse<News>>(`${serviceNewsPath}/${id}/toggle-published`),

  /** PATCH /news/:id/toggle-featured */
  toggleFeatured: (id: number) =>
    apiClient.patch<ApiResponse<News>>(`${serviceNewsPath}/${id}/toggle-featured`),

  /** DELETE /news/:id */
  delete: (id: number) => apiClient.del<ApiResponse<{}>>(`${serviceNewsPath}/${id}`),
}
