import {
  LayoutDashboard,
  Layers,
  Image,
  Tag,
  Newspaper,
  MessageSquare,
  Map,
  Key,
  Users,
  FileText,
  AlertTriangle,
  ClipboardList,
  Search,
} from 'lucide-react'
import type { NavItem } from '@/types/common/index'

export const navConfig: NavItem[] = [
  {
    icon: <LayoutDashboard />,
    name: 'Dashboard',
    path: '/dashboard',
    subpath: '/',
  },
  {
    icon: <Image />,
    name: 'Ảnh bản đồ',
    path: '/map-images',
  },
  {
    icon: <Tag />,
    name: 'Danh mục',
    path: '/categories',
  },
  {
    icon: <Newspaper />,
    name: 'Tin tức',
    path: '/news',
    subItems: [
      { name: 'Tin tức', path: '/news' },
      { name: 'Bình luận', path: '/news-comments' },
    ],
  },
  {
    icon: <Map />,
    name: 'Lớp bản đồ',
    path: '/map-layers',
    subItems: [
      { name: 'Quản lý lớp dữ liệu', path: '/map-layers' },
      { name: 'Lớp mất rừng', path: '/map-layers/lost-forest' },
      { name: 'Nhập GeoJSON', path: '/map-layers/import-geojson' },
      { name: 'Nhập Excel', path: '/map-layers/import-excel' },
    ],
  },
  {
    icon: <Key />,
    name: 'API lớp bản đồ',
    path: '/map-layer-apis',
  },
  {
    icon: <Users />,
    name: 'Người dùng',
    path: '/users',
  },
  {
    icon: <FileText />,
    name: 'Văn bản báo cáo',
    path: '/documents',
  },
  {
    icon: <AlertTriangle />,
    name: 'Phản ánh người dân',
    path: '/feedbacks',
  },
  {
    icon: <ClipboardList />,
    name: 'Nhật ký hệ thống',
    path: '/audit-logs',
  },
  {
    icon: <Search />,
    name: 'Tìm kiếm',
    path: '/search',
  },
  {
    icon: <Layers />,
    name: 'Thống kê truy cập',
    path: '/visitor-statistics',
  },
  {
    icon: <MessageSquare />,
    name: 'Tài liệu hệ thống',
    path: `${import.meta.env.VITE_BASE_URL}/uploads/DocAdmin.pdf`,
  },
]
