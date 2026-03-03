import { useEffect, useMemo, useState } from 'react'
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
import { categoryService, mapLayerService, useApiQuery } from '@/service'
import GeoJsonMapPreview from '@/components/features/GeoJsonMapPreview'
import type {
  ApiResponse,
  CategoryListData,
  CreateMapLayerBody,
  MapLayer,
  GeometryType,
} from '@/types/api'
import { toast } from 'react-toastify'

interface MapLayerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  layerId: number | null
  onSubmit: (data: CreateMapLayerBody) => void
  isLoading?: boolean
}

type MapLayerDetailData = MapLayer | { mapLayer?: MapLayer }

export const mapLayerSchema = z.object({
  category_id: z
    .number({ message: 'Vui lòng chọn danh mục' })
    .int({ message: 'Danh mục phải là số nguyên' })
    .min(1, { message: 'Vui lòng chọn danh mục' }),

  name: z
    .string({ message: 'Tên lớp bản đồ là bắt buộc' })
    .trim()
    .min(2, { message: 'Tên lớp bản đồ phải có ít nhất 2 ký tự' })
    .max(255, { message: 'Tên lớp bản đồ không được vượt quá 255 ký tự' }),

  geometry_type: z.enum(['polygon', 'line', 'point'], {
      message: "Kiểu hình học phải là một trong: 'polygon', 'line', 'point'",
  }),

  geometry_data: z.union([
    z.record(z.string(), z.any(), {
      message: 'Dữ liệu hình học phải là GeoJSON object hoặc WKT string',
    }),
    z
      .string({ message: 'Dữ liệu hình học phải là GeoJSON object hoặc WKT string' })
      .trim()
      .min(2, { message: 'Dữ liệu hình học phải là GeoJSON object hoặc WKT string' }),
  ]),

  properties: z.record(z.string(), z.any()).nullable().optional(),

  is_active: z.boolean().optional(),
})

function stringifyJson(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return ''
  }
}

function extractGeoJson(raw: any): GeoJSON.GeoJSON | null {
  if (!raw || typeof raw !== 'object') return null
  if (raw.type === 'FeatureCollection' && Array.isArray(raw.features))
    return raw as GeoJSON.FeatureCollection
  if (raw.type === 'Feature' && raw.geometry) return raw as GeoJSON.Feature
  if (typeof raw.type === 'string' && raw.coordinates) return raw as GeoJSON.Geometry
  return null
}

function toNumber(value: string): number | null {
  const parsed = Number(value.trim())
  return Number.isFinite(parsed) ? parsed : null
}

function extractPointCoordinates(raw: unknown): { lat: number; lng: number } | null {
  if (!raw) return null
  let input = raw
  if (typeof raw === 'string') {
    try {
      input = JSON.parse(raw)
    } catch {
      return null
    }
  }
  if (!input || typeof input !== 'object') return null
  const geometry = extractGeoJson(input as any)
  if (!geometry) return null

  if (
    geometry.type === 'Point' &&
    Array.isArray(geometry.coordinates) &&
    geometry.coordinates.length >= 2
  ) {
    const lng = Number(geometry.coordinates[0])
    const lat = Number(geometry.coordinates[1])
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
  }

  if (
    geometry.type === 'Feature' &&
    geometry.geometry?.type === 'Point' &&
    Array.isArray(geometry.geometry.coordinates) &&
    geometry.geometry.coordinates.length >= 2
  ) {
    const lng = Number(geometry.geometry.coordinates[0])
    const lat = Number(geometry.geometry.coordinates[1])
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
  }

  return null
}

