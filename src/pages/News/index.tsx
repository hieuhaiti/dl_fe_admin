import type { JSX } from 'react'
import { useState, useEffect, useRef } from 'react'
import { useApiQuery, useApiMutation, newsService } from '@/service'
import type { ApiResponse, NewsListData, Pagination } from '@/types/api'
import { useQueryClient } from '@tanstack/react-query'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { StatusDotBadge } from '@/components/common/StatusDotBadge'
import ToolTableCustom from '@/components/features/ToolTableCustom'
import {
  PUBLISHED_LABEL,
  PUBLISHED_CLASS,
  PUBLISHED_DOT,
  FEATURED_LABEL,
  FEATURED_CLASS,
  FEATURED_DOT,
} from '@/constant/newsConstant'
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
import { Eye, EyeOff, Pen, Star, StarOff, Trash2 } from 'lucide-react'
import PageLayout from '@/layout/pageLayout'
import NewsDetailDialog from './NewsDetailDialog'
import NewsFormDialog from './NewsFormDialog'

export default function News(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isPublishedFilter, setIsPublishedFilter] = useState<string>('all')

  const queryParams = {
    page: currentPage,
    limit,
    sortBy: 'id',
    sortOrder: 'DESC' as const,
    ...(searchValue && { search: searchValue }),
    ...(isPublishedFilter !== 'all' && { is_published: isPublishedFilter === 'true' }),
  }

  const dbQuery = useApiQuery(
    ['news', queryParams],
    () => newsService.getAll(queryParams),
    {},
    false,
    false
  )

  const data = (dbQuery.data as ApiResponse<NewsListData>)?.data
  const newsList = data?.news ?? []
  const pagination = (data?.pagination ?? {}) as Partial<Pagination>
  const lastTotalPagesRef = useRef<number | null>(null)
  if (pagination?.totalPages) lastTotalPagesRef.current = pagination.totalPages
  const totalPages = pagination?.totalPages ?? lastTotalPagesRef.current ?? 1
  const total = pagination?.total ?? 0

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  // Dialog states
  const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [newsToDelete, setNewsToDelete] = useState<any | null>(null)

  const queryClient = useQueryClient()

  // Create mutation
  const createMutation = useApiMutation(
    (data: FormData) => newsService.create(data),
    {
      onSuccess: () => {
        dbQuery.refetch()
        setFormDialogOpen(false)
        setSelectedNewsId(null)
      },
    },
    true
  )

  // Update mutation
  const updateMutation = useApiMutation(
    (data: { id: number; payload: FormData }) => newsService.update(data.id, data.payload),
    {
      onSuccess: (_data, variables) => {
        const vars = variables as { id: number; payload: FormData }
        queryClient.invalidateQueries({ queryKey: ['news', vars.id] })
        dbQuery.refetch()
        setFormDialogOpen(false)
        setSelectedNewsId(null)
      },
    },
    true
  )

  // Toggle published mutation
  const togglePublishedMutation = useApiMutation(
    (id: number) => newsService.togglePublished(id),
    {
      onSuccess: () => {
        dbQuery.refetch()
      },
    },
    true
  )

  // Toggle featured mutation
  const toggleFeaturedMutation = useApiMutation(
    (id: number) => newsService.toggleFeatured(id),
    {
      onSuccess: () => {
        dbQuery.refetch()
      },
    },
    true
  )

  // Delete mutation
  const deleteMutation = useApiMutation(
    (id: number) => newsService.delete(id),
    {
      onSuccess: () => {
        dbQuery.refetch()
        setDeleteDialogOpen(false)
        setNewsToDelete(null)
      },
    },
    true
  )

  function openDetails(n: any) {
    if (n?.id) {
      setSelectedNewsId(n.id)
      setDetailDialogOpen(true)
    }
  }

  function openAddDialog() {
    setSelectedNewsId(null)
    setFormDialogOpen(true)
  }

  function openEditDialog(n: any) {
    setSelectedNewsId(n.id)
    setFormDialogOpen(true)
  }

  function openDeleteDialog(n: any) {
    setNewsToDelete(n)
    setDeleteDialogOpen(true)
  }

  function handleFormSubmit(data: FormData) {
    if (selectedNewsId) {
      updateMutation.mutate({ id: selectedNewsId, payload: data })
    } else {
      createMutation.mutate(data)
    }
  }

  function handleDelete() {
    if (newsToDelete) {
      deleteMutation.mutate(newsToDelete.id)
    }
  }

  return (
    <PageLayout title="Tin tức" description="Quản lý bài viết tin tức">
      <ToolTableCustom
        searchValue={searchValue}
        setSearchValue={(v) => {
          setSearchValue(v)
          setCurrentPage(1)
        }}
        filter={
          <div className="flex items-center gap-2">
            <Select
              value={isPublishedFilter}
              onValueChange={(v) => {
                setIsPublishedFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Đã xuất bản</SelectItem>
                <SelectItem value="false">Bản nháp</SelectItem>
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
              Thêm tin tức
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
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Nổi bật</TableHead>
              <TableHead>Lượt xem</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {newsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              newsList.map((n: any) => (
                <TableRow
                  className="hover:cursor-pointer"
                  key={n.id}
                  onClick={() => openDetails(n)}
                >
                  <TableCell>{n.id}</TableCell>
                  <TableCell className="max-w-60">
                    <span className="line-clamp-2">{n.title}</span>
                  </TableCell>
                  <TableCell>
                    <StatusDotBadge
                      label={PUBLISHED_LABEL[String(n.is_published)]}
                      badgeClass={PUBLISHED_CLASS[String(n.is_published)]}
                      dotClass={PUBLISHED_DOT[String(n.is_published)]}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusDotBadge
                      label={FEATURED_LABEL[String(n.is_featured)]}
                      badgeClass={FEATURED_CLASS[String(n.is_featured)]}
                      dotClass={FEATURED_DOT[String(n.is_featured)]}
                    />
                  </TableCell>
                  <TableCell>{n.view_count ?? 0}</TableCell>
                  <TableCell>
                    {n.created_at ? new Date(n.created_at).toLocaleDateString('vi-VN') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditDialog(n)
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
                          togglePublishedMutation.mutate(n.id)
                        }}
                        title={n.is_published ? 'Hủy xuất bản' : 'Xuất bản'}
                      >
                        {n.is_published ? (
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
                          toggleFeaturedMutation.mutate(n.id)
                        }}
                        title={n.is_featured ? 'Bỏ nổi bật' : 'Đặt nổi bật'}
                      >
                        {n.is_featured ? (
                          <StarOff className="text-muted-foreground size-4" />
                        ) : (
                          <Star className="size-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteDialog(n)
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

      {/* Dialog chi tiết */}
      <NewsDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        newsId={selectedNewsId}
      />

      {/* Dialog thêm/sửa */}
      <NewsFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        newsId={selectedNewsId}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Dialog xác nhận xóa */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài viết &quot;{newsToDelete?.title}&quot;? Hành động này
              không thể hoàn tác.
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
