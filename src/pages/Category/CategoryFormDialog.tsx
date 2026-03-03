import { useEffect, useState, useCallback } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { categoryService, useApiQuery } from '@/service'
import type { ApiResponse, Category } from '@/types/api'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from '@/components/ui/file-upload'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { parseLink } from '@/lib/utils'
import { toast } from 'react-toastify'

// Đồng bộ với server: category.validation.js → createCategorySchema / updateCategorySchema
const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Tên danh mục phải có ít nhất 2 ký tự')
    .max(255, 'Tên danh mục không được vượt quá 255 ký tự'),
  description: z
    .string()
    .trim()
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự')
    .optional()
    .or(z.literal('')),
  color: z
    .string()
    .trim()
    .max(20, 'Màu sắc không được vượt quá 20 ký tự')
    .optional()
    .or(z.literal('')),
  is_active: z.boolean(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryId: number | null
  onSubmit: (data: FormData) => void
  isLoading?: boolean
}

export default function CategoryFormDialog({
  open,
  onOpenChange,
  categoryId,
  onSubmit,
  isLoading = false,
}: CategoryFormDialogProps) {
  const dbQuery = useApiQuery(
    ['category', categoryId],
    () => categoryService.getById(categoryId!),
    { enabled: !!categoryId && open, staleTime: 0 },
    false,
    false
  )

  const rawData = (dbQuery.data as ApiResponse<Category | { category: Category }>)?.data
  const category =
    rawData && 'id' in rawData
      ? (rawData as Category)
      : (rawData as { category?: Category })?.category
  const isEdit = !!category
  const [iconFiles, setIconFiles] = useState<File[]>([])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: '',
      description: '',
      color: '',
      is_active: true,
    },
  })

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || '',
        color: category.color || '',
        is_active: category.is_active ?? true,
      })
    } else {
      reset({
        name: '',
        description: '',
        color: '',
        is_active: true,
      })
    }
    setIconFiles([])
  }, [category, reset, open])

  const onIconValidate = useCallback((file: File): string | null => {
    if (!file.type.startsWith('image/')) return 'Chỉ chấp nhận file ảnh'
    if (file.size > 10 * 1024 * 1024) return 'Kích thước file không được quá 10MB'
    return null
  }, [])

  const onIconReject = useCallback((file: File, message: string) => {
    toast.error(
      `${message}: "${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}"`
    )
  }, [])

  const handleFormSubmit: SubmitHandler<CategoryFormValues> = (data) => {
    const fd = new FormData()
    fd.append('name', data.name)
    if (data.description?.trim()) fd.append('description', data.description)
    if (data.color?.trim()) fd.append('color', data.color)
    fd.append('is_active', String(data.is_active))
    if (iconFiles[0]) fd.append('icon_url', iconFiles[0])
    onSubmit(fd)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogTitle>{isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Cập nhật thông tin danh mục' : 'Điền thông tin để tạo danh mục mới'}
        </DialogDescription>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên danh mục <span className="text-destructive">*</span>
            </Label>
            <Input id="name" {...register('name')} placeholder="Nhập tên danh mục" />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Nhập mô tả danh mục"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Màu</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color"
                type="color"
                value={watch('color') || '#2563eb'}
                onChange={(e) => setValue('color', e.target.value)}
                className="h-10 w-14 p-1"
              />
              <Input
                value={watch('color') || ''}
                onChange={(e) => setValue('color', e.target.value)}
                placeholder="#2563eb"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select
              value={watch('is_active') ? 'true' : 'false'}
              onValueChange={(v) => setValue('is_active', v === 'true')}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Đang hoạt động</SelectItem>
                <SelectItem value="false">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Icon danh mục</Label>
            {isEdit && category?.icon_url && iconFiles.length === 0 && (
              <div className="mb-2">
                <img
                  src={parseLink(category.icon_url)}
                  alt="Icon danh mục hiện tại"
                  className="h-20 w-20 rounded border object-cover"
                />
                <p className="text-muted-foreground mt-1 text-xs">Icon hiện tại</p>
              </div>
            )}
            <FileUpload
              value={iconFiles}
              onValueChange={setIconFiles}
              onFileValidate={onIconValidate}
              onFileReject={onIconReject}
              accept="image/*"
              maxFiles={1}
              maxSize={10 * 1024 * 1024}
            >
              <FileUploadDropzone className="border-dashed">
                <div className="flex flex-col items-center gap-1 text-center">
                  <p className="text-sm font-medium">Kéo thả icon vào đây</p>
                  <p className="text-muted-foreground text-xs">hoặc</p>
                  <FileUploadTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      Chọn ảnh
                    </Button>
                  </FileUploadTrigger>
                  <p className="text-muted-foreground text-xs">PNG, JPG, WEBP - Tối đa 10MB</p>
                </div>
              </FileUploadDropzone>
              <FileUploadList>
                {iconFiles.map((file) => (
                  <FileUploadItem key={file.name} value={file}>
                    <FileUploadItemPreview />
                    <FileUploadItemMetadata />
                    <FileUploadItemDelete asChild>
                      <Button type="button" variant="ghost" size="sm">
                        Xóa
                      </Button>
                    </FileUploadItemDelete>
                  </FileUploadItem>
                ))}
              </FileUploadList>
            </FileUpload>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting || isLoading ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
