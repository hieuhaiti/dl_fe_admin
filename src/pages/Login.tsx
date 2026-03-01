import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User, Lock } from 'lucide-react'
import { authService } from '@/service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { z } from 'zod'
import { useAuthStore } from '@/stores/common/useAuthStore'

type FormValues = {
  login: string
  password: string
}

export default function Login() {
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { login: '', password: '' },
  })

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const loginSuccess = useAuthStore((s) => s.loginSuccess)
  const fetchProfile = useAuthStore((s) => s.fetchProfile)

  const loginSchema = z.object({
    login: z.string().min(4, 'Vui lòng nhập email hoặc tên đăng nhập (tối thiểu 4 ký tự).'),
    password: z
      .string()
      .min(8, 'Mật khẩu phải tối thiểu 8 ký tự.')
      .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ in hoa.')
      .regex(/\d/, 'Mật khẩu phải có ít nhất 1 chữ số.')
      .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt.'),
  })

  async function onSubmit(data: FormValues) {
    setError('')
    setIsLoading(true)

    // Trim inputs to remove accidental leading/trailing whitespace
    const payload = {
      login: data.login?.trim?.() ?? '',
      password: data.password?.trim?.() ?? '',
    }

    const validation = loginSchema.safeParse(payload)
    if (!validation.success) {
      const first = validation.error.issues[0]
      setError(first?.message || 'Dữ liệu không hợp lệ.')
      setIsLoading(false)
      return
    }

    try {
      const res = await authService.login(payload)
      const data = res?.data as any

      if (res?.status && res.status >= 200 && res.status < 300 && data?.accessToken) {
        loginSuccess({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          tokenType: data.tokenType,
          expiresIn: data.expiresIn,
          refreshExpiresIn: data.refreshExpiresIn,
        })
        await fetchProfile()
        navigate('/')
      } else {
        const message = (res as any)?.message || 'Đăng nhập thất bại'
        setError(message)
      }
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-6">
      <div className="bg-card border-border shadow-primary/10 w-full max-w-md rounded-2xl border p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h2 className="text-foreground text-2xl font-semibold">Đăng nhập</h2>
          <p className="text-muted-foreground mt-2 text-sm">Vui lòng đăng nhập để tiếp tục.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email/Username Field */}
          <div>
            <label className="text-muted-foreground mb-1 block text-sm font-medium">
              Email hoặc tên đăng nhập
            </label>
            <div className="relative flex items-center">
              <User className="text-muted-foreground absolute left-3 h-5 w-5" />

              {/* Divider dọc */}
              <span className="bg-border absolute left-10 h-6 w-0.5" />

              <Input
                type="text"
                placeholder="Email hoặc tên đăng nhập"
                className="text-foreground pl-12"
                {...register('login')}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-foreground mb-1 block text-sm font-medium">Mật khẩu</label>
            <div className="relative flex items-center">
              <Lock className="text-muted-foreground absolute left-3 h-5 w-5" />

              {/* Divider dọc */}
              <span className="bg-border absolute left-10 h-6 w-0.5" />

              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
                className="text-foreground px-12"
                {...register('password')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground absolute right-2 h-9 w-9"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-destructive text-sm" role="alert">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-lg py-3 font-medium"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>
      </div>
    </div>
  )
}
