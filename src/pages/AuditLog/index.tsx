import type { JSX } from 'react'
import { useState, useEffect, useRef } from 'react'
import { useApiQuery, auditLogService } from '@/service'
import type { ApiResponse, AuditLog, AuditLogListData, Pagination } from '@/types/api'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import ToolTableCustom from '@/components/features/ToolTableCustom'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import PageLayout from '@/layout/pageLayout'
import AuditLogDetailDialog from './AuditLogDetailDialog'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

function MethodBadge({ method }: { method: string }) {
  const map: Record<string, string> = {
    GET: 'bg-sky-100 text-sky-700 border-sky-200',
    POST: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    PUT: 'bg-amber-100 text-amber-700 border-amber-200',
    PATCH: 'bg-violet-100 text-violet-700 border-violet-200',
    DELETE: 'bg-red-100 text-red-700 border-red-200',
  }
  const cls = map[method] ?? 'bg-slate-100 text-slate-600 border-slate-200'
  return <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${cls}`}>{method}</span>
}

function StatusBadge({ code }: { code: number }) {
  let cls = 'bg-slate-100 text-slate-600 border-slate-200'
  if (code >= 200 && code < 300) cls = 'bg-emerald-100 text-emerald-700 border-emerald-200'
  else if (code >= 400 && code < 500) cls = 'bg-amber-100 text-amber-700 border-amber-200'
  else if (code >= 500) cls = 'bg-red-100 text-red-700 border-red-200'
  return <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${cls}`}>{code}</span>
}

export default function AuditLogPage(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(20)
  const [searchValue, setSearchValue] = useState<string>('')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')

  const queryParams = {
    page: currentPage,
    limit,
    ...(searchValue && { search: searchValue }),
    ...(methodFilter !== 'all' && { method: methodFilter as HttpMethod }),
    ...(fromDate && { from_date: fromDate }),
    ...(toDate && { to_date: toDate }),
  }

  const dbQuery = useApiQuery(
    ['audit-logs', queryParams],
    () => auditLogService.getAll(queryParams),
    {},
    false,
    false
  )

  const data = (dbQuery.data as ApiResponse<AuditLogListData>)?.data
  const logs = data?.logs ?? []
  const pagination = (data?.pagination ?? {}) as Partial<Pagination>
  const lastTotalPagesRef = useRef<number | null>(null)
  if (pagination?.totalPages) lastTotalPagesRef.current = pagination.totalPages
  const totalPages = pagination?.totalPages ?? lastTotalPagesRef.current ?? 1
  const total = pagination?.total ?? 0

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  // Detail dialog state
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const handleViewDetail = (log: AuditLog) => {
    setSelectedLog(log)
    setDetailDialogOpen(true)
  }

  const handleSearch = (val: string) => {
    setSearchValue(val)
    setCurrentPage(1)
  }

  const handleMethodChange = (val: string) => {
    setMethodFilter(val)
    setCurrentPage(1)
  }

  const handleDateChange = () => {
    setCurrentPage(1)
  }

  return (
    <PageLayout title="Nhật ký hệ thống" description="Theo dõi hoạt động người dùng và hệ thống">
      <ToolTableCustom
        searchValue={searchValue}
        setSearchValue={handleSearch}
        isSearchLoading={dbQuery.isFetching}
        total={total}
        filter={
          <div className="flex flex-wrap items-center gap-2">
            {/* Method filter */}
            <Select value={methodFilter} onValueChange={handleMethodChange}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>

            {/* From date */}
            <Input
              type="date"
              className="h-9 w-40"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value)
                handleDateChange()
              }}
              placeholder="Từ ngày"
            />

            {/* To date */}
            <Input
              type="date"
              className="h-9 w-40"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value)
                handleDateChange()
              }}
              placeholder="Đến ngày"
            />

            {/* Rows per page */}
            <Select
              value={String(limit)}
              onValueChange={(v) => {
                setLimit(Number(v))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="h-9 w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">ID</TableHead>
              <TableHead className="w-44">Người dùng</TableHead>
              <TableHead className="w-40">Hành động</TableHead>
              <TableHead className="w-24">Phương thức</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead className="w-24">Mã TT</TableHead>
              <TableHead className="w-28">Thời gian PH</TableHead>
              <TableHead className="w-36">IP</TableHead>
              <TableHead className="w-40">Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dbQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-muted-foreground py-8 text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-muted-foreground py-8 text-center">
                  Không có bản ghi nào.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow
                  key={log.id}
                  className="hover:bg-muted/40 cursor-pointer"
                  onClick={() => handleViewDetail(log)}
                >
                  <TableCell className="text-muted-foreground text-xs">{log.id}</TableCell>
                  <TableCell>
                    {log.user ? (
                      <div>
                        <p className="text-sm leading-tight font-medium">{log.user.full_name}</p>
                        <p className="text-muted-foreground text-xs">{log.user.username}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">Khách</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <MethodBadge method={log.method} />
                  </TableCell>
                  <TableCell
                    className="max-w-[200px] truncate font-mono text-xs"
                    title={log.endpoint}
                  >
                    {log.endpoint}
                  </TableCell>
                  <TableCell>
                    <StatusBadge code={log.status_code} />
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.response_time_ms !== undefined ? `${log.response_time_ms} ms` : '-'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.ip_address || '-'}</TableCell>
                  <TableCell className="text-xs">
                    {new Date(log.created_at).toLocaleString('vi-VN')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ToolTableCustom>

      <AuditLogDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        log={selectedLog}
      />
    </PageLayout>
  )
}
