import apiClient from './common/apiClient'
import type { ApiResponse, Category, CategoryListData } from '@/types/api'
import { serviceCategoryPath } from '@/constant/serviceConstant'

export interface CategoryListParams {
  page?: number
  limit?: number
  is_active?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export default {
  /** GET /categories */
  getAll: (params?: CategoryListParams) =>
    apiClient.get<ApiResponse<CategoryListData>>(serviceCategoryPath, params),

  /** GET /categories/:id */
  getById: (id: number) => apiClient.get<ApiResponse<Category>>(`${serviceCategoryPath}/${id}`),

  /** POST /categories  (multipart/form-data: name, description, image_url) */
  create: (data: FormData) =>
    apiClient.post<ApiResponse<Category>>(serviceCategoryPath, data, true),

  /** PUT /categories/:id  (multipart/form-data: name, description, image_url) */
  update: (id: number, data: FormData) =>
    apiClient.put<ApiResponse<Category>>(`${serviceCategoryPath}/${id}`, data, true),

  /** PATCH /categories/:id/toggle-status */
  toggleStatus: (id: number) =>
    apiClient.patch<ApiResponse<Category>>(`${serviceCategoryPath}/${id}/toggle-status`),

  /** DELETE /categories/:id */
  delete: (id: number) => apiClient.del<ApiResponse<{}>>(`${serviceCategoryPath}/${id}`),
}
