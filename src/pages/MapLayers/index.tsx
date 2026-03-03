import type { JSX } from 'react'
import { useEffect, useRef, useState } from 'react'
import { mapLayerService, useApiMutation, useApiQuery } from '@/service'
import type {
  ApiResponse,
  CreateMapLayerBody,
  MapLayer,
  MapLayerListData,
  Pagination,
} from '@/types/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Eye, EyeOff, Pen, Trash2 } from 'lucide-react'
import PageLayout from '@/layout/pageLayout'
import MapLayerDetailDialog from './MapLayerDetailDialog'
import MapLayerFormDialog from './MapLayerFormDialog'
import { formatDate } from '@/lib/date'

export default function MapLayerPage(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const [searchValue, setSearchValue] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [geometryFilter, setGeometryFilter] = useState<string>('all')

  const queryParams = {
    page: currentPage,
    limit,
    sortBy: 'created_at',
    sortOrder: 'DESC' as const,
    ...(searchValue && { search: searchValue }),
    ...(statusFilter !== 'all' && { is_active: statusFilter === 'true' }),
    ...(geometryFilter !== 'all' && { geometry_type: geometryFilter }),
  }

  const dbQuery = useApiQuery(
    ['mapLayers', queryParams],
    () => mapLayerService.getAll(queryParams),
    {},
    false,
    false
  )

  const data = (dbQuery.data as ApiResponse<MapLayerListData>)?.data
  const layers = data?.mapLayers ?? []
  const pagination = (data?.pagination ?? {}) as Partial<Pagination>
  const lastTotalPagesRef = useRef<number | null>(null)
  if (pagination?.totalPages) lastTotalPagesRef.current = pagination.totalPages
  const totalPages = pagination?.totalPages ?? lastTotalPagesRef.current ?? 1
  const total = pagination?.total ?? 0

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const [selectedLayerId, setSelectedLayerId] = useState<number | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [layerToDelete, setLayerToDelete] = useState<MapLayer | null>(null)

  const createMutation = useApiMutation(
    (payload: CreateMapLayerBody) => mapLayerService.create(payload),
    {
      onSuccess: () => {
        dbQuery.refetch()
        setFormDialogOpen(false)
        setSelectedLayerId(null)
      },
    },
    true
  )

  const updateMutation = useApiMutation(
    (payload: { id: number; data: CreateMapLayerBody }) =>
      mapLayerService.update(payload.id, payload.data),
    {
      onSuccess: () => {
        dbQuery.refetch()
        setFormDialogOpen(false)
        setSelectedLayerId(null)
      },
    },
    true
  )

  const toggleStatusMutation = useApiMutation(
    (id: number) => mapLayerService.toggleStatus(id),
    {
      onSuccess: () => {
        dbQuery.refetch()
      },
    },
    true
  )

  const deleteMutation = useApiMutation(
    (id: number) => mapLayerService.delete(id),
    {
      onSuccess: () => {
        dbQuery.refetch()
        setDeleteDialogOpen(false)
        setLayerToDelete(null)
      },
    },
    true
  )

  function openDetails(mapLayer: MapLayer) {
    if (mapLayer?.id) {
      setSelectedLayerId(mapLayer.id)
      setDetailDialogOpen(true)
    }
  }

  function openDeleteDialog(mapLayer: MapLayer) {
    setLayerToDelete(mapLayer)
    setDeleteDialogOpen(true)
  }

  function openAddDialog() {
    setSelectedLayerId(null)
    setFormDialogOpen(true)
  }

  function openEditDialog(mapLayer: MapLayer) {
    setSelectedLayerId(mapLayer.id)
    setFormDialogOpen(true)
  }

  function handleFormSubmit(data: CreateMapLayerBody) {
    if (selectedLayerId) {
      updateMutation.mutate({ id: selectedLayerId, data })
      return
    }
    createMutation.mutate(data)
  }

  function handleDelete() {
    if (layerToDelete) deleteMutation.mutate(layerToDelete.id)
  }

  return (
    <PageLayout title="Quản lý lớp dữ liệu" description="Quản lý lớp dữ liệu bản đồ">
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
              value={geometryFilter}
              onValueChange={(v) => {
                setGeometryFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Mọi hình học</SelectItem>
                <SelectItem value="point">Point</SelectItem>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="polygon">Polygon</SelectItem>
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
              Thêm lớp dữ liệu
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
              <TableHead>Tên lớp</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Kiểu</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {layers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              layers.map((layer) => (
                <TableRow
                  key={layer.id}
                  className="hover:cursor-pointer"
                  onClick={() => openDetails(layer)}
                >
                  <TableCell>{layer.id}</TableCell>
                  <TableCell>{layer.name}</TableCell>
                  <TableCell>{layer.category_name || '-'}</TableCell>
                  <TableCell className="uppercase">{layer.geometry_type || '-'}</TableCell>
                  <TableCell>
                    {layer.is_active ? (
                      <Badge variant="default">Đang hoạt động</Badge>
                    ) : (
                      <Badge variant="secondary">Ngừng hoạt động</Badge>
                    )}
                  </TableCell>
                  <TableCell>{layer.created_at ? formatDate(layer.created_at) : '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditDialog(layer)
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
                          toggleStatusMutation.mutate(layer.id)
                        }}
                        title={layer.is_active ? 'Nhấn để ngừng hoạt động' : 'Nhấn để kích hoạt'}
                      >
                        {layer.is_active ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteDialog(layer)
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

      <MapLayerDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        layerId={selectedLayerId}
      />
      <MapLayerFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        layerId={selectedLayerId}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa lớp "{layerToDelete?.name}"? Hành động này không thể hoàn
              tác.
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
