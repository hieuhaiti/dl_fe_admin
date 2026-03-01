import apiClient from './common/apiClient'
import type { ApiResponse, MapImage, MapImageListData } from '@/types/api'
import { serviceMapImagePath } from '@/constant/serviceConstant'

export interface MapImageListParams {
  page?: number
  limit?: number
  is_active?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export default {
  /** GET /map-images */
  getAll: (params?: MapImageListParams) =>
    apiClient.get<ApiResponse<MapImageListData>>(serviceMapImagePath, params),

  /** GET /map-images/:id */
  getById: (id: number) => apiClient.get<ApiResponse<MapImage>>(`${serviceMapImagePath}/${id}`),

  /** POST /map-images  (multipart/form-data: name, description, image_url, is_active) */
  create: (data: FormData) =>
    apiClient.post<ApiResponse<MapImage>>(serviceMapImagePath, data, true),

  /** PUT /map-images/:id  (multipart/form-data: name, description, image_url, is_active) */
  update: (id: number, data: FormData) =>
    apiClient.put<ApiResponse<MapImage>>(`${serviceMapImagePath}/${id}`, data, true),

  /** PATCH /map-images/:id/toggle-status */
  toggleStatus: (id: number) =>
    apiClient.patch<ApiResponse<MapImage>>(`${serviceMapImagePath}/${id}/toggle-status`),

  /** DELETE /map-images/:id */
  delete: (id: number) => apiClient.del<ApiResponse<{}>>(`${serviceMapImagePath}/${id}`),
}
