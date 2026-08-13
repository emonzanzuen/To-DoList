import {
  LayoutDashboard,
  ListTodo,
  Tag,
  FolderOpen,
  KanbanSquare,
  CalendarDays,
  Users,
  Building2,
  History,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  path: string;
  labelKey: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard, end: true },
  { path: '/tasks', labelKey: 'nav.tasks', icon: ListTodo },
  { path: '/categories', labelKey: 'nav.categories', icon: Tag },
  { path: '/projects', labelKey: 'nav.projects', icon: FolderOpen },
  { path: '/kanban', labelKey: 'nav.kanban', icon: KanbanSquare },
  { path: '/calendar', labelKey: 'nav.calendar', icon: CalendarDays },
  { path: '/team', labelKey: 'nav.team', icon: Users },
  { path: '/clients', labelKey: 'nav.clients', icon: Building2 },
  { path: '/activity', labelKey: 'nav.activity', icon: History },
  { path: '/settings', labelKey: 'nav.settings', icon: Settings },
];