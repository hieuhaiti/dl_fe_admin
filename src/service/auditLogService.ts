import apiClient from './common/apiClient'
import type { ApiResponse, AuditLogListData, VisitorStatistics } from '@/types/api'
import { serviceAuditLogPath } from '@/constant/serviceConstant'

export interface AuditLogListParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  start_date?: string
  end_date?: string
}

export default {
  /** GET /audit-logs */
  getAll: (params?: AuditLogListParams) =>
    apiClient.get<ApiResponse<AuditLogListData>>(serviceAuditLogPath, params),

  /** GET /audit-logs/visitor-statistics */
  getVisitorStatistics: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get<ApiResponse<VisitorStatistics>>(
      `${serviceAuditLogPath}/visitor-statistics`,
      params
    ),
}
