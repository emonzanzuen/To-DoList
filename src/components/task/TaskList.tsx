import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import type { Task } from '../../types/task';
import { TaskCard } from './TaskCard';
import { prefersReducedMotion } from '../../animations/gsap/motion';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onTogglePin: (id: string) => void; // ← BARU
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskList({ tasks, onToggle, onTogglePin, onEdit, onDelete }: TaskListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const idsKey = tasks.map((task) => task.id).join('|');

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

  return (
    <div ref={containerRef} className="grid gap-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={onToggle}
          onTogglePin={onTogglePin} // ← BARU
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}