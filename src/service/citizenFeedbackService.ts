import apiClient from './common/apiClient'
import type {
  ApiResponse,
  CitizenFeedback,
  CitizenFeedbackListData,
  FeedbackListParams,
  FeedbackStatistics,
  UpdateFeedbackStatusBody,
  UpdateModerationBody,
  FeedbackStatus,
  FeedbackPriority,
} from '@/types/api'
import { serviceFeedbackPath } from '@/constant/serviceConstant'

export default {
  // ── Admin ──

  /** GET /citizen-feedbacks (admin: all, with filter & pagination) */
  getAll: (params?: FeedbackListParams) =>
    apiClient.get<ApiResponse<CitizenFeedbackListData>>(serviceFeedbackPath, params),

  /** GET /citizen-feedbacks/status/:status */
  getByStatus: (status: FeedbackStatus, params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<CitizenFeedbackListData>>(
      `${serviceFeedbackPath}/status/${status}`,
      params
    ),

  /** GET /citizen-feedbacks/statistics */
  getStatistics: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get<ApiResponse<FeedbackStatistics>>(`${serviceFeedbackPath}/statistics`, params),

  /** PATCH /citizen-feedbacks/:id/status */
  updateStatus: (id: number, data: UpdateFeedbackStatusBody) =>
    apiClient.patch<ApiResponse<CitizenFeedback>>(`${serviceFeedbackPath}/${id}/status`, data),

  /** PATCH /citizen-feedbacks/:id/moderation */
  updateModeration: (id: number, data: UpdateModerationBody) =>
    apiClient.patch<ApiResponse<CitizenFeedback>>(`${serviceFeedbackPath}/${id}/moderation`, data),

  // ── User ──

  /** GET /citizen-feedbacks/my-feedbacks */
  getMyFeedbacks: (params?: FeedbackListParams) =>
    apiClient.get<ApiResponse<CitizenFeedbackListData>>(
      `${serviceFeedbackPath}/my-feedbacks`,
      params
    ),

  /** GET /citizen-feedbacks/:id */
  getById: (id: number) =>
    apiClient.get<ApiResponse<CitizenFeedback>>(`${serviceFeedbackPath}/${id}`),

  /** POST /citizen-feedbacks  (multipart/form-data: title, content, latitude, longitude, priority, location_text, forest_loss_area_estimate_m2, images[]) */
  create: (data: FormData) =>
    apiClient.post<ApiResponse<CitizenFeedback>>(serviceFeedbackPath, data, true),

  /** PUT /citizen-feedbacks/:id */
  update: (
    id: number,
    data: {
      title?: string
      content?: string
      latitude?: number
      longitude?: number
      priority?: FeedbackPriority
    }
  ) => apiClient.put<ApiResponse<CitizenFeedback>>(`${serviceFeedbackPath}/${id}`, data),

  /** DELETE /citizen-feedbacks/:id */
  delete: (id: number) => apiClient.del<ApiResponse<{}>>(`${serviceFeedbackPath}/${id}`),
}
