import { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { mapLayerApiService, useApiMutation, useApiQuery } from '@/service'
import type {
  ApiResponse,
  ApiShare,
  CreateShareBody,
  PrincipalType,
} from '@/types/api'
import { Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'

interface MapLayerApiShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiId: number | null
}

type ShareResponseData = ApiShare[] | { items?: ApiShare[]; shares?: ApiShare[] }

function normalizeShares(data: ShareResponseData | undefined): ApiShare[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.items)) return data.items
  if (Array.isArray(data.shares)) return data.shares
  return []
}

export default function MapLayerApiShareDialog({
  open,
  onOpenChange,
  apiId,
}: MapLayerApiShareDialogProps) {
  const [sharedWithType, setSharedWithType] = useState<PrincipalType>('public')
  const [sharedWithUserId, setSharedWithUserId] = useState<string>('')
  const [sharedWithRoleId, setSharedWithRoleId] = useState<string>('')
  const [expiresAt, setExpiresAt] = useState<string>('')

  const dbQuery = useApiQuery(
    ['mapLayerApiShares', apiId],
    () => mapLayerApiService.getShares(apiId!),
    { enabled: !!apiId && open, staleTime: 0 },
    false,
    false
  )

  const shares = useMemo(() => {
    const responseData = (dbQuery.data as ApiResponse<ShareResponseData>)?.data
    return normalizeShares(responseData)
  }, [dbQuery.data])

  const createShareMutation = useApiMutation(
    (payload: CreateShareBody) => mapLayerApiService.createShare(apiId!, payload),
    {
      onSuccess: () => {
        dbQuery.refetch()
        setSharedWithType('public')
        setSharedWithUserId('')
        setSharedWithRoleId('')
        setExpiresAt('')
      },
    },
    true
  )

  const deleteShareMutation = useApiMutation(
    (shareId: number) => mapLayerApiService.deleteShare(apiId!, shareId),
    {
      onSuccess: () => {
        dbQuery.refetch()
      },
    },
    true
  )

  function handleCreateShare(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!apiId) return

    const payload: CreateShareBody = {
      shared_with_type: sharedWithType,
      permission_level: 'view',
      ...(expiresAt ? { expires_at: new Date(expiresAt).toISOString() } : {}),
    }

    if (sharedWithType === 'user') {
      if (!sharedWithUserId.trim() || Number.isNaN(Number(sharedWithUserId))) {
        toast.error('Vui lòng nhập shared_with_user_id hợp lệ')
        return
      }
      payload.shared_with_user_id = Number(sharedWithUserId)
      payload.shared_with_role_id = null
    }

    if (sharedWithType === 'role') {
      if (!sharedWithRoleId.trim() || Number.isNaN(Number(sharedWithRoleId))) {
        toast.error('Vui lòng nhập shared_with_role_id hợp lệ')
        return
      }
      payload.shared_with_role_id = Number(sharedWithRoleId)
      payload.shared_with_user_id = null
    }

    if (sharedWithType === 'public') {
      payload.shared_with_role_id = null
      payload.shared_with_user_id = null
    }

    createShareMutation.mutate(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-5xl overflow-y-auto">
        <DialogTitle>Chia sẻ API lớp bản đồ</DialogTitle>
        <DialogDescription>Quản lý danh sách chia sẻ API đã chọn</DialogDescription>

        <form className="mt-3 space-y-4 rounded border p-4" onSubmit={handleCreateShare}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Shared With Type</Label>
              <Select
                value={sharedWithType}
                onValueChange={(value) => setSharedWithType(value as PrincipalType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sharedWithType === 'user' && (
              <div className="space-y-2">
                <Label htmlFor="share-user-id">User ID</Label>
                <Input
                  id="share-user-id"
                  value={sharedWithUserId}
                  onChange={(e) => setSharedWithUserId(e.target.value)}
                  placeholder="Nhập user_id"
                />
              </div>
            )}

            {sharedWithType === 'role' && (
              <div className="space-y-2">
                <Label htmlFor="share-role-id">Role ID</Label>
                <Input
                  id="share-role-id"
                  value={sharedWithRoleId}
                  onChange={(e) => setSharedWithRoleId(e.target.value)}
                  placeholder="Nhập role_id"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Permission Level</Label>
              <Input value="view" disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="share-expires-at">Expires At</Label>
              <Input
                id="share-expires-at"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={createShareMutation.isPending || !apiId}>
              {createShareMutation.isPending ? 'Đang tạo...' : 'Tạo chia sẻ'}
            </Button>
          </div>
        </form>

        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Đối tượng</TableHead>
                <TableHead>Mức quyền</TableHead>
                <TableHead>Hết hạn</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shares.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Chưa có chia sẻ nào
                  </TableCell>
                </TableRow>
              ) : (
                shares.map((share) => (
                  <TableRow key={share.id}>
                    <TableCell>{share.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{share.shared_with_type}</span>
                        <span className="text-muted-foreground text-xs">
                          {share.shared_with_user_id ? `user_id: ${share.shared_with_user_id}` : ''}
                          {share.shared_with_role_id ? `role_id: ${share.shared_with_role_id}` : ''}
                          {!share.shared_with_user_id && !share.shared_with_role_id ? 'toàn bộ công khai' : ''}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{share.permission_level}</Badge>
                    </TableCell>
                    <TableCell>
                      {share.expires_at ? new Date(share.expires_at).toLocaleString('vi-VN') : '-'}
                    </TableCell>
                    <TableCell>
                      {share.created_at ? new Date(share.created_at).toLocaleDateString('vi-VN') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteShareMutation.mutate(share.id)}
                        disabled={deleteShareMutation.isPending}
                        title="Xóa chia sẻ"
                      >
                        <Trash2 className="text-destructive size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
