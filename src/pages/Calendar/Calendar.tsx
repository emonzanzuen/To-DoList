import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import { PRIORITY_DOT } from '../../constants';
import { TaskDetailModal } from '../../components/task/TaskDetailModal';
import type { Task } from '../../types/task';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const { t } = useTranslation();
  const { tasks } = useTasks();
  const { user } = useAuth();
  const entranceRef = usePageEntrance();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  // Filter tasks berdasarkan role
  const visibleTasks = useMemo(() => {
    if (!user) return [];
    if (isAdminOrManager) return tasks;
    // Member: hanya task yang di-assign ke mereka
    return tasks.filter((task) => task.assigneeIds.includes(user.id));
  }, [tasks, user, isAdminOrManager]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    visibleTasks.forEach((task) => {
      if (task.dueDate) {
        if (!map[task.dueDate]) map[task.dueDate] = [];
        map[task.dueDate].push(task);
      }
    });
    return map;
  }, [visibleTasks]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const monthName = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(currentDate);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div ref={entranceRef} className="space-y-6">
      <div data-animate className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-ink capitalize">{monthName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="secondary" size="sm" onClick={today}>{t('calendar.today')}</Button>
          <Button variant="secondary" size="sm" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div data-animate className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="grid grid-cols-7 border-b border-line">
          {dayNames.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-muted">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-line bg-background/30" />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasksByDate[dateStr] ?? [];
            const isToday = dateStr === todayStr;

            return (
              <div key={dateStr} className={`min-h-[100px] border-b border-r border-line p-1.5 ${isToday ? 'bg-primary/5' : ''}`}>
                <span className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${isToday ? 'bg-primary text-white' : 'text-muted'}`}>
                  {day}
                </span>
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="flex cursor-pointer items-center gap-1 truncate rounded border border-line bg-background px-1 py-0.5 text-[10px] transition-colors hover:border-primary/40 hover:bg-primary/5"
                      onClick={() => setViewingTask(task)}
                    >
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_DOT[task.priority]}`} />
                      <span className={`truncate ${task.status === 'completed' ? 'line-through text-muted' : 'text-ink'}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <p className="text-[10px] text-muted pl-1">+{dayTasks.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal task={viewingTask} onClose={() => setViewingTask(null)} />
    </div>
  );
}