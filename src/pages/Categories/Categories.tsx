import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookOpen, Boxes, Briefcase, ShoppingBag, User, type LucideIcon } from 'lucide-react';
import { CATEGORIES, CATEGORY_BADGE } from '../../constants';
import { useTasks } from '../../context/TaskContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import type { TaskCategory } from '../../types/task';

const CATEGORY_ICONS: Record<TaskCategory, LucideIcon> = {
  work: Briefcase,
  study: BookOpen,
  personal: User,
  shopping: ShoppingBag,
  other: Boxes,
};

export default function Categories() {
  const { t } = useTranslation();
  const { tasks } = useTasks();
  const navigate = useNavigate();
  const entranceRef = usePageEntrance();

  return (
    <div ref={entranceRef} className="space-y-6">
      <div data-animate>
        <h1 className="text-2xl font-bold text-ink">{t('categories.title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('categories.subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => {
          const inCategory = tasks.filter((task) => task.category === category);
          const pendingCount = inCategory.filter((task) => task.status === 'pending').length;
          const Icon = CATEGORY_ICONS[category];

          return (
            <button
              key={category}
              type="button"
              data-animate
              onClick={() => navigate(`/tasks?category=${category}`)}
              className="group rounded-2xl border border-line bg-surface p-5 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${CATEGORY_BADGE[category]}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <ArrowRight
                  className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                  aria-hidden="true"
                />
              </div>
              <h2 className="mt-4 text-base font-semibold text-ink">{t(`category.${category}`)}</h2>
              <p className="mt-1 text-sm text-muted">
                {t('categories.tasksCount', { count: inCategory.length })} ·{' '}
                {t('categories.pendingCount', { count: pendingCount })}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}