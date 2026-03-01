import type { JSX } from 'react'
import { useState, useEffect, useRef } from 'react'
import { useApiQuery, useApiMutation, userService, authService } from '@/service'
import type { ApiResponse, AuthMeData, UserListData } from '@/types/api'
import { useQueryClient } from '@tanstack/react-query'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import ToolTableCustom from '@/components/features/ToolTableCustom'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Pen, Trash2 } from 'lucide-react'
import PageLayout from '@/layout/pageLayout'
import { toast } from 'react-toastify'
import UserDetailDialog from './UserDetailDialog'
import UserFormDialog from './UserFormDialog'

export default function User(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const [searchValue, setSearchValue] = useState<string>('')

  const queryParams = {
    page: currentPage,
    limit,
    sortBy: 'id',
    sortOrder: 'ASC' as const,
    ...(searchValue && { search: searchValue }),
  }

  const dbQuery = useApiQuery(
    ['users', queryParams],
    () => userService.getAll(queryParams),
    {},
    false,
    false
  )

  const data = (dbQuery.data as ApiResponse<UserListData>)?.data
  const users = data?.users ?? []
  const pagination = data?.pagination ?? {}
  const lastTotalPagesRef = useRef<number | null>(null)
  if (pagination?.totalPages) lastTotalPagesRef.current = pagination.totalPages
  const totalPages = pagination?.totalPages ?? lastTotalPagesRef.current ?? 1
  const total = pagination?.total ?? 0

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  // Dialog states
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<any | null>(null)

  // Get current user
  const currentUserQuery = useApiQuery(
    ['currentUser'],
    () => authService.getProfile(),
    {},
    false,
    false
  )
  const currentUser = (currentUserQuery.data as ApiResponse<AuthMeData>)?.data?.user ?? null

  const queryClient = useQueryClient()

  // Create mutation
  const createMutation = useApiMutation(
    (data: any) => userService.create(data),
    {
      onSuccess: () => {
        dbQuery.refetch()
        setFormDialogOpen(false)
        setSelectedUserId(null)
      },
    },
    true
  )

  // Update mutation
  const updateMutation = useApiMutation(
    (data: { id: number; payload: any }) => userService.update(data.id, data.payload),
    {
      onSuccess: (data, variables) => {
        const vars = variables as { id: number; payload: any }
        const updatedUser = (data as ApiResponse)?.data?.user
        if (updatedUser) {
          queryClient.setQueryData(['user', vars.id], { data: { user: updatedUser } })
        }
        dbQuery.refetch()
        setFormDialogOpen(false)
        setSelectedUserId(null)
      },
    },
    true
  )

  // Delete mutation
  const deleteMutation = useApiMutation((id: number) => userService.delete(id), {
    onSuccess: () => {
      dbQuery.refetch()
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    },
  })

  function openDetails(u: any) {
    if (u?.id) {
      setSelectedUserId(u.id)
      setDetailDialogOpen(true)
    }
  }

  function openAddDialog() {
    setSelectedUserId(null)
    setFormDialogOpen(true)
  }

  function openEditDialog(u: any) {
    setSelectedUserId(u.id)
    setFormDialogOpen(true)
  }

  function openDeleteDialog(u: any) {
    // Kiểm tra nếu đang cố xóa chính mình
    if (currentUser && u.id === currentUser.id) {
      toast.warning('Bạn không thể xóa tài khoản của bạn')
      return
    }
    setUserToDelete(u)
    setDeleteDialogOpen(true)
  }

  function handleFormSubmit(data: any) {
    if (selectedUserId) {
      updateMutation.mutate({ id: selectedUserId, payload: data })
    } else {
      createMutation.mutate(data)
    }
  }

  function handleDelete() {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id)
    }
  }

  return (
    <PageLayout title="Người dùng" description="Quản lý người dùng hệ thống">
      <ToolTableCustom
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        filter={
          <div className="flex items-center gap-2">
            <Select
              value={`${limit}`}
              onValueChange={(v) => {
                setLimit(parseInt(v, 10))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="default" onClick={openAddDialog}>
              Thêm người dùng
            </Button>
          </div>
        }
        total={total}
        pagination={{
          currentPage: currentPage,
          totalPages,
          onPageChange: (page: number) => setCurrentPage(page),
        }}
      >
        <Table className="relative">
          <TableHeader className="sticky top-0 z-20">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên đăng nhập</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Điện thoại</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              users.map((u: any) => (
                <TableRow
                  className="hover:cursor-pointer"
                  key={u.id}
                  onClick={() => openDetails(u)}
                >
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.username || u.login}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.full_name || '-'}</TableCell>
                  <TableCell>{u.phone || '-'}</TableCell>
                  <TableCell>{u.role_name || u.role?.name || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditDialog(u)
                        }}
                        title="Chỉnh sửa"
                      >
                        <Pen className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteDialog(u)
                        }}
                        title="Xóa"
                      >
                        <Trash2 className="text-destructive h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ToolTableCustom>

      {/* Dialog chi tiết */}
      <UserDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        userId={selectedUserId}
      />

      {/* Dialog thêm/sửa */}
      <UserFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        userId={selectedUserId}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Dialog xác nhận xóa */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng "{userToDelete?.username || userToDelete?.login}
              "? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  )
}
