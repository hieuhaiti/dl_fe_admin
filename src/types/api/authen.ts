import type { User } from './user'

export interface AuthRegisterData {
  user: User
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: string
  refreshExpiresIn: string
}

export interface AuthLoginData {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: string
  refreshExpiresIn: string
}

export interface AuthMeData {
  user: User
}

export interface AuthLogoutData {}

// Đăng ký: ApiResponse<AuthRegisterData>
// Đăng nhập: ApiResponse<AuthLoginData>
// Đăng xuất: ApiResponse<{}>
