import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { newsService, useApiQuery } from '@/service'
import type { ApiResponse, NewsData } from '@/types/api'
import { parseLink } from '@/lib/utils'

interface NewsDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  newsId: number | null
}

export default function NewsDetailDialog({ open, onOpenChange, newsId }: NewsDetailDialogProps) {
  const dbQuery = useApiQuery(
    ['news', newsId],
    () => newsService.getById(newsId!),
    { enabled: !!newsId && open, staleTime: 0 },
    false,
    false
  )
  const news = (dbQuery.data as ApiResponse<NewsData>)?.data?.news ?? null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogTitle>Chi tiết tin tức</DialogTitle>
        <DialogDescription>Thông tin chi tiết bài viết đã chọn</DialogDescription>

        {news ? (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">ID:</span>
              <span className="col-span-2">{news.id}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Tiêu đề:</span>
              <span className="col-span-2">{news.title}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Slug:</span>
              <span className="col-span-2 font-mono text-sm">{news.slug}</span>
            </div>
            {news.author_name && (
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Tác giả:</span>
                <span className="col-span-2">{news.author_name}</span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Ngôn ngữ:</span>
              <span className="col-span-2">{news.lang || '-'}</span>
            </div>
            {news.summary && (
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Tóm tắt:</span>
                <span className="col-span-2">{news.summary}</span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Ảnh đại diện:</span>
              <span className="col-span-2">
                {news.thumbnail_url ? (
                  <img
                    src={parseLink(news.thumbnail_url)}
                    alt="Thumbnail"
                    className="h-24 w-40 rounded border object-cover"
                  />
                ) : (
                  '-'
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Trạng thái:</span>
              <span className="col-span-2">
                {news.is_published ? (
                  <Badge variant="default">Đã xuất bản</Badge>
                ) : (
                  <Badge variant="secondary">Bản nháp</Badge>
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Nổi bật:</span>
              <span className="col-span-2">
                {news.is_featured ? (
                  <Badge variant="default">Nổi bật</Badge>
                ) : (
                  <Badge variant="outline">Không</Badge>
                )}
              </span>
            </div>
            {news.published_at && (
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Ngày xuất bản:</span>
                <span className="col-span-2">
                  {new Date(news.published_at).toLocaleString('vi-VN')}
                </span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Lượt xem:</span>
              <span className="col-span-2">{news.view_count}</span>
            </div>
            {news.tags && news.tags.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Tags:</span>
                <div className="col-span-2 flex flex-wrap gap-1">
                  {news.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Nội dung:</span>
              <div
                className="col-span-2 max-h-48 overflow-y-auto rounded border p-2 text-sm"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Ngày tạo:</span>
              <span className="col-span-2">
                {news.created_at ? new Date(news.created_at).toLocaleString('vi-VN') : '-'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Tạo bởi:</span>
              <span className="col-span-2">{news.created_by ?? '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Cập nhật bởi:</span>
              <span className="col-span-2">{news.updated_by ?? '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Cập nhật:</span>
              <span className="col-span-2">
                {news.updated_at ? new Date(news.updated_at).toLocaleString('vi-VN') : '-'}
              </span>
            </div>
          </div>
        ) : (
          <div>Không có dữ liệu</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
