import type { JSX } from 'react'
import { useEffect, useRef, useState } from 'react'
import { mapLayerApiService, useApiMutation, useApiQuery } from '@/service'
import type { ApiResponse, MapLayerApiListData, Pagination } from '@/types/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { StatusDotBadge } from '@/components/common/StatusDotBadge'
import { STATUS_LABEL, STATUS_CLASS, STATUS_DOT } from '@/constant/mapLayerApiConstant'
import ToolTableCustom from '@/components/features/ToolTableCustom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import { KeyRound, Pen, Share2, Trash2 } from 'lucide-react'
import PageLayout from '@/layout/pageLayout'
import MapLayerApiDetailDialog from './MapLayerApiDetailDialog'
import MapLayerApiFormDialog from './MapLayerApiFormDialog'
import MapLayerApiPermissionDialog from './MapLayerApiPermissionDialog'
import MapLayerApiShareDialog from './MapLayerApiShareDialog'
import { formatDate } from '@/lib/date'

type MapLayerApiRow = {
  id: number
  name: string
  slug: string
  endpoint_url: string
  http_method: string
  status: 'draft' | 'published'
  created_at: string
  category?: { name?: string }
}

export default function MapLayerApisPage(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const [searchValue, setSearchValue] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const queryParams = {
    page: currentPage,
    limit,
    sortBy: 'created_at',
    sortOrder: 'DESC' as const,
    ...(searchValue && { search: searchValue }),
    ...(statusFilter !== 'all' && { status: statusFilter as 'draft' | 'published' }),
  }

  const dbQuery = useApiQuery(
    ['mapLayerApis', queryParams],
    () => mapLayerApiService.getAll(queryParams),
    {},
    false,
    false
  )

  const data = (dbQuery.data as ApiResponse<MapLayerApiListData>)?.data
  const apiList = (data?.apis ?? []) as MapLayerApiRow[]
  const pagination = (data?.pagination ?? {}) as Partial<Pagination>
  const lastTotalPagesRef = useRef<number | null>(null)
  if (pagination?.totalPages) lastTotalPagesRef.current = pagination.totalPages
  const totalPages = pagination?.totalPages ?? lastTotalPagesRef.current ?? 1
  const total = pagination?.total ?? 0

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const [selectedApiId, setSelectedApiId] = useState<number | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [apiToDelete, setApiToDelete] = useState<MapLayerApiRow | null>(null)

  const deleteMutation = useApiMutation(
    (id: number) => mapLayerApiService.delete(id),
    {
      onSuccess: () => {
        dbQuery.refetch()
        setDeleteDialogOpen(false)
        setApiToDelete(null)
      },
    },
    true
  )

  function openDetails(api: MapLayerApiRow) {
    if (api?.id) {
      setSelectedApiId(api.id)
      setDetailDialogOpen(true)
    }
  }

  function openAddDialog() {
    setSelectedApiId(null)
    setFormDialogOpen(true)
  }

  function openEditDialog(api: MapLayerApiRow) {
    setSelectedApiId(api.id)
    setFormDialogOpen(true)
  }

  function openDeleteDialog(api: MapLayerApiRow) {
    setApiToDelete(api)
    setDeleteDialogOpen(true)
  }

  function openPermissionDialog(api: MapLayerApiRow) {
    setSelectedApiId(api.id)
    setPermissionDialogOpen(true)
  }

  function openShareDialog(api: MapLayerApiRow) {
    setSelectedApiId(api.id)
    setShareDialogOpen(true)
  }

  function handleDelete() {
    if (apiToDelete) deleteMutation.mutate(apiToDelete.id)
  }

  return (
    <PageLayout title="API lớp bản đồ" description="Quản lý API lớp bản đồ">
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
              onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={`${limit}`}
              onValueChange={(value) => {
                setLimit(parseInt(value, 10))
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
              Thêm API
            </Button>
          </div>
        }
        total={total}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: (page: number) => setCurrentPage(page),
        }}
      >
        <Table className="relative">
          <TableHeader className="sticky top-0 z-20">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên API</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              apiList.map((api) => (
                <TableRow
                  key={api.id}
                  className="hover:cursor-pointer"
                  onClick={() => openDetails(api)}
                >
                  <TableCell>{api.id}</TableCell>
                  <TableCell className="max-w-64 font-medium">
                    <span className="line-clamp-2">{api.name}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{api.slug}</TableCell>
                  <TableCell>{api.category?.name || '-'}</TableCell>
                  <TableCell>{api.http_method}</TableCell>
                  <TableCell>
                    <StatusDotBadge
                      label={STATUS_LABEL[api.status] ?? api.status}
                      badgeClass={
                        STATUS_CLASS[api.status] ?? 'bg-slate-100 text-slate-500 border-slate-200'
                      }
                      dotClass={STATUS_DOT[api.status] ?? 'bg-slate-400'}
                    />
                  </TableCell>
                  <TableCell>{api.created_at ? formatDate(api.created_at) : '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openShareDialog(api)
                        }}
                        title="Chia sẻ"
                      >
                        <Share2 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openPermissionDialog(api)
                        }}
                        title="Phân quyền"
                      >
                        <KeyRound className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditDialog(api)
                        }}
                        title="Chỉnh sửa"
                      >
                        <Pen className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteDialog(api)
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

      <MapLayerApiDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        apiId={selectedApiId}
      />

      <MapLayerApiFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        apiId={selectedApiId}
        onSaved={() => {
          dbQuery.refetch()
          setSelectedApiId(null)
        }}
      />
      <MapLayerApiPermissionDialog
        open={permissionDialogOpen}
        onOpenChange={setPermissionDialogOpen}
        apiId={selectedApiId}
      />
      <MapLayerApiShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        apiId={selectedApiId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa API "{apiToDelete?.name}"? Hành động này không thể hoàn tác.
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
