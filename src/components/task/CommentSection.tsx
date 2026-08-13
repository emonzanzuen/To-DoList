import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import type { Comment } from '../../types/task';
import { generateId } from '../../utils/taskUtils';
import { nowISO } from '../../utils/dateUtils';

interface CommentSectionProps {
  comments: Comment[];
  onChange: (comments: Comment[]) => void;
  readOnly?: boolean;
}

function formatTime(iso: string): string {
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return iso;
  }
}

export function CommentSection({ comments, onChange, readOnly = false }: CommentSectionProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');

  const addComment = () => {
    const text = newComment.trim();
    if (!text || !user) return;
    const comment: Comment = {
      id: generateId(),
      userId: user.id,
      text,
      createdAt: nowISO(),
    };
    onChange([...comments, comment]);
    setNewComment('');
  };

  const removeComment = (id: string) => {
    onChange(comments.filter((c) => c.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addComment();
    }
  };

  // Resolve user name from MOCK_USERS via AuthContext
  const getUserName = (userId: string): string => {
    const found = user?.id === userId ? user : undefined;
    // Fallback: jika bukan current user, tampilkan ID saja
    // Di production, ini akan di-resolve dari UserContext/users list
    return found?.name ?? userId.slice(0, 8);
  };

  const getUserInitials = (userId: string): string => {
    const name = getUserName(userId);
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-3">
      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="space-y-2">
          {comments.map((comment) => {
            const isOwn = user?.id === comment.userId;
            return (
              <div
                key={comment.id}
                className={`group flex gap-3 rounded-xl p-3 ${
                  isOwn ? 'bg-primary/5 ml-6' : 'bg-surface border border-line mr-6'
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/20 text-xs font-bold text-muted">
                  {getUserInitials(comment.userId)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-ink">
                      {getUserName(comment.userId)}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted">
                      {formatTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-ink whitespace-pre-wrap break-words">{comment.text}</p>
                </div>
                {!readOnly && isOwn && (
                  <button
                    type="button"
                    onClick={() => removeComment(comment.id)}
                    aria-label={t('comment.delete')}
                    className="shrink-0 self-start rounded p-1 text-muted opacity-0 transition-all hover:bg-danger/10 hover:text-danger group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-line py-6 text-center">
          <div className="space-y-1">
            <MessageSquare className="mx-auto h-6 w-6 text-muted/40" aria-hidden="true" />
            <p className="text-xs text-muted">{t('comment.empty')}</p>
          </div>
        </div>
      )}

      {/* Add comment input */}
      {!readOnly && user && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('comment.placeholder')}
            className="flex-1 rounded-lg border border-line bg-background px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <Button
            type="button"
            size="sm"
            onClick={addComment}
            disabled={!newComment.trim()}
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}