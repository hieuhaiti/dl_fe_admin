export interface ApiResponse<T = any> {
  message: string
  status: number
  data?: T
  errors?: string[]
  options?: Record<string, any>
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type * from './authen'
export type * from './user'
export type * from './mapImage'
export type * from './category'
export type * from './news'
export type * from './newsComment'
export type * from './mapLayer'
export type * from './mapLayerApi'
export type * from './auditLog'
export type * from './document'
export type * from './citizenFeedback'
export type * from './search'
export type * from './statistics'
