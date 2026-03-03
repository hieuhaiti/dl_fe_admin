import { useApiQuery, userService } from '@/service'
import type { ApiResponse, CitizenFeedback, User } from '@/types/api'

/** Hiện 1 dòng thông tin user theo độ ưu tiên: full_name > username > email > phone > id */
export function displayUser(u: User): string {
  return u.full_name || u.username || u.email || u.phone || String(u.id)
}

interface UserCellProps {
  userId?: number | null
  inlineUser?: CitizenFeedback['user']
}

/**
 * Nếu đã có inlineUser (từ feedback.user) thì dùng luôn,
 * ngược lại fetch dựa vào userId.
 */
export function UserCell({ userId, inlineUser }: UserCellProps) {
  const skip = !userId || !!inlineUser
  const q = useApiQuery(
    ['user', userId],
    () => userService.getById(userId!),
    { enabled: !skip, staleTime: 5 * 60 * 1000 },
    false,
    false
  )

  if (inlineUser) {
    const display =
      inlineUser.full_name ||
      inlineUser.username ||
      inlineUser.email_registered ||
      String(inlineUser.id)
    return (
      <div>
        <p className="text-sm font-medium">{display}</p>
        {inlineUser.username && inlineUser.full_name && (
          <p className="text-muted-foreground text-xs">{inlineUser.username}</p>
        )}
      </div>
    )
  }

  if (!userId) return <span className="text-muted-foreground text-sm">Ẩn danh</span>

  const fetched = (q.data as ApiResponse<{ user: User }>)?.data?.user
  if (q.isLoading) return <span className="text-muted-foreground text-xs">...</span>
  if (!fetched) return <span className="text-muted-foreground text-xs">ID: {userId}</span>

  return (
    <div>
      <p className="text-sm font-medium">{displayUser(fetched)}</p>
      {fetched.username && fetched.full_name && (
        <p className="text-muted-foreground text-xs">{fetched.username}</p>
      )}
    </div>
  )
}
