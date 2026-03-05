import apiClient from '@/service/common/apiClient'
import { serviceApiKeyPath, serviceMapLayerApiPath } from '@/constant/serviceConstant'
import type {
  AddPermissionBody,
  ApiKey,
  ApiKeyListData,
  ApiKeyListParams,
  ApiShare,
  CreateApiKeyBody,
  CreateApiKeyResponseData,
  ApiPermission,
  CreateMapLayerApiBody,
  CreateShareBody,
  MapLayerApi,
  MapLayerApiListData,
  MapLayerApiListParams,
  PublicMapLayerApiData,
  UpdateMapLayerApiBody,
} from '@/types/api'

const mapLayerApiClient = {
  getAll: (params?: MapLayerApiListParams) =>
    apiClient.get<MapLayerApiListData>(serviceMapLayerApiPath, params),

  getById: (id: number) => apiClient.get<MapLayerApi>(`${serviceMapLayerApiPath}/${id}`),

  getBySlugWithKey: (slug: string, apikey: string) =>
    apiClient.get<PublicMapLayerApiData>(`${serviceMapLayerApiPath}/${slug}`, {
      apikey,
    }),

  create: (data: CreateMapLayerApiBody) =>
    apiClient.post<MapLayerApi>(serviceMapLayerApiPath, data),

  update: (id: number, data: UpdateMapLayerApiBody) =>
    apiClient.put<MapLayerApi>(`${serviceMapLayerApiPath}/${id}`, data),

  delete: (id: number) => apiClient.del<null>(`${serviceMapLayerApiPath}/${id}`),

  getPermissions: (apiId: number) =>
    apiClient.get<ApiPermission[]>(`${serviceMapLayerApiPath}/${apiId}/permissions`),

  addPermission: (apiId: number, data: AddPermissionBody) =>
    apiClient.post<ApiPermission>(`${serviceMapLayerApiPath}/${apiId}/permissions`, data),

  deletePermission: (apiId: number, permissionId: number) =>
    apiClient.del<null>(`${serviceMapLayerApiPath}/${apiId}/permissions/${permissionId}`),

  getShares: (apiId: number) =>
    apiClient.get<ApiShare[]>(`${serviceMapLayerApiPath}/${apiId}/shares`),

  createShare: (apiId: number, data: CreateShareBody) =>
    apiClient.post<ApiShare>(`${serviceMapLayerApiPath}/${apiId}/shares`, data),

  deleteShare: (apiId: number, shareId: number) =>
    apiClient.del<null>(`${serviceMapLayerApiPath}/${apiId}/shares/${shareId}`),

  getApiKeys: (params?: ApiKeyListParams) =>
    apiClient.get<ApiKeyListData | ApiKey[]>(serviceApiKeyPath, params),

  getApiKeyById: (id: number) => apiClient.get<ApiKey>(`${serviceApiKeyPath}/${id}`),

  createApiKey: (data: CreateApiKeyBody) =>
    apiClient.post<CreateApiKeyResponseData>(serviceApiKeyPath, data),

  revokeApiKey: (apiKeyId: number) =>
    apiClient.patch<ApiKey>(`${serviceApiKeyPath}/${apiKeyId}/revoke`),

  deleteApiKey: (apiKeyId: number) => apiClient.del<null>(`${serviceApiKeyPath}/${apiKeyId}`),

  // Backward-compatible aliases
  getShareKeys: (params?: ApiKeyListParams) =>
    apiClient.get<ApiKeyListData | ApiKey[]>(serviceApiKeyPath, params),

  createShareKey: (data: CreateApiKeyBody) =>
    apiClient.post<CreateApiKeyResponseData>(serviceApiKeyPath, data),

  revokeShareKey: (apiKeyId: number) =>
    apiClient.patch<ApiKey>(`${serviceApiKeyPath}/${apiKeyId}/revoke`),
}

export default mapLayerApiClient