export default function MapLayerFormDialog({
  open,
  onOpenChange,
  layerId,
  onSubmit,
  isLoading = false,
}: MapLayerFormDialogProps) {
  const [categoryId, setCategoryId] = useState<string>('')
  const [categorySearch, setCategorySearch] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [geometryType, setGeometryType] = useState<GeometryType>('polygon')
  const [isActive, setIsActive] = useState<'true' | 'false'>('true')
  const [latitude, setLatitude] = useState<string>('')
  const [longitude, setLongitude] = useState<string>('')
  const [geometryDataText, setGeometryDataText] = useState<string>('')
  const [propertiesText, setPropertiesText] = useState<string>('')

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

  const layerQuery = useApiQuery(
    ['mapLayer', layerId],
    () => mapLayerService.getById(layerId!),
    { enabled: !!layerId && open, staleTime: 0 },
    false,
    false
  )

  const categories = ((categoryQuery.data as ApiResponse<CategoryListData>)?.data?.categories ??
    []) as Array<{ id: number; name: string }>

  const responseData = (layerQuery.data as ApiResponse<MapLayerDetailData>)?.data
  const layer =
    (responseData && 'mapLayer' in responseData
      ? (responseData as { mapLayer?: MapLayer }).mapLayer
      : (responseData as MapLayer)) ?? null
  const isEdit = !!layerId

  useEffect(() => {
    if (!open) return
    if (!isEdit) {
      setCategoryId('')
      setCategorySearch('')
      setName('')
      setGeometryType('polygon')
      setIsActive('true')
      setLatitude('')
      setLongitude('')
      setGeometryDataText('')
      setPropertiesText('')
      return
    }

    if (layer) {
      setCategoryId(layer.category_id ? String(layer.category_id) : '')
      setName(layer.name || '')
      setGeometryType(layer.geometry_type || 'polygon')
      setIsActive(layer.is_active ? 'true' : 'false')
      const point = extractPointCoordinates(layer.geometry_data)
      if ((layer.geometry_type || 'polygon') === 'point' && point) {
        setLatitude(String(point.lat))
        setLongitude(String(point.lng))
        setGeometryDataText('')
      } else {
        setLatitude('')
        setLongitude('')
        setGeometryDataText(stringifyJson(layer.geometry_data))
      }
      setPropertiesText(stringifyJson(layer.properties))
    }
  }, [open, isEdit, layer])

  const isSubmitting = useMemo(() => isLoading, [isLoading])
  const geometryPreview = useMemo(() => {
    if (geometryType === 'point') {
      if (!latitude.trim() || !longitude.trim()) {
        return { error: null as string | null, geojson: null as GeoJSON.GeoJSON | null }
      }
      const lat = toNumber(latitude)
      const lng = toNumber(longitude)
      if (lat === null || lng === null) {
        return { error: 'Latitude/Longitude không hợp lệ', geojson: null as GeoJSON.GeoJSON | null }
      }
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return {
          error: 'Latitude/Longitude vượt phạm vi hợp lệ',
          geojson: null as GeoJSON.GeoJSON | null,
        }
      }
      return {
        error: null,
        geojson: {
          type: 'Point',
          coordinates: [lng, lat],
        } as GeoJSON.Geometry,
      }
    }

    if (!geometryDataText.trim())
      return { error: null as string | null, geojson: null as GeoJSON.GeoJSON | null }
    try {
      const parsed = JSON.parse(geometryDataText.trim())
      const geojson = extractGeoJson(parsed)
      if (!geojson) return { error: 'Không nhận diện được GeoJSON để preview', geojson: null }
      return { error: null, geojson }
    } catch {
      return { error: 'JSON không hợp lệ', geojson: null }
    }
  }, [geometryType, geometryDataText, latitude, longitude])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    let geometryData: object | string
    if (geometryType === 'point') {
      const lat = toNumber(latitude)
      const lng = toNumber(longitude)
      if (lat === null || lng === null) {
        toast.error('Latitude/Longitude không hợp lệ')
        return
      }
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        toast.error('Latitude/Longitude vượt phạm vi hợp lệ')
        return
      }
      geometryData = {
        type: 'Point',
        coordinates: [lng, lat],
      }
    } else {
      if (!geometryDataText.trim()) {
        toast.error('Vui lòng nhập GeoJSON')
        return
      }
      try {
        geometryData = JSON.parse(geometryDataText.trim())
      } catch {
        // Allow WKT string input
        geometryData = geometryDataText.trim()
      }
    }

    let properties: Record<string, any> | undefined
    if (propertiesText.trim()) {
      try {
        const parsed = JSON.parse(propertiesText.trim())
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          properties = parsed as Record<string, any>
        } else {
          toast.error('Properties phải là JSON object hợp lệ')
          return
        }
      } catch {
        toast.error('Properties phải là JSON hợp lệ')
        return
      }
    }

    const fullValidation = mapLayerSchema.safeParse({
      category_id: categoryId ? Number(categoryId) : undefined,
      name: name.trim(),
      geometry_type: geometryType,
      geometry_data: geometryData,
      properties: properties ?? null,
      is_active: isActive === 'true',
    })
    if (!fullValidation.success) {
      const first = fullValidation.error.issues[0]
      toast.error(first?.message || 'D? li?u kh?ng h?p l?')
      return
    }

    onSubmit({
      category_id: Number(categoryId),
      name: name.trim(),
      geometry_type: geometryType,
      geometry_data: geometryData,
      properties,
      is_active: isActive === 'true',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogTitle>{isEdit ? 'Chỉnh sửa lớp dữ liệu' : 'Thêm lớp dữ liệu mới'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Cập nhật thông tin lớp dữ liệu bản đồ' : 'Điền thông tin để tạo lớp dữ liệu'}
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
            {categories.length === 0 && (
              <p className="text-muted-foreground text-xs">Không có danh mục phù hợp</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="map-layer-name">
              Tên lớp dữ liệu <span className="text-destructive">*</span>
            </Label>
            <Input
              id="map-layer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên lớp dữ liệu"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Kiểu hình học <span className="text-destructive">*</span>
            </Label>
            <Select value={geometryType} onValueChange={(v) => setGeometryType(v as GeometryType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="point">Point</SelectItem>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="polygon">Polygon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select value={isActive} onValueChange={(v) => setIsActive(v as 'true' | 'false')}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Đang hoạt động</SelectItem>
                <SelectItem value="false">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {geometryType === 'point' ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="latitude">
                    Latitude <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Ví dụ: 13.022929167"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">
                    Longitude <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Ví dụ: 107.494755556"
                  />
                </div>
              </div>
            ) : (
              <>
                <Label htmlFor="geometry-data">
                  GeoJSON <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="geometry-data"
                  rows={8}
                  value={geometryDataText}
                  onChange={(e) => setGeometryDataText(e.target.value)}
                  placeholder='{"type":"Polygon","coordinates":[[[106.0,11.0],[106.1,11.1],[106.2,11.0],[106.0,11.0]]]}'
                />
              </>
            )}
            {geometryPreview.error && (
              <p className="text-destructive text-xs">{geometryPreview.error}</p>
            )}
            {!geometryPreview.error && geometryPreview.geojson && (
              <div className="border-muted bg-muted/20 rounded-md border p-2">
                <p className="text-muted-foreground mb-2 text-xs">Preview bản đồ</p>
                <GeoJsonMapPreview geojson={geometryPreview.geojson} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="properties">Properties (JSON, tùy chọn)</Label>
            <Textarea
              id="properties"
              rows={6}
              value={propertiesText}
              onChange={(e) => setPropertiesText(e.target.value)}
              placeholder='{"source":"survey","year":2026}'
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
