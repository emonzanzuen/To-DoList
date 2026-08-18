import { useLayoutEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import gsap from 'gsap';
import type { Task } from '../../types/task';
import { TaskCard } from './TaskCard';
import { SortableTaskCard } from './SortableTaskCard';
import { prefersReducedMotion } from '../../animations/gsap/motion';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onTogglePin: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onViewDetail?: (task: Task) => void;
  onReorder?: (tasks: Task[]) => void;
  onUpdateStatus?: (id: string, status: Task['status']) => void;
}

export function TaskList({ tasks, onToggle, onTogglePin, onEdit, onDelete, onViewDetail, onReorder, onUpdateStatus }: TaskListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const idsKey = tasks.map((task) => task.id).join('|');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorder) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-task-card]',
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: 0.05 },
      );
    }, containerRef);
    return () => ctx.revert();
  }, [idsKey]);

  // Tanpa drag & drop
  if (!onReorder) {
    return (
      <div ref={containerRef} className="grid gap-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={onToggle}
            onTogglePin={onTogglePin}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetail={onViewDetail}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
      </div>
    );
  }

  // Dengan drag & drop
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div ref={containerRef} className="grid gap-3">
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onToggle={onToggle}
              onTogglePin={onTogglePin}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetail={onViewDetail}
              onUpdateStatus={onUpdateStatus}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}