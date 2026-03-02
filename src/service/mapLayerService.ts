import apiClient from './common/apiClient'
import type {
  ApiResponse,
  MapLayer,
  MapLayerListData,
  MapLayerListParams,
  LostForestLayer,
  LostForestLayerListData,
  LostForestLayerListParams,
  CreateMapLayerBody,
  CreateLostForestLayerBody,
  CalculateLostAreaBody,
  CalculateLostAreaResult,
} from '@/types/api'
import { serviceMapLayerPath } from '@/constant/serviceConstant'

export default {
  /** GET /map-layers */
  getAll: (params?: MapLayerListParams) =>
    apiClient.get<ApiResponse<MapLayerListData>>(serviceMapLayerPath, params),

  /** GET /map-layers/:id */
  getById: (id: number) => apiClient.get<ApiResponse<MapLayer>>(`${serviceMapLayerPath}/${id}`),

  /** GET /map-layers/category/:categoryId */
  getByCategory: (categoryId: number) =>
    apiClient.get<ApiResponse<MapLayer[]>>(`${serviceMapLayerPath}/category/${categoryId}`),

  /** GET /map-layers/lost-forest-layers */
  getLostForestLayers: (params?: LostForestLayerListParams) =>
    apiClient.get<ApiResponse<LostForestLayerListData>>(
      `${serviceMapLayerPath}/lost-forest-layers`,
      params
    ),

  /** GET /map-layers/lost-forest-layers/:id */
  getLostForestLayerById: (id: number) =>
    apiClient.get<ApiResponse<LostForestLayer>>(`${serviceMapLayerPath}/lost-forest-layers/${id}`),

  /** POST /map-layers/calculate-lost-area */
  calculateLostArea: (data: CalculateLostAreaBody) =>
    apiClient.post<ApiResponse<CalculateLostAreaResult>>(
      `${serviceMapLayerPath}/calculate-lost-area`,
      data
    ),

  /** PATCH /map-layers/category/:categoryId/toggle-status */
  toggleStatusByCategory: (categoryId: number) =>
    apiClient.patch<ApiResponse<{}>>(`${serviceMapLayerPath}/category/${categoryId}/toggle-status`),

  /** POST /map-layers */
  create: (data: CreateMapLayerBody) =>
    apiClient.post<ApiResponse<MapLayer>>(serviceMapLayerPath, data),

  /** POST /map-layers/lost-forest-layers */
  createLostForestLayer: (data: CreateLostForestLayerBody) =>
    apiClient.post<ApiResponse<LostForestLayer>>(`${serviceMapLayerPath}/lost-forest-layers`, data),

  /** POST /map-layers/import-geojson  (multipart/form-data: category_id, name, is_active, geojson_file, properties?) */
  importGeoJson: (data: FormData) =>
    apiClient.post<ApiResponse<MapLayer>>(`${serviceMapLayerPath}/import-geojson`, data, true),

  /** POST /map-layers/import-excel  (multipart/form-data: category_id, name, is_active, excel_file, properties?) */
  importExcel: (data: FormData) =>
    apiClient.post<ApiResponse<MapLayer>>(`${serviceMapLayerPath}/import-excel`, data, true),

  /** PUT /map-layers/:id */
  update: (id: number, data: Partial<CreateMapLayerBody>) =>
    apiClient.put<ApiResponse<MapLayer>>(`${serviceMapLayerPath}/${id}`, data),

  /** PATCH /map-layers/:id/toggle-status */
  toggleStatus: (id: number) =>
    apiClient.patch<ApiResponse<MapLayer>>(`${serviceMapLayerPath}/${id}/toggle-status`),

  /** DELETE /map-layers/:id */
  delete: (id: number) => apiClient.del<ApiResponse<{}>>(`${serviceMapLayerPath}/${id}`),
}
