/**
 * SERVICE + TYPE SUMMARY — Đắk Lắk Border Security WebGIS Admin
 * ==============================================================
 * Copy-friendly overview of all 12 API service modules
 * with their full TypeScript types / validation shapes.
 *
 * Usage:
 *   import { SERVICE_SUMMARY } from '@/constant/serviceSummary'
 *   console.log(SERVICE_SUMMARY)      // in browser DevTools
 *   copy(SERVICE_SUMMARY)             // copies to clipboard (Chrome DevTools)
 */

export const SERVICE_SUMMARY = `
════════════════════════════════════════════════════════════════
  DAKLAK ADMIN — 12 SERVICE MODULES + TYPES
════════════════════════════════════════════════════════════════

────────────────────────────────────────────────────────────────
  SHARED BASE TYPES  (src/types/api/index.ts)
────────────────────────────────────────────────────────────────
ApiResponse<T> {
  message: string
  status: number
  data?: T
  errors?: string[]
  options?: Record<string,any>
}

Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

════════════════════════════════════════════════════════════════
  1. authService  →  /auth
════════════════════════════════════════════════════════════════
METHODS
  login({ login, password })                  POST /auth/login
  register({ username,email,password,… })     POST /auth/register
  refreshToken({ refreshToken })              POST /auth/refresh
  getProfile()                                GET  /auth/me
  updateProfile(FormData)                     PUT  /auth/me  [multipart]
  changePassword({ currentPassword,… })       POST /auth/change-password
  logout(data?)                               POST /auth/logout

TYPES  (src/types/api/authen.ts)
  AuthLoginData {
    accessToken: string
    refreshToken: string
    tokenType: string
    expiresIn: string
    refreshExpiresIn: string
  }
  AuthRegisterData extends AuthLoginData { user: User }
  AuthMeData { user: User }

════════════════════════════════════════════════════════════════
  2. userService  →  /users
════════════════════════════════════════════════════════════════
METHODS
  getAll(params?)                   GET    /users
  getById(id)                       GET    /users/:id
  create(FormData)                  POST   /users          [multipart]
  update(id, FormData)              PUT    /users/:id      [multipart]
  lock(id, { lockedUntil })         POST   /users/:id/lock
  unlock(id)                        POST   /users/:id/unlock
  delete(id)                        DELETE /users/:id
  batchDelete({ userIds })          DELETE /users/batch

TYPES  (src/types/api/user.ts)
  UserRole { id, name, description? }

  User {
    id, username, email, full_name, phone?, address?,
    avatar_url?, role_id, role?: UserRole,
    is_active, locked_until?, created_at, updated_at
  }

  UserListData { users: User[], pagination: Pagination }

  UserListParams (query) {
    page?, limit?, is_active?, search?, sortBy?, sortOrder?
  }

════════════════════════════════════════════════════════════════
  3. mapImageService  →  /map-images
════════════════════════════════════════════════════════════════
METHODS
  getAll(params?)           GET    /map-images
  getById(id)               GET    /map-images/:id
  create(FormData)          POST   /map-images        [multipart]
  update(id, FormData)      PUT    /map-images/:id    [multipart]
  toggleStatus(id)          PATCH  /map-images/:id/toggle-status
  delete(id)                DELETE /map-images/:id

TYPES  (src/types/api/mapImage.ts)
  MapImage {
    id, name, description?, image_url,
    is_active, created_by?, created_at, updated_at
  }

  MapImageListData { items: MapImage[], pagination: Pagination }

  MapImageFormData (multipart fields) {
    name: string
    description?: string
    image_url?: File
    is_active?: boolean
  }

  MapImageListParams (query) {
    page?, limit?, is_active?, search?, sortBy?, sortOrder?
  }

════════════════════════════════════════════════════════════════
  4. categoryService  →  /categories
════════════════════════════════════════════════════════════════
METHODS
  getAll(params?)           GET    /categories
  getById(id)               GET    /categories/:id
  create(FormData)          POST   /categories        [multipart]
  update(id, FormData)      PUT    /categories/:id    [multipart]
  toggleStatus(id)          PATCH  /categories/:id/toggle-status
  delete(id)                DELETE /categories/:id

TYPES  (src/types/api/category.ts)
  Category {
    id, name, description?, image_url?,
    is_active, created_at, updated_at
  }

  CategoryListData { items: Category[], pagination: Pagination }

  CategoryFormData (multipart fields) {
    name: string
    description?: string
    image_url?: File
  }

  CategoryListParams (query) {
    page?, limit?, is_active?, search?, sortBy?, sortOrder?
  }

════════════════════════════════════════════════════════════════
  5. newsService  →  /news
════════════════════════════════════════════════════════════════
METHODS
  getFeatured()             GET    /news/featured
  getRecent()               GET    /news/recent
  getAll(params?)           GET    /news
  getById(id)               GET    /news/:id
  create(FormData)          POST   /news              [multipart]
  update(id, FormData)      PUT    /news/:id          [multipart]
  togglePublished(id)       PATCH  /news/:id/toggle-published
  toggleFeatured(id)        PATCH  /news/:id/toggle-featured
  delete(id)                DELETE /news/:id

TYPES  (src/types/api/news.ts)
  News {
    id, title, slug, summary?, content, thumbnail_url?,
    is_published, is_featured, published_at?, tags?,
    view_count, author_id?, lang?, created_at, updated_at
  }

  NewsListData { items: News[], pagination: Pagination }

  NewsFormData (multipart fields) {
    title: string
    content: string
    slug?: string
    summary?: string
    thumbnail_url?: File
    is_published?: boolean
    is_featured?: boolean
    tags?: string         ← comma-separated
    published_at?: string
  }

  NewsListParams (query) {
    page?, limit?, is_active?, search?, sortBy?, sortOrder?, lang?
  }

════════════════════════════════════════════════════════════════
  6. newsCommentService  →  /news-comments
════════════════════════════════════════════════════════════════
METHODS
  getByNewsId(newsId, params?)          GET    /news-comments/news/:newsId
  getCountByNewsId(newsId)              GET    /news-comments/news/:newsId/count
  getById(id)                           GET    /news-comments/:id
  getPendingCount()                     GET    /news-comments/admin/pending/count
  delete(id)                            DELETE /news-comments/:id
  adminDelete(id)                       DELETE /news-comments/admin/:id
  approve(id)                           PATCH  /news-comments/admin/:id/approve

TYPES  (src/types/api/newsComment.ts)
  NewsComment {
    id, news_id, user_id, parent_id?,
    content, is_approved, created_at, updated_at,
    user?: { id, username, full_name, avatar_url? },
    replies?: NewsComment[]
  }

  NewsCommentListData { items: NewsComment[], pagination?: Pagination }

════════════════════════════════════════════════════════════════
  7. mapLayerService  →  /map-layers
════════════════════════════════════════════════════════════════
METHODS
  getAll(params?)                       GET    /map-layers
  getById(id)                           GET    /map-layers/:id
  getByCategory(categoryId)             GET    /map-layers/category/:categoryId
  getLostForestLayers(params?)          GET    /map-layers/lost-forest-layers
  getLostForestLayerById(id)            GET    /map-layers/lost-forest-layers/:id
  calculateLostArea(data)               POST   /map-layers/calculate-lost-area
  toggleStatusByCategory(categoryId)    PATCH  /map-layers/category/:categoryId/toggle-status
  create(data)                          POST   /map-layers
  createLostForestLayer(data)           POST   /map-layers/lost-forest-layers
  importGeoJson(FormData)               POST   /map-layers/import-geojson  [multipart]
  importExcel(FormData)                 POST   /map-layers/import-excel    [multipart]
  update(id, data)                      PUT    /map-layers/:id
  toggleStatus(id)                      PATCH  /map-layers/:id/toggle-status
  delete(id)                            DELETE /map-layers/:id

TYPES  (src/types/api/mapLayer.ts)
  GeometryType = 'point' | 'linestring' | 'polygon' | 'multipolygon' | 'multipoint' | string

  MapLayer {
    id, category_id, name, geometry_type: GeometryType,
    geometry_data?, properties?, is_active, is_lost_forest?,
    created_by?, created_at, updated_at, category?: Category
  }

  MapLayerListData { items: MapLayer[], pagination: Pagination }

  LostForestLayer extends MapLayer { description?, area_m2? }
  LostForestLayerListData { items: LostForestLayer[], pagination: Pagination }

  CreateMapLayerBody {
    category_id: number, name: string, geometry_type?: GeometryType,
    geometry_data?, properties?, is_active?
  }

  CreateLostForestLayerBody {
    category_id, name, description?,
    points: { latitude, longitude }[],
    auto_close_polygon?, properties?
  }

  CalculateLostAreaBody {
    points: { latitude, longitude }[]
    auto_close_polygon?: boolean
  }

  CalculateLostAreaResult { area_m2, area_ha, perimeter_m? }

  MapLayerListParams (query) {
    page?, limit?, is_active?, search?, sortBy?, sortOrder?,
    category_id?, geometry_type?
  }

  LostForestLayerListParams (query) {
    page?, limit?, category_id?, created_by?, sortBy?, sortOrder?
  }

════════════════════════════════════════════════════════════════
  8. mapLayerApiService  →  /map-layer-apis
════════════════════════════════════════════════════════════════
METHODS
  getAll(params?)                         GET    /map-layer-apis
  getById(id)                             GET    /map-layer-apis/:id
  create(data)                            POST   /map-layer-apis
  update(id, data)                        PUT    /map-layer-apis/:id
  delete(id)                              DELETE /map-layer-apis/:id
  ── Permissions ──
  getPermissions(apiId)                   GET    /map-layer-apis/:id/permissions
  addPermission(apiId, data)              POST   /map-layer-apis/:id/permissions
  deletePermission(apiId, permissionId)   DELETE /map-layer-apis/:id/permissions/:pId
  ── Shares ──
  getShares(apiId)                        GET    /map-layer-apis/:id/shares
  createShare(apiId, data)                POST   /map-layer-apis/:id/shares
  deleteShare(apiId, shareId)             DELETE /map-layer-apis/:id/shares/:shareId
  ── Share Keys (API Key) ──
  createShareKey(data)                    POST   /map-layer-apis/share-keys
  getBySlugWithKey(slug, apikey)          GET    /map-layer-apis/:slug?apikey=...
  revokeShareKey(keyId)                   PATCH  /map-layer-apis/share-keys/:keyId/revoke

TYPES  (src/types/api/mapLayerApi.ts)
  ApiStatus     = 'draft' | 'published'
  HttpMethod    = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  PrincipalType = 'user' | 'role' | 'public'
  PermissionLevel = 'view' | 'edit' | 'manage'

  MapLayerApi {
    id, category_id, name, slug, description?, endpoint_url,
    http_method: HttpMethod, status: ApiStatus, published_at?,
    created_by?, created_at, updated_at, category?: Category
  }

  MapLayerApiListData { items: MapLayerApi[], pagination: Pagination }

  CreateMapLayerApiBody {
    category_id, name, slug, description?,
    endpoint_url, http_method?: HttpMethod, status?: ApiStatus
  }

  ApiPermission {
    id, map_layer_api_id, principal_type: PrincipalType,
    user_id?, role_id?,
    can_view, can_edit, can_delete, can_share: boolean,
    created_at
  }

  AddPermissionBody {
    principal_type: PrincipalType, user_id?, role_id?,
    can_view?, can_edit?, can_delete?, can_share?
  }

  ApiShare {
    id, map_layer_api_id, shared_with_type: PrincipalType,
    shared_with_user_id?, shared_with_role_id?,
    permission_level: PermissionLevel, expires_at?, created_at
  }

  CreateShareBody {
    shared_with_type: PrincipalType, shared_with_user_id?,
    shared_with_role_id?, permission_level?, expires_at?
  }

  ShareKey {
    id: string, name, is_active, expires_at?, created_at, plain_key?
  }

  CreateShareKeyBody {
    name: string, expires_at?, map_layer_api_ids: number[]
  }

  MapLayerApiListParams (query) {
    page?, limit?, category_id?, status?: ApiStatus,
    search?, sortBy?, sortOrder?
  }

════════════════════════════════════════════════════════════════
  9. auditLogService  →  /audit-logs
════════════════════════════════════════════════════════════════
METHODS
  getAll(params?)                   GET  /audit-logs
  getVisitorStatistics(params?)     GET  /audit-logs/visitor-statistics

TYPES  (src/types/api/auditLog.ts)
  AuditLog {
    id, user_id?, action, resource_type, resource_id?, details?,
    ip_address?, user_agent?, created_at,
    user?: { id, username, full_name }
  }

  AuditLogListData { items: AuditLog[], pagination: Pagination }

  VisitorStatistics {
    total_visits, unique_visitors,
    daily: { date, count }[],
    weekly?: { week, count }[]
  }

  AuditLogListParams (query) {
    page?, limit?, search?, sortBy?, sortOrder?,
    start_date?, end_date?
  }

════════════════════════════════════════════════════════════════
  10. documentService  →  /documents
════════════════════════════════════════════════════════════════
METHODS
  getAll(params?)           GET    /documents
  getById(id)               GET    /documents/:id
  create(FormData)          POST   /documents         [multipart]
  update(id, FormData)      PUT    /documents/:id     [multipart]
  delete(id)                DELETE /documents/:id

TYPES  (src/types/api/document.ts)
  DocumentType = 'pdf' | 'docx' | 'xlsx' | 'pptx' | string

  Document {
    id, document_number, title, description?, file_url,
    document_type: DocumentType, is_active, lang?,
    created_by?, created_at, updated_at
  }

  DocumentListData { items: Document[], pagination: Pagination }

  DocumentFormData (multipart fields) {
    document_number: string, title: string, description?,
    file_url?: File, document_type: DocumentType
  }

  DocumentListParams (query) {
    page?, limit?, is_active?, search?, sortBy?, sortOrder?, lang?
  }

════════════════════════════════════════════════════════════════
  11. citizenFeedbackService  →  /citizen-feedbacks
════════════════════════════════════════════════════════════════
METHODS (Admin)
  getAll(params?)               GET    /citizen-feedbacks
  getByStatus(status, params?)  GET    /citizen-feedbacks/status/:status
  getStatistics(params?)        GET    /citizen-feedbacks/statistics
  updateStatus(id, data)        PATCH  /citizen-feedbacks/:id/status
  updateModeration(id, data)    PATCH  /citizen-feedbacks/:id/moderation
METHODS (User)
  getMyFeedbacks(params?)       GET    /citizen-feedbacks/my-feedbacks
  getById(id)                   GET    /citizen-feedbacks/:id
  create(FormData)              POST   /citizen-feedbacks  [multipart]
  update(id, data)              PUT    /citizen-feedbacks/:id
  delete(id)                    DELETE /citizen-feedbacks/:id

TYPES  (src/types/api/citizenFeedback.ts)
  FeedbackStatus    = 'pending' | 'in_progress' | 'resolved' | 'rejected' | 'closed'
  FeedbackPriority  = 'low' | 'normal' | 'high' | 'urgent'
  ModerationStatus  = 'pending' | 'approved' | 'rejected'

  CitizenFeedback {
    id, user_id, title, content, latitude?, longitude?,
    location_text?, priority: FeedbackPriority, status: FeedbackStatus,
    moderation_status: ModerationStatus, admin_response?,
    resolution_note?, forest_loss_area_estimate_m2?, images?: string[],
    responded_at?, created_at, updated_at,
    user?: { id, username, full_name, avatar_url? }
  }

  CitizenFeedbackListData { items: CitizenFeedback[], pagination: Pagination }

  FeedbackStatistics {
    total,
    by_status: Record<FeedbackStatus, number>,
    by_priority: Record<FeedbackPriority, number>,
    by_moderation: Record<ModerationStatus, number>,
    resolved_avg_hours?
  }

  UpdateFeedbackStatusBody {
    status: FeedbackStatus, admin_response?, resolution_note?
  }

  UpdateModerationBody {
    moderation_status: ModerationStatus, admin_response?
  }

  FeedbackListParams (query) {
    page?, limit?, search?, status?, moderation_status?,
    priority?, user_id?, start_date?, end_date?, sortBy?, sortOrder?
  }

  create() multipart fields:
    title, content, latitude?, longitude?, priority,
    location_text?, forest_loss_area_estimate_m2?, images[]

  update() JSON body:
    title?, content?, latitude?, longitude?, priority?: FeedbackPriority

════════════════════════════════════════════════════════════════
  12. searchService  →  /search
════════════════════════════════════════════════════════════════
METHODS
  searchByType(type, q)     GET  /search/:type?q=...
  getTypes()                GET  /search/types

TYPES  (src/types/api/search.ts)
  SearchType = 'map-layers' | 'news' | 'documents' | 'categories'

  SearchResultItem {
    id, type: SearchType, title, description?, url?, metadata?
  }

  SearchResult {
    query: string, type: SearchType,
    items: SearchResultItem[], total: number
  }

════════════════════════════════════════════════════════════════
  IMPORT QUICK-REFERENCE
════════════════════════════════════════════════════════════════
// Services
import {
  authService, userService, mapImageService, categoryService,
  newsService, newsCommentService, mapLayerService, mapLayerApiService,
  auditLogService, documentService, citizenFeedbackService, searchService,
} from '@/service'

// Types
import type {
  ApiResponse, Pagination,
  User, UserRole, UserListData,
  News, NewsListData, NewsFormData,
  Category, CategoryListData,
  MapImage, MapImageListData,
  NewsComment, NewsCommentListData,
  MapLayer, MapLayerListData, LostForestLayer, LostForestLayerListData,
  CreateMapLayerBody, CreateLostForestLayerBody,
  CalculateLostAreaBody, CalculateLostAreaResult, GeometryType,
  MapLayerApi, MapLayerApiListData, ApiPermission, ApiShare, ShareKey,
  CreateMapLayerApiBody, AddPermissionBody, CreateShareBody, CreateShareKeyBody,
  ApiStatus, HttpMethod, PrincipalType, PermissionLevel,
  AuditLog, AuditLogListData, VisitorStatistics,
  Document, DocumentListData, DocumentFormData, DocumentType,
  CitizenFeedback, CitizenFeedbackListData, FeedbackStatistics,
  UpdateFeedbackStatusBody, UpdateModerationBody,
  FeedbackStatus, FeedbackPriority, ModerationStatus,
  SearchType, SearchResultItem, SearchResult,
} from '@/types/api'
════════════════════════════════════════════════════════════════
`
