import type { JSX } from 'react'
import { useState, useEffect, useRef } from 'react'
import { useApiQuery, useApiMutation, categoryService } from '@/service'
import type { ApiResponse, CategoryListData, Pagination } from '@/types/api'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Eye, EyeOff, Pen, Trash2 } from 'lucide-react'
import PageLayout from '@/layout/pageLayout'
import CategoryDetailDialog from './CategoryDetailDialog'
import CategoryFormDialog from './CategoryFormDialog'
import { parseLink } from '@/lib/utils'

export default function Category(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const [searchValue, setSearchValue] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const queryParams = {
    page: currentPage,
    limit,
    sortBy: 'id',
    sortOrder: 'ASC' as const,
    ...(searchValue && { search: searchValue }),
    ...(statusFilter !== 'all' && { is_active: statusFilter === 'true' }),
  }

  const dbQuery = useApiQuery(
    ['categories', queryParams],
    () => categoryService.getAll(queryParams),
    {},
    false,
    false
  )

  const data = (dbQuery.data as ApiResponse<CategoryListData>)?.data
  const categories = data?.categories ?? []
  const pagination = (data?.pagination ?? {}) as Partial<Pagination>
  const lastTotalPagesRef = useRef<number | null>(null)
  if (pagination?.totalPages) lastTotalPagesRef.current = pagination.totalPages
  const totalPages = pagination?.totalPages ?? lastTotalPagesRef.current ?? 1
  const total = pagination?.total ?? 0

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null)

  const createMutation = useApiMutation(
    (payload: FormData) => categoryService.create(payload),
    {
      onSuccess: () => {
        dbQuery.refetch()
        setFormDialogOpen(false)
        setSelectedCategoryId(null)
      },
    },
    true
  )

  const updateMutation = useApiMutation(
    (payload: { id: number; data: FormData }) => categoryService.update(payload.id, payload.data),
    {
      onSuccess: () => {
        dbQuery.refetch()
        setFormDialogOpen(false)
        setSelectedCategoryId(null)
      },
    },
    true
  )

  const toggleStatusMutation = useApiMutation(
    (id: number) => categoryService.toggleStatus(id),
    {
      onSuccess: () => {
        dbQuery.refetch()
      },
    },
    true
  )

  const deleteMutation = useApiMutation(
    (id: number) => categoryService.delete(id),
    {
      onSuccess: () => {
        dbQuery.refetch()
        setDeleteDialogOpen(false)
        setCategoryToDelete(null)
      },
    },
    true
  )

  function openDetails(category: any) {
    if (category?.id) {
      setSelectedCategoryId(category.id)
      setDetailDialogOpen(true)
    }
  }

  function openAddDialog() {
    setSelectedCategoryId(null)
    setFormDialogOpen(true)
  }

  function openEditDialog(category: any) {
    setSelectedCategoryId(category.id)
    setFormDialogOpen(true)
  }

  function openDeleteDialog(category: any) {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  function handleFormSubmit(data: FormData) {
    if (selectedCategoryId) {
      updateMutation.mutate({ id: selectedCategoryId, data })
    } else {
      createMutation.mutate(data)
    }
  }

  function handleDelete() {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id)
    }
  }

  return (
    <PageLayout title="Danh mục" description="Quản lý danh mục hệ thống">
      <ToolTableCustom
        searchValue={searchValue}
        setSearchValue={(value) => {
          setSearchValue(value)
          setCurrentPage(1)
        }}
        filter={
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Đang hoạt động</SelectItem>
                <SelectItem value="false">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>

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
              Thêm danh mục
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
              <TableHead>Tên danh mục</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Màu</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category: any) => (
                <TableRow
                  className="hover:cursor-pointer"
                  key={category.id}
                  onClick={() => openDetails(category)}
                >
                  <TableCell>{category.id}</TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell className="max-w-80">
                    <span className="line-clamp-2">{category.description || '-'}</span>
                  </TableCell>
                  <TableCell>
                    {category.icon_url ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={parseLink(category.icon_url)}
                          alt={category.name}
                          className="h-5 w-5 shrink-0 object-contain"
                          draggable={false}
                        />
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {category.color ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-4 w-4 rounded border"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-mono text-xs">{category.color}</span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {category.is_active ? (
                      <Badge variant="default">Đang hoạt động</Badge>
                    ) : (
                      <Badge variant="secondary">Ngừng hoạt động</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {category.created_at
                      ? new Date(category.created_at).toLocaleDateString('vi-VN')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditDialog(category)
                        }}
                        title="Chỉnh sửa"
                      >
                        <Pen className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleStatusMutation.mutate(category.id)
                        }}
                        title={category.is_active ? 'Nhấn để ngừng hoạt động' : 'Nhấn để kích hoạt'}
                      >
                        {category.is_active ? (
                          <EyeOff className="text-muted-foreground size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteDialog(category)
                        }}
                        title="Xóa"
                      >
                        <Trash2 className="text-destructive size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ToolTableCustom>

      <CategoryDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        categoryId={selectedCategoryId}
      />

      <CategoryFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        categoryId={selectedCategoryId}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục "{categoryToDelete?.name}"? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  )
}
