import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  EyeSlash,
  User,
  Lock,
  ShieldCheck,
  MapTrifold,
  GlobeHemisphereWest,
  Crosshair,
  MapPin,
} from 'phosphor-react'
import { authService } from '@/service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
        const isAdmin = await fetchProfile()
        if (isAdmin) {
          navigate('/')
        } else {
          setError('Tài khoản không có quyền quản trị (admin).')
        }
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
    <div className="bg-background relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      {/* Background GIS / Map Grid Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--success)/0.16),transparent_50%),radial-gradient(circle_at_bottom_right,hsl(var(--success)/0.08),transparent_52%)]" />
      {/* Lưới kinh vĩ độ (Lat/Lng Grid) */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(hsl(var(--success)/0.16)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--success)/0.16)_1px,transparent_1px)] bg-size-[40px_40px] opacity-60" />
      {/* Vòng radar/tọa độ đồng tâm */}
      <div className="border-success/10 absolute top-1/2 left-1/2 h-200 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-transparent opacity-50" />
      <div className="border-success/20 absolute top-1/2 left-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-transparent opacity-50" />

      {/* Floating Badges (Trang trí góc) */}
      <div className="border-success/30 bg-background/80 absolute top-12 left-[5%] hidden rounded-xl border px-4 py-2 shadow-lg backdrop-blur-md md:flex md:items-center md:gap-3">
        <Crosshair className="text-success h-5 w-5" />
        <div className="flex flex-col">
          <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
            Tọa độ trung tâm
          </span>
          <span className="text-foreground font-mono text-xs">10.7626° N, 106.6601° E</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-12 lg:grid-cols-2">
        {/* LEFT COLUMN: Giao diện đăng nhập */}
        <div className="flex flex-col justify-center">
          <Card className="border-border/80 bg-card/90 w-full max-w-lg rounded-3xl border shadow-2xl backdrop-blur-sm lg:ml-auto">
            <CardContent className="p-6 sm:p-10">
              <div className="mb-8 text-center sm:text-left">
                <span className="bg-success/10 text-success inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase">
                  <ShieldCheck className="h-4 w-4" weight="bold" />
                  Cổng Không Gian
                </span>
                <h2 className="text-foreground mt-4 text-3xl font-bold tracking-tight">
                  Hệ thống GIS
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  Đăng nhập để truy cập nền tảng quản lý dữ liệu không gian, bản đồ số và quy hoạch.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label
                    htmlFor="login"
                    className="text-muted-foreground mb-1.5 block text-sm font-medium"
                  >
                    Tài khoản định danh
                  </label>
                  <div className="focus-within:text-success relative flex items-center transition-all">
                    <User className="text-muted-foreground group-focus-within:text-success absolute left-3.5 h-5 w-5 transition-colors" />
                    <Input
                      id="login"
                      type="text"
                      placeholder="Email hoặc tên đăng nhập"
                      className="text-foreground bg-background/50 h-12 rounded-xl pl-11"
                      autoComplete="username"
                      {...register('login')}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="text-muted-foreground mb-1.5 block text-sm font-medium"
                  >
                    Mật khẩu truy cập
                  </label>
                  <div className="focus-within:text-success relative flex items-center transition-all">
                    <Lock className="text-muted-foreground absolute left-3.5 h-5 w-5" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mật khẩu"
                      className="text-foreground bg-background/50 h-12 rounded-xl px-11"
                      autoComplete="current-password"
                      {...register('password')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-success absolute right-1 h-10 w-10 hover:bg-transparent"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeSlash className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
                    <ShieldCheck className="h-5 w-5 shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="success"
                  disabled={isLoading}
                  className="shadow-success/20 hover:shadow-success/40 mt-4 h-12 w-full rounded-xl text-base font-bold shadow-lg transition-all"
                >
                  {isLoading ? 'Đang xác thực...' : 'Truy cập hệ thống'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Đồ họa trang trí GIS (Ẩn trên mobile, hiện trên màn hình lớn) */}
        <div className="relative hidden flex-col justify-center lg:flex">
          <div className="relative mx-auto aspect-square w-full max-w-md">
            {/* Vòng sáng Glowing */}
            <div className="bg-success/20 absolute inset-0 animate-pulse rounded-full blur-[100px]" />

            {/* Cấu trúc mô phỏng bản đồ 3D / Quả địa cầu */}
            <div className="border-success/30 from-success/10 relative flex h-full w-full items-center justify-center rounded-full border bg-linear-to-br to-transparent p-8 backdrop-blur-sm">
              <GlobeHemisphereWest
                className="text-success/40 h-full w-full drop-shadow-[0_0_30px_hsl(var(--success)/0.45)]"
                weight="thin"
              />

              {/* Các node điểm nổi (Map Pins) */}
              <div className="absolute top-[20%] left-[25%] animate-bounce">
                <MapPin className="text-success h-8 w-8 drop-shadow-md" weight="fill" />
              </div>
              <div
                className="absolute top-[45%] right-[20%] animate-bounce"
                style={{ animationDelay: '0.5s' }}
              >
                <MapPin className="text-success h-6 w-6 drop-shadow-md" weight="fill" />
              </div>
              <div
                className="absolute bottom-[30%] left-[40%] animate-bounce"
                style={{ animationDelay: '1s' }}
              >
                <MapPin className="text-success h-10 w-10 drop-shadow-md" weight="fill" />
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2 text-center">
            <h3 className="text-foreground flex items-center justify-center gap-2 text-2xl font-bold tracking-tight">
              <MapTrifold className="text-success h-6 w-6" />
              Nền Tảng Quản Trị Không Gian
            </h3>
            <p className="text-muted-foreground mx-auto max-w-sm">
              Theo dõi, phân tích và trực quan hóa dữ liệu bản đồ thời gian thực.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
