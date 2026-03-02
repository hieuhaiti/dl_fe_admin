import apiClient from './common/apiClient'
import type { ApiResponse, User, UserListData, UserListParams } from '@/types/api'
import { serviceUserPath } from '@/constant/serviceConstant'

export default {
  /** GET /users */
  getAll: (params?: UserListParams) =>
    apiClient.get<ApiResponse<UserListData>>(serviceUserPath, params),

  /** GET /users/:id */
  getById: (id: number) => apiClient.get<ApiResponse<User>>(`${serviceUserPath}/${id}`),

  /** POST /users  (multipart/form-data: username, email, password, full_name, phone, address, role_id, is_active, avatar_url) */
  create: (data: FormData) => apiClient.post<ApiResponse<User>>(serviceUserPath, data, true),

  /** PUT /users/:id  (multipart/form-data: full_name, phone, address, is_active, avatar_url) */
  update: (id: number, data: FormData) =>
    apiClient.put<ApiResponse<User>>(`${serviceUserPath}/${id}`, data, true),

  /** POST /users/:id/lock, body: { lockedUntil } */
  lock: (id: number, data: { lockedUntil: string }) =>
    apiClient.post<ApiResponse<User>>(`${serviceUserPath}/${id}/lock`, data),

  /** POST /users/:id/unlock */
  unlock: (id: number) => apiClient.post<ApiResponse<User>>(`${serviceUserPath}/${id}/unlock`),

  /** DELETE /users/:id */
  delete: (id: number) => apiClient.del<ApiResponse<{}>>(`${serviceUserPath}/${id}`),

  /** DELETE /users/batch, body: { userIds: number[] } */
  batchDelete: (data: { userIds: number[] }) =>
    apiClient.del<ApiResponse<{}>>(`${serviceUserPath}/batch`, data),
}
