import type { JSX } from 'react'
import { useState } from 'react'
import PageLayout from '@/layout/pageLayout'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import GeoJsonMapPreview from '@/components/features/GeoJsonMapPreview'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { categoryService, mapLayerService, useApiMutation, useApiQuery } from '@/service'
import type { ApiResponse, CategoryListData } from '@/types/api'
import { toast } from 'react-toastify'

function extractGeoJson(raw: any): GeoJSON.GeoJSON | null {
  if (!raw || typeof raw !== 'object') return null
  if (raw.type === 'FeatureCollection' && Array.isArray(raw.features)) return raw as GeoJSON.FeatureCollection
  if (raw.type === 'Feature' && raw.geometry) return raw as GeoJSON.Feature
  if (typeof raw.type === 'string' && raw.coordinates) return raw as GeoJSON.Geometry
  return null
}

export default function ImportGeoJsonPage(): JSX.Element {
  const [categoryId, setCategoryId] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [isActive, setIsActive] = useState<'true' | 'false'>('true')
  const [propertiesText, setPropertiesText] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [previewGeoJson, setPreviewGeoJson] = useState<GeoJSON.GeoJSON | null>(null)
  const [previewError, setPreviewError] = useState<string>('')

  const categoryQuery = useApiQuery(
    ['categories', { page: 1, limit: 100, is_active: true }],
    () =>
      categoryService.getAll({
        page: 1,
        limit: 100,
        is_active: true,
        sortBy: 'id',
        sortOrder: 'ASC',
      }),
    {},
    false,
    false
  )

  const categories = ((categoryQuery.data as ApiResponse<CategoryListData>)?.data?.categories ?? []).filter(
    (c: any) => c.is_active
  )

  const importMutation = useApiMutation(
    (payload: FormData) => mapLayerService.importGeoJson(payload),
    {
      onSuccess: () => {
        setName('')
        setCategoryId('')
        setIsActive('true')
        setPropertiesText('')
        setFile(null)
        setPreviewGeoJson(null)
        setPreviewError('')
      },
    },
    true
  )

  async function handleGeoJsonFileChange(selectedFile: File | null) {
    setFile(selectedFile)
    setPreviewGeoJson(null)
    setPreviewError('')
    if (!selectedFile) return

    try {
      const text = await selectedFile.text()
      const parsed = JSON.parse(text)
      const geojson = extractGeoJson(parsed)
      if (!geojson) {
        setPreviewError('File không chứa GeoJSON hợp lệ để preview')
        return
      }
      setPreviewGeoJson(geojson)
    } catch {
      setPreviewError('Không đọc được GeoJSON hoặc file JSON không hợp lệ')
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!categoryId) {
      toast.error('Vui lòng chọn danh mục')
      return
    }
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên lớp')
      return
    }
    if (!file) {
      toast.error('Vui lòng chọn file GeoJSON')
      return
    }

    const fd = new FormData()
    fd.append('category_id', categoryId)
    fd.append('name', name.trim())
    fd.append('is_active', isActive)
    fd.append('geojson_file', file)

    if (propertiesText.trim()) {
      try {
        JSON.parse(propertiesText)
        fd.append('properties', propertiesText.trim())
      } catch {
        toast.error('Properties phải là JSON hợp lệ')
        return
      }
    }

    importMutation.mutate(fd)
  }

  return (
    <PageLayout
      title="Nhập GeoJSON"
      description="Nhập dữ liệu GeoJSON để tạo lớp bản đồ mới"
    >
      <Card className="max-w-3xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>
              Danh mục <span className="text-destructive">*</span>
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c: any) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="layer-name">
              Tên lớp <span className="text-destructive">*</span>
            </Label>
            <Input
              id="layer-name"
              placeholder="Nhập tên lớp bản đồ"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
            <Label htmlFor="geojson-file">
              File GeoJSON <span className="text-destructive">*</span>
            </Label>
            <Input
              id="geojson-file"
              type="file"
              accept=".geojson,.json,application/geo+json,application/json"
              onChange={(e) => handleGeoJsonFileChange(e.target.files?.[0] ?? null)}
            />
            <p className="text-muted-foreground text-xs">Hỗ trợ: .geojson, .json</p>
            {previewError && <p className="text-destructive text-xs">{previewError}</p>}
            {previewGeoJson && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs">Preview bản đồ từ file GeoJSON</p>
                <GeoJsonMapPreview geojson={previewGeoJson} />
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
              placeholder='{"source":"drone","year":2026}'
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setName('')
                setCategoryId('')
                setIsActive('true')
                setPropertiesText('')
                setFile(null)
                setPreviewGeoJson(null)
                setPreviewError('')
              }}
              disabled={importMutation.isPending}
            >
              Làm mới
            </Button>
            <Button type="submit" disabled={importMutation.isPending}>
              {importMutation.isPending ? 'Đang nhập...' : 'Nhập GeoJSON'}
            </Button>
          </div>
        </form>
      </Card>
    </PageLayout>
  )
}
