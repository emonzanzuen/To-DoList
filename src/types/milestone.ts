export type MilestoneStatus = 'pending' | 'in_progress' | 'completed';

export interface Milestone {
  id: string;
  name: string;
  description: string;
  projectId: string | null;
  dueDate: string | null;
  status: MilestoneStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneFormData {
  name: string;
  description: string;
  projectId: string;
  dueDate: string;
  status: MilestoneStatus;
}