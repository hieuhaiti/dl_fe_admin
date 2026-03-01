/** Server Joi: valid('polygon','line','point') — client must map GeoJSON types before sending */
export type GeometryType = 'point' | 'line' | 'polygon'

export interface MapLayer {
  id: number
  category_id: number
  name: string
  geometry_type: GeometryType
  geometry_data?: object | string
  properties?: Record<string, any>
  is_active: boolean
  is_lost_forest?: boolean
  created_by?: number
  created_at: string
  updated_at: string
  category?: import('./category').Category
}

export interface MapLayerListData {
  items: MapLayer[]
  pagination: import('./index').Pagination
}

export interface LostForestLayer extends MapLayer {
  description?: string
  area_m2?: number
}

export interface LostForestLayerListData {
  items: LostForestLayer[]
  pagination: import('./index').Pagination
}

export interface CreateMapLayerBody {
  category_id: number
  name: string
  /** Required by server; map GeoJSON types: LineString→line, Polygon→polygon, Point→point */
  geometry_type: GeometryType
  /** Required by server; pass object (JSON body) or stringified JSON (multipart) */
  geometry_data: object | string
  properties?: Record<string, any>
  is_active?: boolean
}

export interface CreateLostForestLayerBody {
  category_id: number
  name: string
  description?: string
  points: Array<{ latitude: number; longitude: number }>
  auto_close_polygon?: boolean
  properties?: Record<string, any>
}

export interface CalculateLostAreaBody {
  points: Array<{ latitude: number; longitude: number }>
  auto_close_polygon?: boolean
}

export interface CalculateLostAreaResult {
  area_m2: number
  area_ha: number
  perimeter_m?: number
}
