import { useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { userService, useApiQuery } from '@/service'
import type { ApiResponse } from '@/types/api'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

const userSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập tối thiểu 3 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').optional().or(z.literal('')),
  full_name: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address_detail: z.string().optional().or(z.literal('')),
  role_id: z.number().min(1, 'Vai trò là bắt buộc'),
})

type UserFormData = z.infer<typeof userSchema>

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: number | null
  onSubmit: (data: any) => void
  isLoading?: boolean
}

export default function UserFormDialog({
  open,
  onOpenChange,
  userId,
  onSubmit,
  isLoading = false,
}: UserFormDialogProps) {
  const dbQuery = useApiQuery(
    ['user', userId],
    () => userService.getById(userId!),
    { enabled: !!userId && open, staleTime: 0 },
    false,
    false
  )
  const user = (dbQuery.data as ApiResponse<import('@/types/api').User>)?.data ?? null
  const isEdit = !!user
  const roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' },
  ]

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema) as any,
    defaultValues: {
      username: '',
      email: '',
      password: '',
      full_name: '',
      phone: '',
      address_detail: '',
      role_id: 1,
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        password: '',
        full_name: user.full_name || '',
        phone: user.phone || '',
        address_detail: user.address_detail || '',
        role_id: user.role_id || 1,
      })
    } else {
      reset({
        username: '',
        email: '',
        password: '',
        full_name: '',
        phone: '',
        address_detail: '',
        role_id: 1,
      })
    }
  }, [user, reset, open])

  const handleFormSubmit: SubmitHandler<UserFormData> = (data) => {
    const fd = new FormData()
    if (data.username) fd.append('username', data.username)
    if (data.email) fd.append('email', data.email)
    if (data.password?.trim()) fd.append('password', data.password)
    if (data.full_name?.trim()) fd.append('full_name', data.full_name)
    if (data.phone?.trim()) fd.append('phone', data.phone)
    if (data.address_detail?.trim()) fd.append('address_detail', data.address_detail)
    fd.append('role_id', String(data.role_id))
    onSubmit(fd)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>{isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Cập nhật thông tin người dùng' : 'Điền thông tin để tạo người dùng mới'}
        </DialogDescription>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">
                Tên đăng nhập <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                {...register('username')}
                placeholder="Nhập tên đăng nhập"
                disabled={isEdit}
              />
              {errors.username && (
                <p className="text-destructive text-sm">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input id="email" type="email" {...register('email')} placeholder="Nhập email" />
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Mật khẩu {!isEdit && <span className="text-destructive">*</span>}
              {isEdit && (
                <span className="text-muted-foreground text-xs">(Để trống nếu không đổi)</span>
              )}
            </Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder={isEdit ? 'Để trống nếu không đổi' : 'Nhập mật khẩu'}
            />
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Họ và tên</Label>
            <Input id="full_name" {...register('full_name')} placeholder="Nhập họ và tên" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Điện thoại</Label>
              <Input id="phone" {...register('phone')} placeholder="Số điện thoại" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_id">
                Vai trò <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch('role_id')?.toString() || ''}
                onValueChange={(value) => setValue('role_id', parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role: any) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role_id && (
                <p className="text-destructive text-sm">{errors.role_id.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_detail">Địa chỉ chi tiết</Label>
            <Input
              id="address_detail"
              {...register('address_detail')}
              placeholder="Nhập địa chỉ chi tiết"
            />
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
