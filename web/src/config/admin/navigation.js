import { Boxes, FolderKanban, LayoutDashboard, MessageSquareText, Tags, Zap } from 'lucide-vue-next'

export const adminNavigation = [
  {
    label: 'Dashboard',
    to: '/admin',
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    label: 'Projects',
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
    label: 'Moments',
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
