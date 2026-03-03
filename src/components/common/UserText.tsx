import { useApiQuery, userService } from '@/service'
import type { ApiResponse, User } from '@/types/api'

interface UserTextProps {
  /** User ID to fetch */
  userId?: number | null
  /** Fallback text when userId is null/undefined */
  fallback?: string
}

/**
 * Renders a single line of user info fetched by ID.
 * Priority: full_name > username > email > phone > id
 */
export function UserText({ userId, fallback = '-' }: UserTextProps) {
  const q = useApiQuery(
    ['user', userId],
    () => userService.getById(userId!),
    { enabled: !!userId, staleTime: 5 * 60 * 1000 },
    false,
    false
  )

  if (!userId) return <span>{fallback}</span>
  if (q.isLoading) return <span className="text-muted-foreground text-xs">...</span>

  const user = (q.data as ApiResponse<{ user: User }>)?.data?.user
  if (!user) return <span className="text-muted-foreground text-xs">ID: {userId}</span>

  const display = user.full_name || user.username || user.email || user.phone || String(user.id)
  return (
    <span>
      {display}
      {user.username && user.full_name && (
        <span className="text-muted-foreground ml-1 text-xs">(@{user.username})</span>
      )}
    </span>
  )
}
