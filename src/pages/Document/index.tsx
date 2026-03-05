import type { JSX } from 'react'
import { useState, useEffect, useRef } from 'react'
import { useApiQuery, useApiMutation, documentService } from '@/service'
import type {
  ApiResponse,
  Document,
  DocumentListData,
  DocumentType,
  DocumentStatus,
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
import { StatusDotBadge } from '@/components/common/StatusDotBadge'
import { Pen, Trash2, FileText, Download, Eye } from 'lucide-react'
import PageLayout from '@/layout/pageLayout'
import DocumentDetailDialog from './DocumentDetailDialog'
import DocumentFormDialog from './DocumentFormDialog'
import { parseLink } from '@/lib/utils'
import { formatDate } from '@/lib/date'
import {
  TYPE_LABEL,
  TYPE_CLASS,
  TYPE_DOT,
  STATUS_LABEL,
  STATUS_CLASS,
  STATUS_DOT,
} from '@/constant/documentConstant'

export default function DocumentPage(): JSX.Element {
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchValue, setSearchValue] = useState('')
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'all'>('all')

  const queryParams = {
    page: currentPage,
    limit,
    sortBy: 'created_at',
    sortOrder: 'DESC' as const,
    ...(searchValue && { search: searchValue }),
    ...(filterType !== 'all' && { document_type: filterType }),
    ...(filterStatus !== 'all' && { status: filterStatus }),
  }

  const dbQuery = useApiQuery(
    ['documents', queryParams],
    () => documentService.getAll(queryParams),
    {},
    false,
    false
  )

  const data = (dbQuery.data as ApiResponse<DocumentListData>)?.data
  const documents = data?.documents ?? []
  const pagination = (data?.pagination ?? {}) as Partial<Pagination>

  const lastTotalPagesRef = useRef<number | null>(null)
  if (pagination?.totalPages) lastTotalPagesRef.current = pagination.totalPages
  const totalPages = pagination?.totalPages ?? lastTotalPagesRef.current ?? 1
  const total = pagination?.total ?? 0

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  // Dialog states
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Document | null>(null)

  const createMutation = useApiMutation(
    (fd: FormData) => documentService.create(fd),
    {
      onSuccess: () => {
        dbQuery.refetch()
        setFormDialogOpen(false)
        setSelectedId(null)
      },
    },
    true
  )

  const updateMutation = useApiMutation(
    (args: { id: number; payload: FormData }) => documentService.update(args.id, args.payload),
    {
      onSuccess: () => {
        dbQuery.refetch()
        setFormDialogOpen(false)
        setSelectedId(null)
      },
    },
    true
  )

  const deleteMutation = useApiMutation(
    (id: number) => documentService.delete(id),
    {
      onSuccess: () => {
        dbQuery.refetch()
        setDeleteDialogOpen(false)
        setItemToDelete(null)
      },
    },
    true
  )

  function openDetails(item: Document) {
    setSelectedId(item.id)
    setDetailDialogOpen(true)
  }

  function openAddDialog() {
    setSelectedId(null)
    setFormDialogOpen(true)
  }

  function openEditDialog(item: Document) {
    setSelectedId(item.id)
    setFormDialogOpen(true)
  }

  function openDeleteDialog(item: Document) {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  function handleFormSubmit(fd: FormData) {
    if (selectedId) {
      updateMutation.mutate({ id: selectedId, payload: fd })
    } else {
      createMutation.mutate(fd)
    }
  }

  return (
    <PageLayout title="Văn bản báo cáo" description="Quản lý tài liệu và văn bản trong hệ thống">
      <ToolTableCustom
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        filter={
          <div className="flex items-center gap-2">
            {/* Loại */}
            <Select
              value={filterType}
              onValueChange={(v) => {
                setFilterType(v as DocumentType | 'all')
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="word">Word</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>

            {/* Trạng thái */}
            <Select
              value={filterStatus}
              onValueChange={(v) => {
                setFilterStatus(v as DocumentStatus | 'all')
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hiệu lực</SelectItem>
                <SelectItem value="archived">Lưu trữ</SelectItem>
                <SelectItem value="revoked">Thu hồi</SelectItem>
                <SelectItem value="replaced">Đã thay thế</SelectItem>
              </SelectContent>
            </Select>

            {/* Số dòng */}
            <Select
              value={`${limit}`}
              onValueChange={(v) => {
                setLimit(parseInt(v, 10))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="default" onClick={openAddDialog}>
              Thêm tài liệu
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
              <TableHead className="w-12">ID</TableHead>
              <TableHead className="w-28">Số TL</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead className="w-20">Loại</TableHead>
              <TableHead className="w-28">Trạng thái</TableHead>
              <TableHead className="w-24">Phạm vi</TableHead>
              <TableHead className="w-16 text-center">
                <Eye className="mx-auto size-4" />
              </TableHead>
              <TableHead className="w-16 text-center">
                <Download className="mx-auto size-4" />
              </TableHead>
              <TableHead className="w-28">Ngày tạo</TableHead>
              <TableHead className="w-28 text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              documents.map((item: Document) => (
                <TableRow
                  key={item.id}
                  className="hover:cursor-pointer"
                  onClick={() => openDetails(item)}
                >
                  <TableCell>{item.id}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {item.document_number}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="text-muted-foreground size-4 shrink-0" />
                      <span className="line-clamp-2 max-w-64 font-medium">{item.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusDotBadge
                      label={TYPE_LABEL[item.document_type] ?? item.document_type}
                      badgeClass={
                        TYPE_CLASS[item.document_type] ??
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }
                      dotClass={TYPE_DOT[item.document_type] ?? 'bg-slate-400'}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusDotBadge
                      label={STATUS_LABEL[item.status] ?? item.status}
                      badgeClass={
                        STATUS_CLASS[item.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                      }
                      dotClass={STATUS_DOT[item.status] ?? 'bg-slate-400'}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusDotBadge
                      label={item.is_public ? 'Công khai' : 'Nội bộ'}
                      badgeClass={
                        item.is_public
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }
                      dotClass={item.is_public ? 'bg-blue-500' : 'bg-slate-400'}
                    />
                  </TableCell>
                  <TableCell className="text-center text-sm">{item.view_count}</TableCell>
                  <TableCell className="text-center text-sm">{item.download_count}</TableCell>
                  <TableCell className="text-sm">
                    {item.created_at ? formatDate(item.created_at) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {item.file_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          title="Tải file"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a
                            href={parseLink(item.file_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="size-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditDialog(item)
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
                          openDeleteDialog(item)
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

      <DocumentDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        documentId={selectedId}
      />

      <DocumentFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        documentId={selectedId}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài liệu &quot;{itemToDelete?.title}&quot;? Hành động này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && deleteMutation.mutate(itemToDelete.id)}
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
