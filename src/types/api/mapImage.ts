export interface MapImage {
  id: number
  name: string
  description?: string
  image_url: string
  is_active: boolean
  created_by?: number
  created_at: string
  updated_at: string
}

export interface MapImageListData {
  items: MapImage[]
  pagination: import('./index').Pagination
}

/** POST / PUT multipart fields */
export interface MapImageFormData {
  name: string
  description?: string
  image_url?: File
  is_active?: boolean
}
