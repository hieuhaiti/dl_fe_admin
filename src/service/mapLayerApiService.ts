import apiClient from './common/apiClient'
import type {
  ApiResponse,
  MapLayerApi,
  MapLayerApiListData,
  MapLayerApiListParams,
  ApiPermission,
  ApiShare,
  ShareKey,
  CreateMapLayerApiBody,
  AddPermissionBody,
  CreateShareBody,
  CreateShareKeyBody,
} from '@/types/api'
import { serviceMapLayerApiPath } from '@/constant/serviceConstant'

export default {
  // ── CRUD ──

  /** GET /map-layer-apis */
  getAll: (params?: MapLayerApiListParams) =>
    apiClient.get<ApiResponse<MapLayerApiListData>>(serviceMapLayerApiPath, params),

  /** GET /map-layer-apis/:id */
  getById: (id: number) =>
    apiClient.get<ApiResponse<MapLayerApi>>(`${serviceMapLayerApiPath}/${id}`),

  /** POST /map-layer-apis */
  create: (data: CreateMapLayerApiBody) =>
    apiClient.post<ApiResponse<MapLayerApi>>(serviceMapLayerApiPath, data),

  /** PUT /map-layer-apis/:id */
  update: (id: number, data: Partial<CreateMapLayerApiBody>) =>
    apiClient.put<ApiResponse<MapLayerApi>>(`${serviceMapLayerApiPath}/${id}`, data),

  /** DELETE /map-layer-apis/:id */
  delete: (id: number) => apiClient.del<ApiResponse<{}>>(`${serviceMapLayerApiPath}/${id}`),

  // ── Permissions ──

  /** GET /map-layer-apis/:id/permissions */
  getPermissions: (apiId: number) =>
    apiClient.get<ApiResponse<ApiPermission[]>>(`${serviceMapLayerApiPath}/${apiId}/permissions`),

  /** POST /map-layer-apis/:id/permissions */
  addPermission: (apiId: number, data: AddPermissionBody) =>
    apiClient.post<ApiResponse<ApiPermission>>(
      `${serviceMapLayerApiPath}/${apiId}/permissions`,
      data
    ),

  /** DELETE /map-layer-apis/:id/permissions/:permissionId */
  deletePermission: (apiId: number, permissionId: number) =>
    apiClient.del<ApiResponse<{}>>(
      `${serviceMapLayerApiPath}/${apiId}/permissions/${permissionId}`
    ),

  // ── Shares ──

  /** GET /map-layer-apis/:id/shares */
  getShares: (apiId: number) =>
    apiClient.get<ApiResponse<ApiShare[]>>(`${serviceMapLayerApiPath}/${apiId}/shares`),

  /** POST /map-layer-apis/:id/shares */
  createShare: (apiId: number, data: CreateShareBody) =>
    apiClient.post<ApiResponse<ApiShare>>(`${serviceMapLayerApiPath}/${apiId}/shares`, data),

  /** DELETE /map-layer-apis/:id/shares/:shareId */
  deleteShare: (apiId: number, shareId: number) =>
    apiClient.del<ApiResponse<{}>>(`${serviceMapLayerApiPath}/${apiId}/shares/${shareId}`),

  // ── Share Keys (API Key) ──

  /** POST /map-layer-apis/share-keys */
  createShareKey: (data: CreateShareKeyBody) =>
    apiClient.post<ApiResponse<ShareKey>>(`${serviceMapLayerApiPath}/share-keys`, data),

  /** GET /map-layer-apis/:slug?apikey=... */
  getBySlugWithKey: (slug: string, apikey: string) =>
    apiClient.get<ApiResponse<MapLayerApi>>(`${serviceMapLayerApiPath}/${slug}`, { apikey }),

  /** PATCH /map-layer-apis/share-keys/:keyId/revoke */
  revokeShareKey: (keyId: string) =>
    apiClient.patch<ApiResponse<ShareKey>>(`${serviceMapLayerApiPath}/share-keys/${keyId}/revoke`),
}
