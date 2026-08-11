import { LayoutDashboard, ListTodo, Settings, Tags, type LucideIcon } from 'lucide-react';

export interface NavItem {
  path: string;
  labelKey: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard, end: true },
  { path: '/tasks', labelKey: 'nav.tasks', icon: ListTodo },
  { path: '/categories', labelKey: 'nav.categories', icon: Tags },
  { path: '/settings', labelKey: 'nav.settings', icon: Settings },
];