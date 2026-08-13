import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '../ui/Button';
import type { ChecklistItem } from '../../types/task';
import { generateId } from '../../utils/taskUtils';

interface ChecklistEditorProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  readOnly?: boolean;
}

export function ChecklistEditor({ items, onChange, readOnly = false }: ChecklistEditorProps) {
  const { t } = useTranslation();
  const [newItemText, setNewItemText] = useState('');

  const doneCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const addItem = () => {
    const text = newItemText.trim();
    if (!text) return;
    const newItem: ChecklistItem = { id: generateId(), text, done: false };
    onChange([...items, newItem]);
    setNewItemText('');
  };

  const toggleItem = (id: string) => {
    onChange(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{t('checklist.progress', { done: doneCount, total: totalCount })}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="space-y-1.5">
        {items.map((item) => (
          <div
            key={item.id}
            className={`group flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
              item.done ? 'border-success/30 bg-success/5' : 'border-line bg-surface'
            }`}
          >
            {!readOnly && (
              <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted/40" aria-hidden="true" />
            )}
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              disabled={readOnly}
              aria-label={item.done ? t('checklist.uncheck') : t('checklist.check')}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                item.done
                  ? 'border-success bg-success text-white'
                  : 'border-line hover:border-primary'
              }`}
            >
              {item.done && <Check className="h-3 w-3" aria-hidden="true" />}
            </button>
            <span
              className={`min-w-0 flex-1 truncate text-sm ${
                item.done ? 'text-muted line-through' : 'text-ink'
              }`}
            >
              {item.text}
            </span>
            {!readOnly && (
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                aria-label={t('checklist.remove')}
                className="shrink-0 rounded p-1 text-muted opacity-0 transition-all hover:bg-danger/10 hover:text-danger group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/50"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add new item */}
      {!readOnly && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('checklist.addPlaceholder')}
            className="flex-1 rounded-lg border border-line bg-background px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <Button type="button" size="sm" variant="secondary" onClick={addItem} disabled={!newItemText.trim()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}