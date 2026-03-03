import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { documentService, useApiQuery } from '@/service'
import type { ApiResponse, Document } from '@/types/api'
import { parseLink } from '@/lib/utils'
import { FileText, Download, Eye } from 'lucide-react'
import { TYPE_LABEL, STATUS_LABEL, STATUS_VARIANT } from '@/constant/documentConstant'

interface DocumentDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId: number | null
}

function formatBytes(bytes?: number) {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function DocumentDetailDialog({
  open,
  onOpenChange,
  documentId,
}: DocumentDetailDialogProps) {
  const dbQuery = useApiQuery(
    ['document', documentId],
    () => documentService.getById(documentId!),
    { enabled: !!documentId && open, staleTime: 0 },
    false,
    false
  )
  const doc = (dbQuery.data as ApiResponse<{ document: Document }>)?.data?.document ?? null

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-2">
      <span className="font-semibold">{label}:</span>
      <span className="col-span-2">{children}</span>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogTitle>Chi tiết tài liệu</DialogTitle>
        <DialogDescription>Thông tin chi tiết tài liệu đã chọn</DialogDescription>

        {doc ? (
          <div className="mt-4 space-y-3">
            <Row label="ID">{doc.id}</Row>
            <Row label="Số tài liệu">{doc.document_number}</Row>
            <Row label="Tiêu đề">{doc.title}</Row>
            <Row label="Loại">
              <Badge variant="outline">{TYPE_LABEL[doc.document_type] ?? doc.document_type}</Badge>
            </Row>
            <Row label="Trạng thái">
              <Badge variant={STATUS_VARIANT[doc.status] ?? 'outline'}>
                {STATUS_LABEL[doc.status] ?? doc.status}
              </Badge>
            </Row>
            <Row label="Công khai">
              {doc.is_public ? (
                <Badge variant="default">Công khai</Badge>
              ) : (
                <Badge variant="secondary">Nội bộ</Badge>
              )}
            </Row>
            {doc.description && <Row label="Mô tả">{doc.description}</Row>}
            {doc.issuer && <Row label="Cơ quan ban hành">{doc.issuer}</Row>}
            {doc.signer && <Row label="Người ký">{doc.signer}</Row>}
            {doc.issued_date && (
              <Row label="Ngày ban hành">
                {new Date(doc.issued_date).toLocaleDateString('vi-VN')}
              </Row>
            )}
            {doc.effective_date && (
              <Row label="Ngày hiệu lực">
                {new Date(doc.effective_date).toLocaleDateString('vi-VN')}
              </Row>
            )}
            {doc.expiry_date && (
              <Row label="Ngày hết hạn">
                {new Date(doc.expiry_date).toLocaleDateString('vi-VN')}
              </Row>
            )}
            {doc.file_name && <Row label="Tên file">{doc.file_name}</Row>}
            <Row label="Dung lượng">{formatBytes(doc.file_size)}</Row>
            <Row label="Lượt xem">
              <span className="flex items-center gap-1">
                <Eye className="size-4" /> {doc.view_count}
              </span>
            </Row>
            <Row label="Lượt tải">
              <span className="flex items-center gap-1">
                <Download className="size-4" /> {doc.download_count}
              </span>
            </Row>
            {doc.tags && doc.tags.length > 0 && (
              <Row label="Tags">
                <div className="flex flex-wrap gap-1">
                  {doc.tags.map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </Row>
            )}
            {doc.file_url && (
              <Row label="File">
                <a
                  href={parseLink(doc.file_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary flex items-center gap-1 underline"
                >
                  <FileText className="size-4" /> Xem / Tải tài liệu
                </a>
              </Row>
            )}
            <Row label="Ngày tạo">
              {doc.created_at ? new Date(doc.created_at).toLocaleString('vi-VN') : '-'}
            </Row>
            <Row label="Cập nhật lúc">
              {doc.updated_at ? new Date(doc.updated_at).toLocaleString('vi-VN') : '-'}
            </Row>
          </div>
        ) : (
          <div className="text-muted-foreground py-8 text-center">Đang tải dữ liệu...</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
