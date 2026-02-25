import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useLoadingStore } from '@/stores/common/useLoadingStore'
import { apiClient } from '@/service'

type QueryFn<T> = () => Promise<T>

export function useApiQuery<T = any>(
  key: string | readonly unknown[],
  queryFn: QueryFn<T>,
  options: Omit<Parameters<typeof useQuery>[0], 'queryKey' | 'queryFn'> = {},
  loading = true,
  notification = true
) {
  const navigate = useNavigate()
  const setLoading = useLoadingStore((s: any) => s.setLoading)

  const query = useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn,
    retry: false,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    ...(options as any),
  })

  useEffect(() => {
    if (loading) setLoading(query.isLoading || query.isFetching)
    else setLoading(false)
  }, [query.isLoading, query.isFetching, loading, setLoading])

  useEffect(() => {
    if (notification && query.isSuccess && query.data && (query.data as any).message) {
      const msg = (query.data as any).message
      toast.success(msg)
    }
  }, [notification, query.isSuccess, query.data])

  useEffect(() => {
    if (!query.error) return
    const err: any = query.error
    if (err?.meta?.suppressGlobalError) return

    const status = err?.status || err?.body?.status || err?.body?.statusCode
    const message = err?.body?.message || err?.message
    const errors = err?.body?.errors || err?.errors

    if (Array.isArray(errors) && errors.length) {
      const errorMsg = errors
        .map((e: any) => (typeof e === 'string' ? e : e.message || e))
        .join(', ')
      toast.error(message ? `${message}: ${errorMsg}` : errorMsg)
    } else if (message) {
      toast.error(message)
    }

    if (status === 401) {
      // Clear tokens and go to login
      apiClient.clearTokens()
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      navigate('/login')
    } else if (status === 403) {
      toast.error('Bạn không có quyền truy cập tài nguyên này.')
    } else if (status === 404) navigate('/404')
    else if (status === 500) navigate('/500')
    else if (status === 503) navigate('/503')
    else if (status >= 500) navigate('/500')
  }, [query.error, navigate])

  return query
}

export function useApiMutation<TData = any, TVariables = any>(
  mutationFn: (body: TVariables) => Promise<TData>,
  options: Parameters<typeof useMutation>[0] = {},
  notification = true
) {
  const navigate = useNavigate()
  const setLoading = useLoadingStore((s: any) => s.setLoading)

  const mutation = useMutation({
    mutationFn: mutationFn as any,
    ...options,

    onSuccess: (data, variables, context) => {
      if (notification && (data as any)?.message) {
        toast.success((data as any).message)
      }
      ;(options.onSuccess as any)?.(data as any, variables, context)
    },

    onError: (error: any, variables, context) => {
      const status = error?.status || error?.body?.status || error?.body?.statusCode
      const message = error?.body?.message || error?.message
      const errors = error?.body?.errors || error?.body?.data?.errors || error?.errors

      // Show error messages
      if (Array.isArray(errors) && errors.length) {
        const errorMsg = errors
          .map((e: any) => (typeof e === 'string' ? e : e.message || e))
          .join('\n')
        toast.error(message ? `${message}\n${errorMsg}` : errorMsg, { autoClose: 8000 })
      } else if (message) {
        toast.error(message)
      }

      if (status === 400) {
        ;(options.onError as any)?.(error as any, variables, context)
        return
      }

      if (status === 401) {
        apiClient.clearTokens()
        navigate('/login')
        return
      }

      if (status === 403) navigate('/403')
      else if (status === 404) navigate('/404')
      else if (status >= 500) {
        navigate('/500')
        ;(options.onError as any)?.(error as any, variables, context)
      } else {
        ;(options.onError as any)?.(error as any, variables, context)
      }
    },
  })

  useEffect(() => {
    setLoading((mutation as any).isPending)
  }, [(mutation as any).isPending, setLoading])

  return mutation
}

export function useQueryCache() {
  const qc = useQueryClient()

  const getCached = (key: string | readonly unknown[]) =>
    qc.getQueryData(Array.isArray(key) ? key : [key])
  const setCached = (key: string | readonly unknown[], data: any) =>
    qc.setQueryData(Array.isArray(key) ? key : [key], data)
  const removeQuery = (key: string | readonly unknown[]) =>
    qc.removeQueries({ queryKey: Array.isArray(key) ? key : [key] })

  return { getCached, setCached, removeQuery }
}

export default { useApiQuery, useApiMutation, useQueryCache }
