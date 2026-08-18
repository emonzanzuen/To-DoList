export type TaskStatus = 'pending' | 'in_progress' | 'waiting_approval' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskCategory = 'work' | 'study' | 'personal' | 'shopping' | 'other';
export type RepeatInterval = 'none' | 'daily' | 'weekly' | 'monthly';
export type ApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type SortOption = 'newest' | 'oldest' | 'dueDate' | 'priority' | 'custom';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  projectId: string | null;
  assigneeIds: string[];
  milestone: string | null;
  dueDate: string | null;
  isPinned: boolean;
  repeat: RepeatInterval;
  nextRepeatAt: string | null;
  canCompleteFrom: string | null;
  recurringParentId: string | null;
  checklist: ChecklistItem[];
  comments: Comment[];
  approvalStatus: ApprovalStatus;
  attachmentUrl: string | null;
  timeSpentMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  category: TaskCategory;
  projectId: string;
  assigneeIds: string[];
  milestone: string;
  dueDate: string;
  repeat: RepeatInterval;
  attachmentUrl: string;
  timeSpentMinutes: number;
}

export type StatusFilter = 'all' | TaskStatus;
export type PriorityFilter = 'all' | TaskPriority;
export type CategoryFilter = 'all' | TaskCategory;

export interface TaskFiltersState {
  search: string;
  status: StatusFilter;
  priority: PriorityFilter;
  category: CategoryFilter;
  sort: SortOption;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  target: string;
  timestamp: string;
}