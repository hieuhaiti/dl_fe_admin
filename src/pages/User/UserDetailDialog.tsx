import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { userService, useApiQuery } from '@/service'
import type { ApiResponse, User } from '@/types/api'

interface UserDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: number | null
}

export default function UserDetailDialog({ open, onOpenChange, userId }: UserDetailDialogProps) {
  const dbQuery = useApiQuery(
    ['user', userId],
    () => userService.getById(userId!),
    { enabled: !!userId && open, staleTime: 0 },
    false,
    false
  )
  const user = (dbQuery.data as ApiResponse<User>)?.data ?? null

  const isLocked = user?.locked_until && new Date(user.locked_until) > new Date() ? true : false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogTitle>Chi tiết người dùng</DialogTitle>
        <DialogDescription>Thông tin chi tiết người dùng đã chọn</DialogDescription>

        {user ? (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">ID:</span>
              <span className="col-span-2">{user.id}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Tên đăng nhập:</span>
              <span className="col-span-2">{user.username}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Họ tên:</span>
              <span className="col-span-2">{user.full_name || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Email:</span>
              <span className="col-span-2">{user.email}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Điện thoại:</span>
              <span className="col-span-2">{user.phone || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Địa chỉ:</span>
              <span className="col-span-2">{user.address_detail || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Vai trò:</span>
              <span className="col-span-2">{user.role?.name || '-'}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Avatar:</span>
              <span className="col-span-2">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full border"
                  />
                ) : (
                  '-'
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Trạng thái:</span>
              <span className="col-span-2">
                {user.is_active ? (
                  <Badge variant="default">Kích hoạt</Badge>
                ) : (
                  <Badge variant="secondary">Không kích hoạt</Badge>
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Trạng thái khóa:</span>
              <span className="col-span-2">
                {isLocked ? (
                  <Badge variant="destructive">Đã khóa</Badge>
                ) : (
                  <Badge variant="default">Mở khóa</Badge>
                )}
              </span>
            </div>
            {isLocked && (
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Khóa đến:</span>
                <span className="col-span-2">{new Date(user.locked_until!).toLocaleString()}</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Ngày tạo:</span>
              <span className="col-span-2">
                {user.created_at ? new Date(user.created_at).toLocaleString() : '-'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Cập nhật:</span>
              <span className="col-span-2">
                {user.updated_at ? new Date(user.updated_at).toLocaleString() : '-'}
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
