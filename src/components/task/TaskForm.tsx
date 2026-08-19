import { useState, useMemo, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { CATEGORIES, PRIORITIES, REPEAT_INTERVALS } from '../../constants';
import type { RepeatInterval, TaskCategory, TaskFormData, TaskPriority } from '../../types/task';
import { Button } from '../ui/Button';
import { useProjects } from '../../context/ProjectContext';
import { useMilestones } from '../../context/MilestoneContext';
import { useAuth } from '../../context/AuthContext';

interface TaskFormProps {
  initialData?: TaskFormData;
  submitLabel: string;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
}

interface TaskFormState {
  title: string;
  description: string;
  priority: TaskPriority | '';
  category: TaskCategory | '';
  dueDate: string;
  repeat: RepeatInterval;
  projectId: string;
  assigneeIds: string[];
  milestone: string;
  attachmentUrl: string;
  timeSpentHours: number;
}

type FormErrors = Partial<Record<'title' | 'priority' | 'category' | 'dueDate', string>>;

export function TaskForm({ initialData, submitLabel, onSubmit, onCancel }: TaskFormProps) {
  const { t } = useTranslation();
  const { projects } = useProjects();
  const { milestones } = useMilestones();
  const { users } = useAuth();

  const [form, setForm] = useState<TaskFormState>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    priority: initialData?.priority ?? '',
    category: initialData?.category ?? '',
    dueDate: initialData?.dueDate ?? '',
    repeat: initialData?.repeat ?? 'none',
    projectId: initialData?.projectId ?? '',
    assigneeIds: initialData?.assigneeIds ?? [],
    milestone: initialData?.milestone ?? '',
    attachmentUrl: initialData?.attachmentUrl ?? '',
    // Konversi menit ke jam untuk display (1 decimal)
    timeSpentHours: initialData ? Math.round((initialData.timeSpentMinutes / 60) * 10) / 10 : 0,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Get selected project
  const selectedProject = useMemo(
    () => projects.find((p) => p.id === form.projectId),
    [projects, form.projectId],
  );

  // Filter assignees: only project members when project is selected
  const availableAssignees = useMemo(() => {
    if (!selectedProject) return [];
    return users.filter((u) => selectedProject.memberIds.includes(u.id));
  }, [users, selectedProject]);

  // Filter milestones: only milestones linked to selected project
  const filteredMilestones = useMemo(
    () => form.projectId ? milestones.filter((m) => m.projectId === form.projectId) : [],
    [milestones, form.projectId],
  );

  // Reset assignees & milestone when project changes
  const handleProjectChange = (newProjectId: string) => {
    setForm((p) => ({
      ...p,
      projectId: newProjectId,
      assigneeIds: [],
      milestone: '',
    }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!form.title.trim()) next.title = t('validation.titleRequired');
    if (!form.priority) next.priority = t('validation.priorityRequired');
    if (!form.category) next.category = t('validation.categoryRequired');
    if (form.dueDate && Number.isNaN(new Date(`${form.dueDate}T00:00:00`).getTime())) {
      next.dueDate = t('validation.invalidDate');
    }
    return next;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // Konversi jam ke menit saat submit
    const timeSpentMinutes = Math.round(form.timeSpentHours * 60);

    onSubmit({
      title: form.title,
      description: form.description,
      priority: form.priority as TaskPriority,
      category: form.category as TaskCategory,
      dueDate: form.dueDate,
      repeat: form.repeat,
      projectId: form.projectId,
      assigneeIds: form.assigneeIds,
      milestone: form.milestone,
      attachmentUrl: form.attachmentUrl,
      timeSpentMinutes,
    });
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border bg-background px-3 py-2 text-sm text-ink placeholder:text-muted/70 transition-colors focus:outline-none focus:ring-2 ${
      hasError ? 'border-danger focus:ring-danger/40' : 'border-line focus:border-primary focus:ring-primary/40'
    }`;

  const labelClass = 'mb-1.5 block text-sm font-medium text-ink';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="task-title" className={labelClass}>{t('task.title')}</label>
        <input
          id="task-title"
          type="text"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder={t('task.titlePlaceholder')}
          aria-invalid={Boolean(errors.title)}
          className={inputClass(Boolean(errors.title))}
        />
        {errors.title && <p role="alert" className="mt-1 text-xs text-danger">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="task-description" className={labelClass}>{t('task.description')}</label>
        <textarea
          id="task-description"
          rows={3}
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder={t('task.descriptionPlaceholder')}
          className={`${inputClass(false)} resize-none`}
        />
      </div>

      {/* Priority + Category */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="task-priority" className={labelClass}>{t('task.priority')}</label>
          <select
            id="task-priority"
            value={form.priority}
            onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as TaskFormState['priority'] }))}
            aria-invalid={Boolean(errors.priority)}
            className={inputClass(Boolean(errors.priority))}
          >
            <option value="" disabled>{t('common.select')}</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{t(`priority.${p}`)}</option>
            ))}
          </select>
          {errors.priority && <p role="alert" className="mt-1 text-xs text-danger">{errors.priority}</p>}
        </div>

        <div>
          <label htmlFor="task-category" className={labelClass}>{t('task.category')}</label>
          <select
            id="task-category"
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as TaskFormState['category'] }))}
            aria-invalid={Boolean(errors.category)}
            className={inputClass(Boolean(errors.category))}
          >
            <option value="" disabled>{t('common.select')}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{t(`category.${c}`)}</option>
            ))}
          </select>
          {errors.category && <p role="alert" className="mt-1 text-xs text-danger">{errors.category}</p>}
        </div>
      </div>

      {/* Due Date + Repeat */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="task-due-date" className={labelClass}>{t('task.dueDate')}</label>
          <input
            id="task-due-date"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
            aria-invalid={Boolean(errors.dueDate)}
            className={inputClass(Boolean(errors.dueDate))}
          />
          {errors.dueDate && <p role="alert" className="mt-1 text-xs text-danger">{errors.dueDate}</p>}
        </div>

        <div>
          <label htmlFor="task-repeat" className={labelClass}>{t('task.repeat.label')}</label>
          <select
            id="task-repeat"
            value={form.repeat}
            onChange={(e) => setForm((p) => ({ ...p, repeat: e.target.value as RepeatInterval }))}
            className={inputClass(false)}
          >
            {REPEAT_INTERVALS.map((interval) => (
              <option key={interval} value={interval}>{t(`task.repeat.${interval}`)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Project */}
      <div>
        <label htmlFor="task-project" className={labelClass}>{t('task.project')}</label>
        <select
          id="task-project"
          value={form.projectId}
          onChange={(e) => handleProjectChange(e.target.value)}
          className={inputClass(false)}
        >
          <option value="">{t('project.noClient') ? 'Tanpa Project' : 'Tanpa Project'}</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {!form.projectId && (
          <p className="mt-1 text-xs text-muted">{t('task.personalTaskHint')}</p>
        )}
      </div>

      {/* Assignee — Only visible when project is selected */}
      {form.projectId && (
        <div>
          <label className={labelClass}>{t('task.assignee')}</label>
          {availableAssignees.length === 0 ? (
            <div className="rounded-lg border border-line bg-muted/5 px-3 py-3 text-center">
              <p className="text-xs text-muted">{t('task.noMembersInProject')}</p>
            </div>
          ) : (
            <>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-line bg-background p-2 scrollbar-hide">
                {availableAssignees.map((u) => {
                  const isChecked = form.assigneeIds.includes(u.id);
                  return (
                    <label
                      key={u.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-surface ${
                        isChecked ? 'bg-primary/5 text-primary' : 'text-ink'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setForm((p) => ({
                            ...p,
                            assigneeIds: isChecked
                              ? p.assigneeIds.filter((id) => id !== u.id)
                              : [...p.assigneeIds, u.id],
                          }));
                        }}
                        className="h-4 w-4 rounded border-line text-primary focus:ring-primary/40"
                      />
                      <span className="flex-1 truncate">{u.name}</span>
                      <span className="text-xs text-muted">{t(`auth.role.${u.role}`)}</span>
                    </label>
                  );
                })}
              </div>
              {form.assigneeIds.length > 0 && (
                <p className="mt-1 text-xs text-muted">
                  {form.assigneeIds.length} {t('task.assigneeCount')}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Milestone — Only visible when project is selected */}
      {form.projectId && (
        <div>
          <label htmlFor="task-milestone" className={labelClass}>{t('task.milestone')}</label>
          <select
            id="task-milestone"
            value={form.milestone}
            onChange={(e) => setForm((p) => ({ ...p, milestone: e.target.value }))}
            className={inputClass(false)}
            disabled={filteredMilestones.length === 0}
          >
            <option value="">
              {filteredMilestones.length === 0
                ? t('task.noMilestoneAvailable')
                : t('task.selectMilestone')}
            </option>
            {filteredMilestones.map((m) => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
          {filteredMilestones.length === 0 && (
            <p className="mt-1 text-xs text-muted">{t('task.createMilestoneHint')}</p>
          )}
        </div>
      )}

      {/* Time Estimate (Hours) + Attachment */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="task-time" className={labelClass}>
            {t('task.timeEstimate')}
          </label>
          <div className="relative">
            <input
              id="task-time"
              type="number"
              min={0}
              step={0.5}
              value={form.timeSpentHours}
              onChange={(e) => setForm((p) => ({ ...p, timeSpentHours: Number(e.target.value) || 0 }))}
              placeholder="0"
              className={`${inputClass(false)} pr-12`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted">
              {t('task.hours')}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">{t('task.timeEstimateHint')}</p>
        </div>

        <div>
          <label htmlFor="task-attachment" className={labelClass}>{t('task.attachment')}</label>
          <input
            id="task-attachment"
            type="url"
            value={form.attachmentUrl}
            onChange={(e) => setForm((p) => ({ ...p, attachmentUrl: e.target.value }))}
            placeholder={t('task.attachmentPlaceholder')}
            className={inputClass(false)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}