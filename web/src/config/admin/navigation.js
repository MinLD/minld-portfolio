import { FolderKanban, LayoutDashboard, Zap } from 'lucide-vue-next'

export const adminNavigation = [
  {
    labelKey: 'admin.dashboard',
    to: '/admin',
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    labelKey: 'admin.projects',
    to: '/admin/projects',
    icon: FolderKanban,
    enabled: true,
  },
  // {
  //   label: 'Categories',
  //   to: '/admin/categories',
  //   icon: Tags,
  //   enabled: false,
  // },
  // {
  //   label: 'Technologies',
  //   to: '/admin/technologies',
  //   icon: Boxes,
  //   enabled: false,
  // },
  {
    labelKey: 'admin.moments',
    to: '/admin/moments',
    icon: Zap,
    enabled: true,
  },
  // {
  //   label: 'Comments',
  //   to: '/admin/comments',
  //   icon: MessageSquareText,
  //   enabled: false,
  // },
]
