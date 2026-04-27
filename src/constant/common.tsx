import {
  LayoutDashboard,
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
    icon: <Tag />,
    name: 'Danh mục',
    path: '/categories',
  },
  {
    icon: <Map />,
    name: 'Lớp bản đồ',
    path: '/map-layers',
    subItems: [
      { name: 'Quản lý lớp dữ liệu', path: '/map-layers' },
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
    icon: <Image />,
    name: 'Ảnh bản đồ',
    path: '/map-images',
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
    icon: <Users />,
    name: 'Người dùng',
    path: '/users',
  },
  {
    icon: <AlertTriangle />,
    name: 'Phản ánh người dân',
    path: '/feedbacks',
  },
  {
    icon: <FileText />,
    name: 'Văn bản',
    path: '/documents',
    subItems: [
      { name: 'Văn bản báo cáo', path: '/documents' },
      // { name: 'Văn bản thống kê', path: '/statistics-documents' },
    ],
  },
  {
    icon: <ClipboardList />,
    name: 'Nhật kí',
    path: '/logs',
    subItems: [
      { name: 'Nhật ký hệ thống', path: '/audit-logs' },
      { name: 'Nhật kí cảnh báo', path: '/cron-alert-logs' },
    ],
  },
  {
    icon: <MessageSquare />,
    name: 'Tài liệu hệ thống',
    path: 'http://103.163.119.247:8881/uploads/dl_hdsd_admin.docx',
  },
]
