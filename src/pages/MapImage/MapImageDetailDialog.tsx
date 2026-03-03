import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { mapImageService, useApiQuery } from '@/service'
import type { ApiResponse, MapImage } from '@/types/api'
import { parseLink } from '@/lib/utils'
import { UserText } from '@/components/common/UserText'

interface MapImageDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mapImageId: number | null
}

export default function MapImageDetailDialog({
  open,
  onOpenChange,
  mapImageId,
}: MapImageDetailDialogProps) {
  const dbQuery = useApiQuery(
    ['mapImage', mapImageId],
    () => mapImageService.getById(mapImageId!),
    { enabled: !!mapImageId && open, staleTime: 0 },
    false,
    false
  )
  const mapImage = (dbQuery.data as ApiResponse<{ mapImage: MapImage }>)?.data?.mapImage ?? null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogTitle>Chi tiết ảnh bản đồ</DialogTitle>
        <DialogDescription>Thông tin chi tiết ảnh bản đồ đã chọn</DialogDescription>

        {mapImage ? (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">ID:</span>
              <span className="col-span-2">{mapImage.id}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Tên:</span>
              <span className="col-span-2">{mapImage.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Mô tả:</span>
              <span className="col-span-2">{mapImage.description || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Trạng thái:</span>
              <span className="col-span-2">
                {mapImage.is_active ? (
                  <Badge variant="default">Kích hoạt</Badge>
                ) : (
                  <Badge variant="secondary">Không kích hoạt</Badge>
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Ảnh:</span>
              <span className="col-span-2">
                {mapImage.image_url ? (
                  <img
                    src={parseLink(mapImage.image_url)}
                    alt={mapImage.name}
                    className="max-h-64 w-full rounded-md border object-contain"
                  />
                ) : (
                  '-'
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Tạo bởi:</span>
              <span className="col-span-2">
                <UserText userId={mapImage.created_by} />
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Ngày tạo:</span>
              <span className="col-span-2">
                {mapImage.created_at ? new Date(mapImage.created_at).toLocaleString('vi-VN') : '-'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Cập nhật lúc:</span>
              <span className="col-span-2">
                {mapImage.updated_at ? new Date(mapImage.updated_at).toLocaleString('vi-VN') : '-'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground py-8 text-center">Đang tải dữ liệu...</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
