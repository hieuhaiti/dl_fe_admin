import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { userService, useApiQuery } from '@/service'
import type { ApiResponse, User } from '@/types/api'
import { parseLink } from '@/lib/utils'

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
  const user = (dbQuery.data as ApiResponse<{ user: User }>)?.data?.user ?? null

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
              <span className="font-semibold">Email:</span>
              <span className="col-span-2">{user.email}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Họ tên:</span>
              <span className="col-span-2">{user.full_name || '-'}</span>
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
              <span className="font-semibold">Avatar:</span>
              <span className="col-span-2">
                {user.avatar_url ? (
                  <img
                    src={parseLink(user.avatar_url)}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full border"
                  />
                ) : (
                  '-'
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Vai trò:</span>
              <span className="col-span-2">{user.role?.name || '-'}</span>

              {user.role?.permissions && (
                <>
                  <span className="font-semibold">Quyền:</span>
                  <div className="col-span-2 flex flex-col gap-1">
                    {Object.entries(user.role.permissions).map(([resource, actions]) => (
                      <div key={resource} className="flex flex-wrap items-center gap-1">
                        <span className="text-muted-foreground shrink-0 text-xs font-medium">
                          {resource}:
                        </span>
                        {(actions as string[]).map((a) => (
                          <Badge key={a} variant="outline" className="text-xs">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Kích hoạt:</span>
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
              <span className="font-semibold">Đăng nhập lần cuối:</span>
              <span className="col-span-2">
                {user.last_login ? new Date(user.last_login).toLocaleString('vi-VN') : '-'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Số lần đăng nhập:</span>
              <span className="col-span-2">{user.login_count ?? '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Đã xóa:</span>
              <span className="col-span-2">
                {user.is_deleted ? (
                  <Badge variant="destructive">Đã xóa</Badge>
                ) : (
                  <Badge variant="secondary">Chưa xóa</Badge>
                )}
              </span>
            </div>
            {user.deleted_at && (
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Xóa lúc:</span>
                <span className="col-span-2">
                  {new Date(user.deleted_at).toLocaleString('vi-VN')}
                </span>
              </div>
            )}
            {user.deleted_by && (
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Xóa bởi:</span>
                <span className="col-span-2">{user.deleted_by}</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Ngày tạo:</span>
              <span className="col-span-2">
                {user.created_at ? new Date(user.created_at).toLocaleString('vi-VN') : '-'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Cập nhật:</span>
              <span className="col-span-2">
                {user.updated_at ? new Date(user.updated_at).toLocaleString('vi-VN') : '-'}
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
