import apiClient from './common/apiClient'
import type {
  ApiResponse,
  Notification,
  NotificationListData,
  NotificationListParams,
} from '@/types/api'
import { serviceNotificationPath } from '@/constant/serviceConstant'

export default {
  /** GET /notifications/me */
  getMy: (params?: NotificationListParams) =>
    apiClient.get<ApiResponse<NotificationListData>>(
      `${serviceNotificationPath}/me`,
      params
    ),

  /** PATCH /notifications/:id/read */
  markAsRead: (id: number) =>
    apiClient.patch<ApiResponse<{ notification: Notification }>>(
      `${serviceNotificationPath}/${id}/read`
    ),

  /** PATCH /notifications/read-all */
  markAllAsRead: () =>
    apiClient.patch<ApiResponse<{ updated_count: number }>>(
      `${serviceNotificationPath}/read-all`
    ),

  /** DELETE /notifications/:id */
  delete: (id: number) =>
    apiClient.del<ApiResponse<{}>>(`${serviceNotificationPath}/${id}`),

  /** DELETE /notifications */
  deleteAll: () =>
    apiClient.del<ApiResponse<{ deleted_count: number }>>(`${serviceNotificationPath}`),
}
