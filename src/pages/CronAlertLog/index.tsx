import type { JSX } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import ToolTableCustom from '@/components/features/ToolTableCustom'
import PageLayout from '@/layout/pageLayout'
import { useApiMutation, useApiQuery, cronAlertService } from '@/service'
import { StatusDotBadge } from '@/components/common/StatusDotBadge'
import {
  CRON_ALERT_SCHEDULE_BADGE_CLASS,
  CRON_ALERT_SCHEDULE_DOT_CLASS,
  CRON_ALERT_SCHEDULE_FILTER_OPTIONS,
  CRON_ALERT_SCHEDULE_LABEL,
  CRON_ALERT_STATUS_BADGE_CLASS,
  CRON_ALERT_STATUS_DOT_CLASS,
  CRON_ALERT_STATUS_FILTER_OPTIONS,
  CRON_ALERT_STATUS_LABEL,
} from '@/constant/cronAlertLogsConstant'
import type {
  ApiResponse,
  CronAlertLog,
  CronAlertLogListData,
  CronAlertLogListParams,
  Pagination,
} from '@/types/api'
import { formatDate, formatDateTime } from '@/lib/date'
import CronAlertLogDetailDialog from './CronAlertLogDetailDialog'

const getTodayDateInputValue = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isMainScheduleDate = (dateValue: string) => {
  const parts = dateValue.split('-')
  if (parts.length !== 3) return false

  const day = Number(parts[2])
  return day === 1 || day === 15
}

function StatusBadge({ status }: { status: CronAlertLog['status'] }) {
  return (
    <StatusDotBadge
      label={CRON_ALERT_STATUS_LABEL[status]}
      badgeClass={CRON_ALERT_STATUS_BADGE_CLASS[status]}
      dotClass={CRON_ALERT_STATUS_DOT_CLASS[status]}
    />
  )
}

function ScheduleBadge({ value }: { value: CronAlertLog['schedule_type'] }) {
  return (
    <StatusDotBadge
      label={CRON_ALERT_SCHEDULE_LABEL[value]}
      badgeClass={CRON_ALERT_SCHEDULE_BADGE_CLASS[value]}
      dotClass={CRON_ALERT_SCHEDULE_DOT_CLASS[value]}
    />
  )
}

