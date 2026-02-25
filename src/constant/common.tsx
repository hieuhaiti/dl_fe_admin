import { LayoutDashboard, Layers, MapPin, Map, Users, FileText, Navigation } from 'lucide-react'
import type { NavItem } from '@/types/common/index'

export const navConfig: NavItem[] = [
  {
    icon: <LayoutDashboard />,
    name: 'Dashboard',
    path: '/dashboard',
    subpath: '/',
  },
  {
    icon: <Layers />,
    name: 'Quản lý danh mục',
    path: '/category-management',
  },
  {
    icon: <MapPin />,
    name: 'Quản lý điểm du lịch',
    path: '/tourism-point-management',
  },
  {
    icon: <Map />,
    name: 'Quản lý tuyến',
    path: '/tour-management',
  },
  {
    icon: <Map />,
    name: 'Quản lý tuyến (Geojson)',
    path: '/tour-geojson-management',
  },
  {
    icon: <MapPin />,
    name: 'Quản lý điểm dừng tuyến',
    path: '/tour-stop-management',
  },
  {
    icon: <Users />,
    name: 'Quản lý người dùng',
    path: '/user-management',
  },
  {
    icon: <FileText />,
    name: 'Tài liệu hướng dẫn sử dụng',
    path: `${import.meta.env.VITE_BASE_URL}/uploads/DocAdmin.pdf`,
  },
]
