import { useEffect, useState } from 'react'
import { z } from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { categoryService, mapLayerApiService, useApiQuery } from '@/service'
import type {
  ApiResponse,
  CategoryListData,
  CreateMapLayerApiBody,
  HttpMethod,
  MapLayerApi,
} from '@/types/api'
import { toast } from 'react-toastify'

interface MapLayerApiFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiId: number | null
  onSubmit: (data: CreateMapLayerApiBody) => void
  isLoading?: boolean
}

type MapLayerApiDetailData = MapLayerApi | { mapLayerApi?: MapLayerApi }

// Đồng bộ server: createApiSchema / updateApiSchema
const endpointUrlRegex = /^(https?:\/\/.+|\/[^\s]*)$/
const mapLayerApiSchema = z.object({
  category_id: z
    .number({ message: 'Vui l?ng ch?n danh m?c' })
    .int()
    .min(1, 'Vui l?ng ch?n danh m?c'),
  name: z
    .string()
    .trim()
    .min(2, 'T?n API ph?i c? ?t nh?t 2 k? t?')
    .max(255, 'T?n API kh?ng ???c v??t qu? 255 k? t?'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug ph?i c? ?t nh?t 2 k? t?')
    .max(255, 'Slug kh?ng ???c v??t qu? 255 k? t?'),
  description: z.string().trim().optional().or(z.literal('')),
  endpoint_url: z
    .string()
    .trim()
    .regex(
      endpointUrlRegex,
      'endpoint_url ph?i l? URL h?p l? (http/https) ho?c ???ng d?n t??ng ??i b?t ??u b?ng /'
    ),
  http_method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
  status: z.enum(['draft', 'published']).optional(),
})

export default function MapLayerApiFormDialog({
  open,
  onOpenChange,
  apiId,
  onSubmit,
  isLoading = false,
}: MapLayerApiFormDialogProps) {
  const [categoryId, setCategoryId] = useState<string>('')
  const [categorySearch, setCategorySearch] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [slug, setSlug] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [endpointUrl, setEndpointUrl] = useState<string>('')
  const [httpMethod, setHttpMethod] = useState<HttpMethod>('GET')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')

  const categoryQuery = useApiQuery(
    ['categories', { page: 1, limit: 100, search: categorySearch }],
    () =>
      categoryService.getAll({
        page: 1,
        limit: 100,
        sortBy: 'id',
        sortOrder: 'ASC',
        ...(categorySearch.trim() && { search: categorySearch.trim() }),
      }),
    { enabled: open },
    false,
    false
  )

  const apiQuery = useApiQuery(
    ['mapLayerApi', apiId],
    () => mapLayerApiService.getById(apiId!),
    { enabled: !!apiId && open, staleTime: 0 },
    false,
    false
  )

  const categories = ((categoryQuery.data as ApiResponse<CategoryListData>)?.data?.categories ??
    []) as Array<{ id: number; name: string }>
  const responseData = (apiQuery.data as ApiResponse<MapLayerApiDetailData>)?.data
  const api =
    responseData && 'mapLayerApi' in responseData
      ? ((responseData as { mapLayerApi?: MapLayerApi }).mapLayerApi ?? null)
      : ((responseData as MapLayerApi) ?? null)
  const isEdit = !!apiId

  useEffect(() => {
    if (!open) return
    if (!isEdit) {
      setCategoryId('')
      setCategorySearch('')
      setName('')
      setSlug('')
      setDescription('')
      setEndpointUrl('')
      setHttpMethod('GET')
      setStatus('draft')
      return
    }

    if (api) {
      setCategoryId(String(api.category_id || ''))
      setName(api.name || '')
      setSlug(api.slug || '')
      setDescription(api.description || '')
      setEndpointUrl(api.endpoint_url || '')
      setHttpMethod((api.http_method || 'GET') as HttpMethod)
      setStatus((api.status || 'draft') as 'draft' | 'published')
    }
  }, [open, isEdit, api])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const validation = mapLayerApiSchema.safeParse({
      category_id: categoryId ? Number(categoryId) : undefined,
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      endpoint_url: endpointUrl.trim(),
      http_method: httpMethod,
      status,
    })
    if (!validation.success) {
      const first = validation.error.issues[0]
      toast.error(first?.message || 'Dữ liệu không hợp lệ')
      return
    }

    onSubmit({
      category_id: Number(categoryId),
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      endpoint_url: endpointUrl.trim(),
      http_method: httpMethod,
      status,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogTitle>{isEdit ? 'Chỉnh sửa API lớp bản đồ' : 'Thêm API lớp bản đồ mới'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Cập nhật thông tin API' : 'Điền thông tin để tạo API lớp bản đồ mới'}
        </DialogDescription>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>
              Danh mục <span className="text-destructive">*</span>
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <div className="bg-popover sticky top-0 z-10 p-1">
                  <Input
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    placeholder="Tìm danh mục..."
                  />
                </div>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-name">
              Tên API <span className="text-destructive">*</span>
            </Label>
            <Input
              id="api-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên API"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-slug">
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="api-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="map-layer-api-slug"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint-url">
              Endpoint URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="endpoint-url"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              placeholder="https://api.example.com/map-layer"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>HTTP Method</Label>
              <Select
                value={httpMethod}
                onValueChange={(value) => setHttpMethod(value as HttpMethod)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as 'draft' | 'published')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả API..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