export default function CronAlertLogPage(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(20)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [scheduleFilter, setScheduleFilter] = useState<string>('all')
  const [testDate, setTestDate] = useState<string>(getTodayDateInputValue)

  const queryParams: CronAlertLogListParams = useMemo(
    () => ({
      page: currentPage,
      limit,
      ...(statusFilter !== 'all' && {
        status: statusFilter as CronAlertLogListParams['status'],
      }),
      ...(scheduleFilter !== 'all' && {
        schedule_type: scheduleFilter as CronAlertLogListParams['schedule_type'],
      }),
    }),
    [currentPage, limit, statusFilter, scheduleFilter]
  )

  const dbQuery = useApiQuery(
    ['cron-alert-logs', queryParams],
    () => cronAlertService.getLogs(queryParams),
    {},
    false,
    false
  )

  const data = (dbQuery.data as ApiResponse<CronAlertLogListData>)?.data
  const logs = data?.logs ?? []
  const pagination = (data?.pagination ?? {}) as Partial<Pagination>

  const lastTotalPagesRef = useRef<number | null>(null)
  if (pagination?.totalPages) lastTotalPagesRef.current = pagination.totalPages

  const totalPages = pagination?.totalPages ?? lastTotalPagesRef.current ?? 1
  const total = pagination?.total ?? 0

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const retryMutation = useApiMutation(
    (id: number) => cronAlertService.retryLog(id),
    {
      onSuccess: () => {
        dbQuery.refetch()
      },
    },
    true
  )

  const testMainMutation = useApiMutation(
    (payload: { scheduledDate: string; jobName?: string }) => cronAlertService.testMain(payload),
    {
      onSuccess: () => {
        dbQuery.refetch()
      },
    },
    true
  )

  const handleRetry = (id: number) => {
    retryMutation.mutate(id)
  }

  const handleTestMain = () => {
    testMainMutation.mutate({ scheduledDate: testDate })
  }

  const handleResetFilters = () => {
    setStatusFilter('all')
    setScheduleFilter('all')
    setCurrentPage(1)
  }

  const hasActiveFilters = statusFilter !== 'all' || scheduleFilter !== 'all'
  const canRunTestMain = isMainScheduleDate(testDate)

  const [selectedLog, setSelectedLog] = useState<CronAlertLog | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const openDetail = (log: CronAlertLog) => {
    setSelectedLog(log)
    setDetailOpen(true)
  }

  return (
    <PageLayout title="Nhật kí cảnh báo" description="Theo dõi cronjob cảnh báo thực vật ">
      <ToolTableCustom
        searchValue=""
        setSearchValue={() => {}}
        isSearchLoading={dbQuery.isFetching}
        total={total}
        filter={
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-9 w-44">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {CRON_ALERT_STATUS_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={scheduleFilter}
                onValueChange={(value) => {
                  setScheduleFilter(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-9 w-40">
                  <SelectValue placeholder="Loại lịch" />
                </SelectTrigger>
                <SelectContent>
                  {CRON_ALERT_SCHEDULE_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(limit)}
                onValueChange={(v) => {
                  setLimit(Number(v))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-9 w-32">
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

            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="h-9 w-40"
              />

              <Button
                type="button"
                variant="outline"
                className="h-9"
                onClick={handleTestMain}
                disabled={!canRunTestMain || testMainMutation.isPending}
                title={
                  !canRunTestMain ? 'Lên lịch thủ công chỉ áp dụng cho ngày 1 hoặc 15' : undefined
                }
              >
                Lên lịch thủ công
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-9"
                onClick={() => dbQuery.refetch()}
                disabled={dbQuery.isFetching}
              >
                Làm mới
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-9"
                onClick={handleResetFilters}
                disabled={!hasActiveFilters}
              >
                Xóa lọc
              </Button>
            </div>
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
              <TableHead className="w-16">ID</TableHead>
              <TableHead className="w-28">Ngày chạy</TableHead>
              <TableHead className="w-24">Loại lịch</TableHead>
              <TableHead className="w-32">Trạng thái</TableHead>
              <TableHead className="w-24">Lần chạy</TableHead>
              <TableHead className="w-24">Retry kỳ hiện tại</TableHead>
              <TableHead className="w-24">Retry kỳ tham chiếu</TableHead>
              <TableHead className="w-28">TV tăng (km2)</TableHead>
              <TableHead className="w-28">TV giảm (km2)</TableHead>
              <TableHead>Lỗi cuối</TableHead>
              <TableHead className="w-36">Cập nhật</TableHead>
              <TableHead className="w-28 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {dbQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={12} className="text-muted-foreground py-8 text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : dbQuery.isError ? (
              <TableRow>
                <TableCell colSpan={12} className="text-destructive py-8 text-center">
                  Không tải được nhật kí cảnh báo.
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-muted-foreground py-8 text-center">
                  Không có bản ghi nào.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const retryDisabled = log.status === 'running' || retryMutation.isPending
                return (
                  <TableRow
                    key={log.id}
                    className="hover:bg-muted/40 cursor-pointer"
                    onClick={() => openDetail(log)}
                  >
                    <TableCell className="text-muted-foreground text-xs">{log.id}</TableCell>
                    <TableCell className="text-sm">{formatDate(log.scheduled_date)}</TableCell>
                    <TableCell>
                      <ScheduleBadge value={log.schedule_type} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={log.status} />
                    </TableCell>
                    <TableCell className="text-sm">{log.attempt_no}</TableCell>
                    <TableCell className="text-sm">{log.period1_retry_count}</TableCell>
                    <TableCell className="text-sm">{log.period2_retry_count}</TableCell>
                    <TableCell className="text-sm">
                      {(log.vegetation?.increaseKm2 ?? 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {(log.vegetation?.decreaseKm2 ?? 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="max-w-70 truncate text-xs" title={log.last_error || ''}>
                      {log.last_error || '-'}
                    </TableCell>
                    <TableCell className="text-xs">{formatDateTime(log.updated_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRetry(log.id)
                        }}
                        disabled={retryDisabled}
                      >
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </ToolTableCustom>

      <CronAlertLogDetailDialog open={detailOpen} onOpenChange={setDetailOpen} log={selectedLog} />
    </PageLayout>
  )
}
