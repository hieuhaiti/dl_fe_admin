import apiClient from './common/apiClient'
import type { ApiResponse, Document, DocumentListData } from '@/types/api'
import { serviceDocumentPath } from '@/constant/serviceConstant'

export interface DocumentListParams {
  page?: number
  limit?: number
  is_active?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  lang?: string
}

export default {
  /** GET /documents */
  getAll: (params?: DocumentListParams) =>
    apiClient.get<ApiResponse<DocumentListData>>(serviceDocumentPath, params),

  /** GET /documents/:id */
  getById: (id: number) => apiClient.get<ApiResponse<Document>>(`${serviceDocumentPath}/${id}`),

  /** POST /documents  (multipart/form-data: document_number, title, description, file_url, document_type) */
  create: (data: FormData) =>
    apiClient.post<ApiResponse<Document>>(serviceDocumentPath, data, true),

  /** PUT /documents/:id  (multipart/form-data: document_number, title, description, file_url, document_type) */
  update: (id: number, data: FormData) =>
    apiClient.put<ApiResponse<Document>>(`${serviceDocumentPath}/${id}`, data, true),

  /** DELETE /documents/:id */
  delete: (id: number) => apiClient.del<ApiResponse<{}>>(`${serviceDocumentPath}/${id}`),
}
