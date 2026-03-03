export function formatDate(value?: string | Date | null, locale = 'vi-VN'): string {
  if (!value) return '-'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString(locale)
}

export function formatDateTime(value?: string | Date | null, locale = 'vi-VN'): string {
  if (!value) return '-'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString(locale)
}

export function formatPeriod(
  period: string | undefined,
  groupBy: 'day' | 'week' | 'month'
): string {
  if (!period) return '-'
  if (groupBy === 'day') return formatDate(period)
  if (groupBy === 'month') {
    const parts = period.split('-')
    if (parts.length === 2) return `${parts[1]}/${parts[0]}`
    return period
  }
  if (groupBy === 'week') {
    const match = period.match(/^(\d{4})-W(\d{1,2})$/)
    if (match) return `Tuần ${match[2]}/${match[1]}`
    return period
  }
  return period
}

