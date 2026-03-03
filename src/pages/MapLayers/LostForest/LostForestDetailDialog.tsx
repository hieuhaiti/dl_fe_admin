import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { mapLayerService, useApiQuery } from '@/service'
import type { ApiResponse, LostForestLayer } from '@/types/api'
import { formatDateTime } from '@/lib/date'

interface LostForestDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  layerId: number | null
}

export default function LostForestDetailDialog({
  open,
  onOpenChange,
  layerId,
}: LostForestDetailDialogProps) {
  const dbQuery = useApiQuery(
    ['lostForestLayer', layerId],
    () => mapLayerService.getLostForestLayerById(layerId!),
    { enabled: !!layerId && open, staleTime: 0 },
    false,
    false
  )

  const layer = (dbQuery.data as ApiResponse<LostForestLayer>)?.data ?? null
  const areaHa = layer?.area_m2 ? layer.area_m2 / 10000 : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogTitle>Chi tiết lớp mất rừng</DialogTitle>
        <DialogDescription>Thông tin chi tiết lớp bản đồ đã chọn</DialogDescription>

        {layer ? (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">ID:</span>
              <span className="col-span-2">{layer.id}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Tên lớp:</span>
              <span className="col-span-2">{layer.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Danh mục:</span>
              <span className="col-span-2">{layer.category?.name || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Mô tả:</span>
              <span className="col-span-2">{layer.description || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Kiểu hình học:</span>
              <span className="col-span-2">{layer.geometry_type}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Diện tích:</span>
              <span className="col-span-2">
                {layer.area_m2 ? (
                  <span>
                    {layer.area_m2.toLocaleString('vi-VN')} m²
                    {areaHa ? ` (${areaHa.toFixed(4)} ha)` : ''}
                  </span>
                ) : (
                  '-'
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Trạng thái:</span>
              <span className="col-span-2">
                {layer.is_active ? (
                  <Badge variant="default">Đang hoạt động</Badge>
                ) : (
                  <Badge variant="secondary">Ngừng hoạt động</Badge>
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Ngày tạo:</span>
              <span className="col-span-2">
                {layer.created_at ? formatDateTime(layer.created_at) : '-'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Cập nhật:</span>
              <span className="col-span-2">
                {layer.updated_at ? formatDateTime(layer.updated_at) : '-'}
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
