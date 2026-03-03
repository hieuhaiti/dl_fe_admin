/** Server Joi: valid('excel','word','pdf') — these are the only accepted values */
export type DocumentType = 'excel' | 'word' | 'pdf'

/** Server state machine: active | archived | revoked | replaced */
export type DocumentStatus = 'active' | 'archived' | 'revoked' | 'replaced'

export interface Document {
  id: number
  document_number: string
  title: string
  description?: string
  document_type: DocumentType
  file_url: string
  file_name?: string
  file_size?: number
  file_type?: string
  issued_date?: string
  effective_date?: string
  expiry_date?: string
  issuer?: string
  signer?: string
  status: DocumentStatus
  view_count: number
  download_count: number
  is_public: boolean
  tags?: string[]
  metadata?: Record<string, any>
  created_by?: number
  updated_by?: number
  created_at: string
  updated_at: string
}

/** Server returns: { documents: Document[], pagination } */
export interface DocumentListData {
  documents: Document[]
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
  issuer?: string
  signer?: string
  status?: DocumentStatus
}

export interface DocumentListParams {
  page?: number
  limit?: number
  document_type?: DocumentType
  status?: DocumentStatus
  is_public?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}
