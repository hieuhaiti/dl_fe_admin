import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { categoryService, useApiQuery } from '@/service'
import type { ApiResponse, Category } from '@/types/api'
import { parseLink } from '@/lib/utils'
import { formatDateTime } from '@/lib/date'
import { MONITORING_FEATURE_LABEL } from '@/constant/categoryConstant'

interface CategoryDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryId: number | null
}

export default function CategoryDetailDialog({
  open,
  onOpenChange,
  categoryId,
}: CategoryDetailDialogProps) {
  const dbQuery = useApiQuery(
    ['category', categoryId],
    () => categoryService.getById(categoryId!),
    { enabled: !!categoryId && open, staleTime: 0 },
    false,
    false
  )

  const rawData = (dbQuery.data as ApiResponse<Category | { category: Category }>)?.data
  const category =
    rawData && 'id' in rawData
      ? (rawData as Category)
      : (rawData as { category?: Category })?.category

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogTitle>Chi tiết danh mục</DialogTitle>
        <DialogDescription>Thông tin chi tiết danh mục đã chọn</DialogDescription>

        {category ? (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">ID:</span>
              <span className="col-span-2">{category.id}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Tên danh mục:</span>
              <span className="col-span-2">{category.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Mô tả:</span>
              <span className="col-span-2">{category.description || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Icon:</span>
              <span className="col-span-2">
                {category.icon_url ? (
                  <div className="bg-muted flex h-20 w-20 items-center justify-center rounded border p-2">
                    {category.icon_url.startsWith('<svg') ? (
                      <div dangerouslySetInnerHTML={{ __html: category.icon_url }} />
                    ) : (
                      <img
                        src={parseLink(category.icon_url)}
                        alt="Category icon"
                        className="h-full w-full object-contain"
                      />
                    )}
                  </div>
                ) : (
                  '-'
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Màu:</span>
              <span className="col-span-2">
                {category.color ? (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block h-4 w-4 rounded border"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-mono text-xs">{category.color}</span>
                  </span>
                ) : (
                  '-'
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Trạng thái:</span>
              <span className="col-span-2">
                {category.is_active ? (
                  <Badge variant="default">Đang hoạt động</Badge>
                ) : (
                  <Badge variant="secondary">Ngừng hoạt động</Badge>
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Mốc biên giới:</span>
              <span className="col-span-2">
                {category.is_landmark ? (
                  <Badge variant="default">Có</Badge>
                ) : (
                  <Badge variant="secondary">Không</Badge>
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Đồn biên phòng:</span>
              <span className="col-span-2">
                {category.is_border_guard_station ? (
                  <Badge variant="default">Có</Badge>
                ) : (
                  <Badge variant="secondary">Không</Badge>
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Bật mặc định:</span>
              <span className="col-span-2">
                {category.is_enable_default ? (
                  <Badge variant="default">Có</Badge>
                ) : (
                  <Badge variant="secondary">Không</Badge>
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Loại giám sát:</span>
              <span className="col-span-2">
                <Badge variant="outline">
                  {MONITORING_FEATURE_LABEL[category.is_monitoring_feature] ||
                    MONITORING_FEATURE_LABEL.none}
                </Badge>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Ngày tạo:</span>
              <span className="col-span-2">
                {category.created_at ? formatDateTime(category.created_at) : '-'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Cập nhật:</span>
              <span className="col-span-2">
                {category.updated_at ? formatDateTime(category.updated_at) : '-'}
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
