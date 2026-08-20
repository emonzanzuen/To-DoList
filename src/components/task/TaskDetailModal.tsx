import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Plus, Trash2, MessageSquare, Paperclip, Clock, ShieldCheck, ShieldX, ShieldAlert, Calendar } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { formatDate } from '../../utils/dateUtils';
import { generateId } from '../../utils/taskUtils';
import { nowISO } from '../../utils/dateUtils';
import type { Task, ChecklistItem, Comment } from '../../types/task';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
}

export function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  const { t, i18n } = useTranslation();
  const { user, users, canApprove } = useAuth();
  const { updateChecklist, updateComments, updateApproval } = useTasks();

  // Local state untuk real-time update tanpa perlu tutup modal
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [approvalStatus, setApprovalStatus] = useState<Task['approvalStatus']>('none');
  const [newChecklist, setNewChecklist] = useState('');
  const [newComment, setNewComment] = useState('');

  // Sync local state saat task berubah
  useEffect(() => {
    if (task) {
      setChecklist(task.checklist);
      setComments(task.comments);
      setApprovalStatus(task.approvalStatus);
    }
  }, [task]);

  if (!task || !user) return null;

  // Cek apakah semua assignee adalah Admin/Manager → tidak perlu approval
  const allAssigneesAreAdminOrManager = task.assigneeIds.length > 0 && task.assigneeIds.every((aid) => {
    const assignee = users.find((u) => u.id === aid);
    return assignee?.role === 'admin' || assignee?.role === 'manager';
  });

  // Task tanpa assignee juga tidak perlu approval
  const needsApproval = !allAssigneesAreAdminOrManager && task.assigneeIds.length > 0;

  // === CHECKLIST HANDLERS (real-time) ===
  const addChecklistItem = () => {
    if (!newChecklist.trim()) return;
    const item: ChecklistItem = { id: generateId(), text: newChecklist.trim(), done: false };
    const updated = [...checklist, item];
    setChecklist(updated);
    updateChecklist(task.id, updated);
    setNewChecklist('');
  };

  const toggleChecklistItem = (itemId: string) => {
    const updated = checklist.map((c) =>
      c.id === itemId ? { ...c, done: !c.done } : c,
    );
    setChecklist(updated);
    updateChecklist(task.id, updated);
  };

  const removeChecklistItem = (itemId: string) => {
    const updated = checklist.filter((c) => c.id !== itemId);
    setChecklist(updated);
    updateChecklist(task.id, updated);
  };

  // === COMMENT HANDLERS (real-time) ===
  const addComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: generateId(),
      userId: user.id,
      text: newComment.trim(),
      createdAt: nowISO(),
    };
    const updated = [...comments, comment];
    setComments(updated);
    updateComments(task.id, updated);
    setNewComment('');
  };

  const deleteComment = (commentId: string) => {
    const updated = comments.filter((c) => c.id !== commentId);
    setComments(updated);
    updateComments(task.id, updated);
  };

  // === APPROVAL HANDLERS ===
  const submitForApproval = () => {
    setApprovalStatus('pending');
    updateApproval(task.id, 'pending');
  };

  const approveTask = () => {
    setApprovalStatus('approved');
    updateApproval(task.id, 'approved');
  };

  const rejectTask = () => {
    setApprovalStatus('rejected');
    updateApproval(task.id, 'rejected');
  };

  const resetApproval = () => {
    setApprovalStatus('none');
    updateApproval(task.id, 'none');
  };

  const checklistDone = checklist.filter((c) => c.done).length;
  const checklistTotal = checklist.length;
  const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;

  const approvalBadge = {
    none: null,
    pending: <Badge className="bg-warning/10 text-warning"><ShieldAlert className="h-3 w-3" /> {t('approval.pending')}</Badge>,
    approved: <Badge className="bg-success/10 text-success"><ShieldCheck className="h-3 w-3" /> {t('approval.approved')}</Badge>,
    rejected: <Badge className="bg-danger/10 text-danger"><ShieldX className="h-3 w-3" /> {t('approval.rejected')}</Badge>,
  };

  const inputClass = 'w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40';

  return (
    <Modal open={!!task} onClose={onClose} title={task.title}>
      <div
        className="space-y-5 max-h-[65vh] overflow-y-auto overscroll-contain pr-1 scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
        data-lenis-prevent
      >
        {/* Description */}
        {task.description && (
          <p className="text-sm text-muted">{task.description}</p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-2 text-xs text-muted">
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {formatDate(task.dueDate, i18n.language)}
            </span>
          )}
          {task.timeSpentMinutes > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {(task.timeSpentMinutes / 60).toFixed(1)}h
            </span>
          )}
          {task.attachmentUrl && (
            <a href={task.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
              <Paperclip className="h-3 w-3" /> {t('task.attachment')}
            </a>
          )}
        </div>

        {/* Approval Section — hanya tampil jika task memerlukan approval */}
        {needsApproval ? (
          <div className="rounded-xl border border-line bg-background p-3 space-y-2">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Approval
            </h3>
            <div className="flex items-center gap-2">
              {approvalBadge[approvalStatus]}
              {approvalStatus === 'none' && (
                <span className="text-xs text-muted">{t('approval.none') || 'Belum diajukan'}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {approvalStatus === 'none' && !canApprove && (
                <Button size="sm" variant="secondary" onClick={submitForApproval}>{t('approval.submit')}</Button>
              )}
              {approvalStatus === 'none' && canApprove && (
                <span className="text-xs text-muted italic">{t('approval.notRequired')}</span>
              )}
              {approvalStatus === 'pending' && canApprove && (
                <>
                  <Button size="sm" onClick={approveTask}>{t('approval.approve')}</Button>
                  <Button size="sm" variant="danger" onClick={rejectTask}>{t('approval.reject')}</Button>
                </>
              )}
              {approvalStatus === 'pending' && !canApprove && (
                <span className="text-xs text-muted italic">{t('approval.pending')}</span>
              )}
              {approvalStatus !== 'none' && canApprove && (
                <Button size="sm" variant="secondary" onClick={resetApproval}>{t('approval.reset')}</Button>
              )}
            </div>
          </div>
        ) : (
          /* Task oleh Admin/Manager — tidak perlu approval */
          <div className="rounded-xl border border-line bg-background p-3">
            <div className="flex items-center gap-2 text-xs text-muted">
              <ShieldCheck className="h-4 w-4 text-success" />
              <span>{t('approval.notRequired')}</span>
            </div>
          </div>
        )}

        {/* Checklist Section */}
        <div className="rounded-xl border border-line bg-background p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">{t('checklist.title')}</h3>
            {checklistTotal > 0 && (
              <span className="text-xs text-muted">{t('checklist.progress', { done: checklistDone, total: checklistTotal })} ({checklistPct}%)</span>
            )}
          </div>
          {checklistTotal > 0 && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-success transition-all" style={{ width: `${checklistPct}%` }} />
            </div>
          )}
          <div className="space-y-1">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface">
                <button
                  type="button"
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                    item.done ? 'border-success bg-success text-white' : 'border-line text-transparent hover:border-primary'
                  }`}
                >
                  <Check className="h-3 w-3" />
                </button>
                <span className={`flex-1 text-sm ${item.done ? 'text-muted line-through' : 'text-ink'}`}>{item.text}</span>
                <button onClick={() => removeChecklistItem(item.id)} className="text-muted hover:text-danger" aria-label={t('checklist.remove')}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className={inputClass}
              value={newChecklist}
              onChange={(e) => setNewChecklist(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
              placeholder={t('checklist.addPlaceholder')}
            />
            <Button size="sm" onClick={addChecklistItem} disabled={!newChecklist.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="rounded-xl border border-line bg-background p-3 space-y-2">
          <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> {t('comment.title')} ({comments.length})
          </h3>
          {comments.length === 0 && (
            <p className="text-xs text-muted">{t('comment.empty')}</p>
          )}
          <div className="space-y-2">
            {comments.map((comment) => {
              const isOwn = comment.userId === user.id;
              return (
                <div key={comment.id} className="rounded-lg bg-surface p-3">
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-ink">{comment.text}</p>
                    {isOwn && (
                      <button onClick={() => deleteComment(comment.id)} className="shrink-0 text-muted hover:text-danger" aria-label={t('comment.delete')}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-[10px] text-muted">{formatDate(comment.createdAt, i18n.language)}</p>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input
              className={inputClass}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addComment()}
              placeholder={t('comment.placeholder')}
            />
            <Button size="sm" onClick={addComment} disabled={!newComment.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}