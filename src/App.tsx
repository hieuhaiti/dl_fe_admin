import { lazy, Suspense, useEffect } from 'react'
import LoadingOverlay from '@/components/common/LoadingOverlay'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { MainLayout } from './layout/mainLayout'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { useAuthStore } from './stores/common/useAuthStore'
import { tokenManager } from './lib/tokenManager'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const NotFoundPage = lazy(() => import('@/pages/Errors/404NotFoundPage'))
const BadRequestPage = lazy(() => import('@/pages/Errors/400BadRequestPage'))
const UnauthorizedPage = lazy(() => import('@/pages/Errors/401UnauthorizedPage'))
const ForbiddenPage = lazy(() => import('@/pages/Errors/403ForbiddenPage'))
const InternalServerErrorPage = lazy(() => import('@/pages/Errors/500InternalServerErrorPage'))
const ServiceUnavailablePage = lazy(() => import('@/pages/Errors/503ServiceUnavailablePage'))

const LoginPage = lazy(() => import('@/pages/Login'))
const UserPage = lazy(() => import('@/pages/User'))
const NewsPage = lazy(() => import('@/pages/News'))
const NewsCommentsPage = lazy(() => import('@/pages/NewsComments'))
const MapImagePage = lazy(() => import('@/pages/MapImage'))
const DocumentPage = lazy(() => import('@/pages/Document'))
const FeedbackPage = lazy(() => import('@/pages/Feedback'))

function App() {
  const location = useLocation()
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <>
      <Suspense fallback={<LoadingOverlay />} key={location.pathname}>
        <Routes location={location}>
          {/* Public – redirect to dashboard if already logged in */}
          <Route
            path="/login"
            element={tokenManager.getAccessToken() ? <Navigate to="/" replace /> : <LoginPage />}
          />
          {/* Error pages – public, no auth required */}
          <Route path="/400" element={<BadRequestPage />} />
          <Route path="/401" element={<UnauthorizedPage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/500" element={<InternalServerErrorPage />} />
          <Route path="/503" element={<ServiceUnavailablePage />} />
          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route
                path="/"
                element={<div className="text-foreground p-6 text-xl font-semibold">Dashboard</div>}
              />
              <Route path="/users" element={<UserPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news-comments" element={<NewsCommentsPage />} />
              <Route path="/map-images" element={<MapImagePage />} />
              <Route path="/documents" element={<DocumentPage />} />
              <Route path="/feedbacks" element={<FeedbackPage />} />
              {/* TODO: add feature routes here */}
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <ToastContainer position="top-right" className="z-9999" autoClose={3000} />
    </>
  )
}

export default App
