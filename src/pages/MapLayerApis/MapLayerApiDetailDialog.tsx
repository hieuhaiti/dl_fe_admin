import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { mapLayerApiService, useApiQuery } from '@/service'
import type { ApiResponse, MapLayerApi } from '@/types/api'

interface MapLayerApiDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiId: number | null
}

type MapLayerApiDetailData = MapLayerApi | { mapLayerApi?: MapLayerApi }

export default function MapLayerApiDetailDialog({
  open,
  onOpenChange,
  apiId,
}: MapLayerApiDetailDialogProps) {
  const dbQuery = useApiQuery(
    ['mapLayerApi', apiId],
    () => mapLayerApiService.getById(apiId!),
    { enabled: !!apiId && open, staleTime: 0 },
    false,
    false
  )

  const responseData = (dbQuery.data as ApiResponse<MapLayerApiDetailData>)?.data
  const api =
    responseData && 'mapLayerApi' in responseData
      ? ((responseData as { mapLayerApi?: MapLayerApi }).mapLayerApi ?? null)
      : ((responseData as MapLayerApi) ?? null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogTitle>Chi tiết API lớp bản đồ</DialogTitle>
        <DialogDescription>Thông tin chi tiết API đã chọn</DialogDescription>

        {api ? (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">ID:</span>
              <span className="col-span-2">{api.id}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Tên API:</span>
              <span className="col-span-2">{api.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Slug:</span>
              <span className="col-span-2 font-mono text-sm">{api.slug}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Danh mục:</span>
              <span className="col-span-2">{api.category?.name || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Endpoint URL:</span>
              <span className="col-span-2 break-all font-mono text-sm">{api.endpoint_url}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">HTTP Method:</span>
              <span className="col-span-2">{api.http_method}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Trạng thái:</span>
              <span className="col-span-2">
                {api.status === 'published' ? (
                  <Badge variant="default">Published</Badge>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Mô tả:</span>
              <span className="col-span-2">{api.description || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Published At:</span>
              <span className="col-span-2">
                {api.published_at ? new Date(api.published_at).toLocaleString('vi-VN') : '-'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Ngày tạo:</span>
              <span className="col-span-2">
                {api.created_at ? new Date(api.created_at).toLocaleString('vi-VN') : '-'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Cập nhật:</span>
              <span className="col-span-2">
                {api.updated_at ? new Date(api.updated_at).toLocaleString('vi-VN') : '-'}
              </span>
            </div>
          </div>
        ) : (
          <div>Không có dữ liệu</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

