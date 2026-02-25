import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
const BASE_URL = import.meta.env.VITE_BASE_URL

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
export function formatDateTime(dateString: Date | string): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTimeToHHMM(time: string): string {
  if (!time) return ''
  // If time is in HH:MM:SS format, extract only HH:MM
  return time.substring(0, 5)
}

export function praseLink(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('/')) {
    return `${BASE_URL}${url}`
  } else {
    return `${BASE_URL}/${url}`
  }
}

export const formatVND = (amount: string | number, currency = false): string => {
  if (!amount) return ''
  const numericAmount = typeof amount === 'string' ? parseInt(amount) : amount
  return numericAmount.toLocaleString('vi-VN') + (currency ? ' VND' : '')
}
