import { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import type { AddPermissionBody, ApiPermission, ApiResponse, PrincipalType } from '@/types/api'
import { Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { formatDate } from '@/lib/date'

interface MapLayerApiPermissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiId: number | null
}

type PermissionResponseData = ApiPermission[] | { items?: ApiPermission[]; permissions?: ApiPermission[] }

function normalizePermissions(data: PermissionResponseData | undefined): ApiPermission[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.items)) return data.items
  if (Array.isArray(data.permissions)) return data.permissions
  return []
}

export default function MapLayerApiPermissionDialog({
  open,
  onOpenChange,
  apiId,
}: MapLayerApiPermissionDialogProps) {
  const [principalType, setPrincipalType] = useState<PrincipalType>('public')
  const [userId, setUserId] = useState<string>('')
  const [roleId, setRoleId] = useState<string>('')
  const [canView, setCanView] = useState<boolean>(true)
  const [canEdit, setCanEdit] = useState<boolean>(false)
  const [canDelete, setCanDelete] = useState<boolean>(false)
  const [canShare, setCanShare] = useState<boolean>(false)

  const dbQuery = useApiQuery(
    ['mapLayerApiPermissions', apiId],
    () => mapLayerApiService.getPermissions(apiId!),
    { enabled: !!apiId && open, staleTime: 0 },
    false,
    false
  )

  const permissions = useMemo(() => {
    const responseData = (dbQuery.data as ApiResponse<PermissionResponseData>)?.data
    return normalizePermissions(responseData)
  }, [dbQuery.data])

  const addPermissionMutation = useApiMutation(
    (payload: AddPermissionBody) => mapLayerApiService.addPermission(apiId!, payload),
    {
      onSuccess: () => {
        dbQuery.refetch()
        setPrincipalType('public')
        setUserId('')
        setRoleId('')
        setCanView(true)
        setCanEdit(false)
        setCanDelete(false)
        setCanShare(false)
      },
    },
    true
  )

  const deletePermissionMutation = useApiMutation(
    (permissionId: number) => mapLayerApiService.deletePermission(apiId!, permissionId),
    {
      onSuccess: () => {
        dbQuery.refetch()
      },
    },
    true
  )

  function handleAddPermission(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!apiId) return

    const payload: AddPermissionBody = {
      principal_type: principalType,
      can_view: canView,
      can_edit: canEdit,
      can_delete: canDelete,
      can_share: canShare,
    }

    if (principalType === 'user') {
      if (!userId.trim() || Number.isNaN(Number(userId))) {
        toast.error('Vui lòng nhập user_id hợp lệ')
        return
      }
      payload.user_id = Number(userId)
      payload.role_id = null
    }

    if (principalType === 'role') {
      if (!roleId.trim() || Number.isNaN(Number(roleId))) {
        toast.error('Vui lòng nhập role_id hợp lệ')
        return
      }
      payload.role_id = Number(roleId)
      payload.user_id = null
    }

    if (principalType === 'public') {
      payload.user_id = null
      payload.role_id = null
    }

    addPermissionMutation.mutate(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-5xl overflow-y-auto">
        <DialogTitle>Phân quyền API lớp bản đồ</DialogTitle>
        <DialogDescription>Quản lý quyền truy cập cho API đã chọn</DialogDescription>

        <form className="mt-3 space-y-4 rounded border p-4" onSubmit={handleAddPermission}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Principal Type</Label>
              <Select value={principalType} onValueChange={(value) => setPrincipalType(value as PrincipalType)}>
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

            {principalType === 'user' && (
              <div className="space-y-2">
                <Label htmlFor="permission-user-id">User ID</Label>
                <Input
                  id="permission-user-id"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Nhập user_id"
                />
              </div>
            )}

            {principalType === 'role' && (
              <div className="space-y-2">
                <Label htmlFor="permission-role-id">Role ID</Label>
                <Input
                  id="permission-role-id"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  placeholder="Nhập role_id"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <label className="flex items-center gap-2">
              <Checkbox checked={canView} onCheckedChange={(checked) => setCanView(Boolean(checked))} />
              <span className="text-sm">Can View</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={canEdit} onCheckedChange={(checked) => setCanEdit(Boolean(checked))} />
              <span className="text-sm">Can Edit</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={canDelete} onCheckedChange={(checked) => setCanDelete(Boolean(checked))} />
              <span className="text-sm">Can Delete</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={canShare} onCheckedChange={(checked) => setCanShare(Boolean(checked))} />
              <span className="text-sm">Can Share</span>
            </label>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={addPermissionMutation.isPending || !apiId}>
              {addPermissionMutation.isPending ? 'Đang thêm...' : 'Thêm quyền'}
            </Button>
          </div>
        </form>

        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead>View</TableHead>
                <TableHead>Edit</TableHead>
                <TableHead>Delete</TableHead>
                <TableHead>Share</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Chưa có quyền nào
                  </TableCell>
                </TableRow>
              ) : (
                permissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>{permission.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{permission.principal_type}</span>
                        <span className="text-muted-foreground text-xs">
                          {permission.user_id ? `user_id: ${permission.user_id}` : ''}
                          {permission.role_id ? `role_id: ${permission.role_id}` : ''}
                          {!permission.user_id && !permission.role_id ? 'toàn bộ công khai' : ''}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{permission.can_view ? <Badge variant="default">Có</Badge> : '-'}</TableCell>
                    <TableCell>{permission.can_edit ? <Badge variant="default">Có</Badge> : '-'}</TableCell>
                    <TableCell>{permission.can_delete ? <Badge variant="default">Có</Badge> : '-'}</TableCell>
                    <TableCell>{permission.can_share ? <Badge variant="default">Có</Badge> : '-'}</TableCell>
                    <TableCell>
                      {permission.created_at
                        ? formatDate(permission.created_at)
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePermissionMutation.mutate(permission.id)}
                        disabled={deletePermissionMutation.isPending}
                        title="Xóa quyền"
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

