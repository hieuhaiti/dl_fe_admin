import type { JSX } from 'react'
import { useState } from 'react'
import PageLayout from '@/layout/pageLayout'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import GeoJsonMapPreview from '@/components/features/GeoJsonMapPreview'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mapLayerService, useApiMutation } from '@/service'
import { toast } from 'react-toastify'
import { CheckCircle2, Download, FileJson, Info } from 'lucide-react'
import CategorySelectField from '@/components/features/CategorySelectField'

function extractGeoJson(raw: any): GeoJSON.GeoJSON | null {
  if (!raw || typeof raw !== 'object') return null
  if (raw.type === 'FeatureCollection' && Array.isArray(raw.features)) return raw as GeoJSON.FeatureCollection
  if (raw.type === 'Feature' && raw.geometry) return raw as GeoJSON.Feature
  if (typeof raw.type === 'string' && raw.coordinates) return raw as GeoJSON.Geometry
  return null
}

function extractPropertyKeys(geojson: GeoJSON.GeoJSON): string[] {
  const featureList =
    geojson.type === 'FeatureCollection'
      ? geojson.features
      : geojson.type === 'Feature'
        ? [geojson]
        : []

  const keys = new Set<string>()
  featureList.forEach((feature) => {
    if (!feature?.properties || typeof feature.properties !== 'object') return
    Object.keys(feature.properties).forEach((key) => {
      if (key.trim()) keys.add(key)
    })
  })

  return Array.from(keys).sort((a, b) => a.localeCompare(b))
}

function downloadGeoJsonSample() {
  const sample = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'Mẫu điểm 1', code: 'P001' },
        geometry: { type: 'Point', coordinates: [106.70098, 10.77689] },
      },
      {
        type: 'Feature',
        properties: { name: 'Mẫu điểm 2', code: 'P002' },
        geometry: { type: 'Point', coordinates: [106.7031, 10.7792] },
      },
    ],
  }

  const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/geo+json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'sample-map-layer.geojson'
  link.click()
  URL.revokeObjectURL(url)
}

