import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { Task } from '../../types/task';
import { TaskCard } from './TaskCard';

interface SortableTaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onTogglePin: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onViewDetail?: (task: Task) => void;
  onUpdateStatus?: (id: string, status: Task['status']) => void;
}

export function SortableTaskCard({ task, onToggle, onTogglePin, onEdit, onDelete, onViewDetail, onUpdateStatus }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="relative">
        <div
          {...listeners}
          className="absolute left-0 top-0 bottom-0 z-10 flex w-8 cursor-grab items-center justify-center active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-muted/40" />
        </div>
        <div className="pl-6">
          <TaskCard
            task={task}
            onToggle={onToggle}
            onTogglePin={onTogglePin}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetail={onViewDetail}
            onUpdateStatus={onUpdateStatus}
          />
        </div>
      </div>
    </div>
  );
}