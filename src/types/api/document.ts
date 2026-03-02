/** Server Joi: valid('excel','word','pdf') — these are the only accepted values */
export type DocumentType = 'excel' | 'word' | 'pdf'

/** Server state machine: active → archived | revoked | replaced */
export type DocumentStatus = 'active' | 'archived' | 'revoked' | 'replaced'

export interface Document {
  id: number
  document_number: string
  title: string
  description?: string
  file_url: string
  document_type: DocumentType
  /** State machine field — replaces is_active */
  status: DocumentStatus
  is_public?: boolean
  lang?: string
  issued_date?: string
  effective_date?: string
  expiry_date?: string
  tags?: string[]
  metadata?: Record<string, any>
  created_by?: number
  created_at: string
  updated_at: string
}

export interface DocumentListData {
  items: Document[]
  pagination: import('./index').Pagination
}

export interface DocumentFormData {
  document_number: string
  title: string
  description?: string
  /** Upload as File in multipart/form-data; server converts to URL string before Joi validation */
  file_url?: File
  document_type: DocumentType
  is_public?: boolean
  issued_date?: string
  effective_date?: string
  expiry_date?: string
}

export interface DocumentListParams {
  page?: number
  limit?: number
  is_active?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  lang?: string
}
