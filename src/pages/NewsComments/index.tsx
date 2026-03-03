import type { JSX } from 'react'
import { useState, useEffect, useRef } from 'react'
import { useApiQuery, useApiMutation, newsCommentService } from '@/service'
import type { ApiResponse, NewsComment, NewsCommentListData, Pagination } from '@/types/api'
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
import { CheckCircle, MessagesSquare, Trash2 } from 'lucide-react'
import PageLayout from '@/layout/pageLayout'
import NewsCommentDetailDialog from './NewsCommentDetailDialog'
import NewsCommentReplyDialog from './NewsCommentReplyDialog'

export default function NewsComments(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const [searchValue, setSearchValue] = useState<string>('')
  const [approvedFilter, setApprovedFilter] = useState<string>('all')

  const queryParams = {
    page: currentPage,
    limit,
    sortBy: 'id',
    sortOrder: 'DESC' as const,
    ...(approvedFilter !== 'all' && { is_approved: approvedFilter === 'true' }),
  }

  const dbQuery = useApiQuery(
    ['news-comments', queryParams],
    () => newsCommentService.getAll(queryParams),
    {},
    false,
    false
  )

  const data = (dbQuery.data as ApiResponse<NewsCommentListData>)?.data
  const comments = data?.comments ?? []
  const pagination = (data?.pagination ?? {}) as Partial<Pagination>
  const lastTotalPagesRef = useRef<number | null>(null)
  if (pagination?.totalPages) lastTotalPagesRef.current = pagination.totalPages
  const totalPages = pagination?.totalPages ?? lastTotalPagesRef.current ?? 1
  const total = pagination?.total ?? 0

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  // Filter comments locally by search value (user_name, user_email, content)
  const filteredComments = searchValue
    ? comments.filter((c: any) => {
        const q = searchValue.toLowerCase()
        return (
          c.content?.toLowerCase().includes(q) ||
          c.user_name?.toLowerCase().includes(q) ||
          c.user_email?.toLowerCase().includes(q)
        )
      })
    : comments

  // Dialog states
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<any | null>(null)
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [commentToReply, setCommentToReply] = useState<NewsComment | null>(null)

  // Approve mutation
  const approveMutation = useApiMutation(
    (id: number) => newsCommentService.approve(id),
    {
      onSuccess: () => {
        dbQuery.refetch()
      },
    },
    true
  )

  // Delete mutation
  const deleteMutation = useApiMutation(
    (id: number) => newsCommentService.adminDelete(id),
    {
      onSuccess: () => {
        dbQuery.refetch()
        setDeleteDialogOpen(false)
        setCommentToDelete(null)
      },
    },
    true
  )

  function openDetails(c: any) {
    if (c?.id) {
      setSelectedCommentId(c.id)
      setDetailDialogOpen(true)
    }
  }

  function openDeleteDialog(c: any) {
    setCommentToDelete(c)
    setDeleteDialogOpen(true)
  }

  function handleDelete() {
    if (commentToDelete) {
      deleteMutation.mutate(commentToDelete.id)
    }
  }

  return (
    <PageLayout title="Bình luận tin tức" description="Quản lý bình luận bài viết">
      <ToolTableCustom
        searchValue={searchValue}
        setSearchValue={(v) => {
          setSearchValue(v)
          setCurrentPage(1)
        }}
        filter={
          <div className="flex items-center gap-2">
            <Select
              value={approvedFilter}
              onValueChange={(v) => {
                setApprovedFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="false">Chờ duyệt</SelectItem>
                <SelectItem value="true">Đã duyệt</SelectItem>
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
              <TableHead>Bài viết</TableHead>
              <TableHead>Người bình luận</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              filteredComments.map((c: any) => (
                <TableRow
                  className="hover:cursor-pointer"
                  key={c.id}
                  onClick={() => openDetails(c)}
                >
                  <TableCell>{c.id}</TableCell>
                  <TableCell>#{c.news_id}</TableCell>
                  <TableCell>
                    {c.user
                      ? `${c.user.full_name || `User #${c.user.id}`} (ID: ${c.user.id})`
                      : c.user_name || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {c.user_email || '-'}
                  </TableCell>
                  <TableCell className="max-w-60">
                    <span className="line-clamp-2 text-sm">{c.content}</span>
                  </TableCell>
                  <TableCell>
                    {c.is_approved ? (
                      <Badge variant="default">Đã duyệt</Badge>
                    ) : (
                      <Badge variant="secondary">Chờ duyệt</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('vi-VN') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {!c.is_approved && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            approveMutation.mutate(c.id)
                          }}
                          title="Duyệt bình luận"
                        >
                          <CheckCircle className="size-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCommentToReply(c)
                          setReplyDialogOpen(true)
                        }}
                        title="Trả lời bình luận"
                      >
                        <MessagesSquare className="size-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteDialog(c)
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

      {/* Dialog trả lời */}
      <NewsCommentReplyDialog
        open={replyDialogOpen}
        onOpenChange={setReplyDialogOpen}
        parentComment={commentToReply}
        onSuccess={() => {
          dbQuery.refetch()
          setCommentToReply(null)
        }}
      />

      {/* Dialog chi tiết */}
      <NewsCommentDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        commentId={selectedCommentId}
      />

      {/* Dialog xác nhận xóa */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.
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