export default function ImportGeoJsonPage(): JSX.Element {
  const [categoryId, setCategoryId] = useState<string>('')
  const [namingMode, setNamingMode] = useState<'manual' | 'from_file'>('manual')
  const [name, setName] = useState<string>('')
  const [nameField, setNameField] = useState<string>('')
  const [propertyKeys, setPropertyKeys] = useState<string[]>([])
  const [isActive, setIsActive] = useState<'true' | 'false'>('true')
  const [file, setFile] = useState<File | null>(null)
  const [previewGeoJson, setPreviewGeoJson] = useState<GeoJSON.GeoJSON | null>(null)
  const [previewError, setPreviewError] = useState<string>('')

  const importMutation = useApiMutation(
    (payload: FormData) => mapLayerService.importGeoJson(payload),
    {
      onSuccess: () => {
        setName('')
        setNameField('')
        setPropertyKeys([])
        setNamingMode('manual')
        setCategoryId('')
        setIsActive('true')
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
    setPropertyKeys([])
    if (!selectedFile) return

    try {
      const text = await selectedFile.text()
      const parsed = JSON.parse(text)
      const geojson = extractGeoJson(parsed)
      if (!geojson) {
        setPreviewError('File không chứa GeoJSON hợp lệ để preview')
        return
      }
      const keys = extractPropertyKeys(geojson)
      setPropertyKeys(keys)
      if (keys.length > 0) {
        if (keys.includes(nameField)) {
          setNameField(nameField)
        } else if (keys.includes('name')) {
          setNameField('name')
        } else {
          setNameField(keys[0])
        }
      } else {
        setNameField('')
      }
      setPreviewGeoJson(geojson)
    } catch {
      setPreviewError('Không đọc được GeoJSON hoặc file JSON không hợp lệ')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!categoryId) {
      toast.error('Vui lòng chọn danh mục')
      return
    }
    const trimmedName = name.trim()
    const trimmedNameField = nameField.trim()
    if (namingMode === 'manual' && !trimmedName) {
      toast.error('Vui lòng nhập tên lớp')
      return
    }
    if (namingMode === 'from_file' && !trimmedNameField) {
      toast.error('Vui lòng nhập tên trường trong properties (name_field)')
      return
    }
    if (!file) {
      toast.error('Vui lòng chọn file GeoJSON')
      return
    }

    const geoJsonFile =
      file.type && file.type.trim()
        ? file
        : new File([await file.arrayBuffer()], file.name, {
            type: file.name.toLowerCase().endsWith('.geojson')
              ? 'application/geo+json'
              : 'application/json',
          })

    const fd = new FormData()
    fd.append('category_id', categoryId)
    if (namingMode === 'manual') {
      fd.append('name', trimmedName)
    } else {
      fd.append('name_field', trimmedNameField)
    }
    fd.append('is_active', isActive)
    fd.append('geojson_file', geoJsonFile)

    importMutation.mutate(fd)
  }

  return (
    <PageLayout
      title="Nhập GeoJSON"
      description="Nhập dữ liệu GeoJSON để tạo lớp bản đồ mới"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <CategorySelectField value={categoryId} onValueChange={setCategoryId} activeOnly />

            <div className="space-y-2">
              <Label>Kiểu đặt tên lớp</Label>
              <Select
                value={namingMode}
                onValueChange={(v) => setNamingMode(v as 'manual' | 'from_file')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Tự đặt tên</SelectItem>
                  <SelectItem value="from_file">Lấy tên từ file (name_field)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {namingMode === 'manual' ? (
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
            ) : (
              <div className="space-y-2">
                <Label>
                  Tên trường trong properties <span className="text-destructive">*</span>
                </Label>
                {propertyKeys.length > 0 ? (
                  <Select value={nameField} onValueChange={setNameField}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn trường name_field" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyKeys.map((key) => (
                        <SelectItem key={key} value={key}>
                          {key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="name-field"
                    placeholder="Chọn file có properties để hiển thị trường"
                    value={nameField}
                    onChange={(e) => setNameField(e.target.value)}
                  />
                )}
                <p className="text-muted-foreground text-xs">
                  Hệ thống sẽ lấy từ `feature.properties[name_field]`. Nếu thiếu sẽ fallback theo backend.
                </p>
              </div>
            )}

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

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setName('')
                  setNameField('')
                  setPropertyKeys([])
                  setNamingMode('manual')
                  setCategoryId('')
                  setIsActive('true')
                  setFile(null)
                  setPreviewGeoJson(null)
                  setPreviewError('')
                }}
                disabled={importMutation.isPending}
                className="w-full sm:w-auto"
              >
                Làm mới
              </Button>
              <Button type="submit" disabled={importMutation.isPending} className="w-full sm:w-auto">
                {importMutation.isPending ? 'Đang nhập...' : 'Nhập GeoJSON'}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="from-primary/10 to-background h-fit space-y-4 bg-gradient-to-b p-4 sm:p-5 lg:sticky lg:top-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/15 text-primary rounded-md p-2">
              <FileJson size={18} />
            </div>
            <div>
              <p className="font-semibold">Hướng dẫn GeoJSON</p>
              <p className="text-muted-foreground text-xs">Chuẩn bị file trước khi import</p>
            </div>
          </div>

          <div className="bg-primary/5 border-primary/20 rounded-lg border p-3 text-sm">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <Info size={16} />
              Định dạng hợp lệ
            </div>
            <p className="text-muted-foreground text-xs">
              Dữ liệu phải là `FeatureCollection`, `Feature` hoặc `Geometry`.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-medium">Checklist nhanh</p>
            <p className="text-muted-foreground flex items-start gap-2 text-xs">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
              File có phần mở rộng `.geojson` hoặc `.json`.
            </p>
            <p className="text-muted-foreground flex items-start gap-2 text-xs">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
              Mỗi feature có `geometry` hợp lệ và tọa độ đúng thứ tự.
            </p>
            <p className="text-muted-foreground flex items-start gap-2 text-xs">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
              Tên lớp không trùng và đã chọn đúng danh mục.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="mb-1 text-xs font-medium">Ví dụ cấu trúc tối thiểu</p>
            <code className="text-muted-foreground block text-[11px] leading-5">
              {`{"type":"FeatureCollection","features":[...]}`}
            </code>
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={downloadGeoJsonSample}>
            <Download size={16} />
            Tải file mẫu GeoJSON
          </Button>
        </Card>
      </div>
    </PageLayout>
  )
}
