// ── Document type ─────────────────────────────────────────────────
export const TYPE_LABEL: Record<string, string> = {
  pdf: 'PDF',
  word: 'Word',
  excel: 'Excel',
}
export const TYPE_CLASS: Record<string, string> = {
  pdf: 'bg-red-50 text-red-700 border-red-200',
  word: 'bg-blue-50 text-blue-700 border-blue-200',
  excel: 'bg-green-50 text-green-700 border-green-200',
}
export const TYPE_DOT: Record<string, string> = {
  pdf: 'bg-red-500',
  word: 'bg-blue-500',
  excel: 'bg-green-500',
}

// ── Document status ───────────────────────────────────────────────
export const STATUS_LABEL: Record<string, string> = {
  active: 'Hiệu lực',
  archived: 'Lưu trữ',
  revoked: 'Thu hồi',
  replaced: 'Đã thay thế',
}
export const STATUS_CLASS: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  archived: 'bg-slate-100 text-slate-500 border-slate-200',
  revoked: 'bg-red-50 text-red-700 border-red-200',
  replaced: 'bg-orange-50 text-orange-700 border-orange-200',
}
export const STATUS_DOT: Record<string, string> = {
  active: 'bg-green-500',
  archived: 'bg-slate-400',
  revoked: 'bg-red-500',
  replaced: 'bg-orange-500',
}
export const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  archived: 'secondary',
  revoked: 'destructive',
  replaced: 'outline',
}
