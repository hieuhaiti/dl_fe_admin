import apiClient from './common/apiClient'
import type { ApiResponse, AuthLoginData, AuthRegisterData, AuthMeData } from '@/types/api'
import { serviceAuthPath } from '@/constant/serviceConstant'

export default {
  /** POST /auth/login */
  login: (data: { login: string; password: string }) =>
    apiClient.post<ApiResponse<AuthLoginData>>(`${serviceAuthPath}/login`, data),

  /** POST /auth/register */
  register: (data: {
    username: string
    email: string
    password: string
    confirmPassword: string
  }) => apiClient.post<ApiResponse<AuthRegisterData>>(`${serviceAuthPath}/register`, data),

  /** POST /auth/refresh */
  refreshToken: (data: { refreshToken: string }) =>
    apiClient.post<ApiResponse<Pick<AuthLoginData, 'accessToken'>>>(
      `${serviceAuthPath}/refresh`,
      data
    ),

  /** GET /auth/me */
  getProfile: () => apiClient.get<AuthMeData>(`${serviceAuthPath}/me`),

  /** PUT /auth/me  (multipart/form-data: full_name, phone, address_detail, avatar_url) */
  updateProfile: (data: FormData) =>
    apiClient.put<ApiResponse<AuthMeData>>(`${serviceAuthPath}/me`, data, true),

  /** POST /auth/change-password */
  changePassword: (data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => apiClient.post<ApiResponse<{}>>(`${serviceAuthPath}/change-password`, data),

  /** POST /auth/logout */
  logout: (data?: { refreshToken?: string }) =>
    apiClient.post<ApiResponse<{}>>(`${serviceAuthPath}/logout`, data ?? {}),
}
