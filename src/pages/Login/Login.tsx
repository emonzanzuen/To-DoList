import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import type { User } from '../../types/user';

function UserCard({ user, onSelect }: { user: User; onSelect: (id: string) => void }) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleBadge: Record<string, string> = {
    admin: 'bg-danger/10 text-danger',
    manager: 'bg-warning/10 text-warning',
    member: 'bg-info/10 text-info',
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(user.id)}
      className="group flex w-full items-center gap-4 rounded-2xl border border-line bg-surface p-4 text-left transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${user.avatarColor}`}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
        <p className="truncate text-xs text-muted">{user.email}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${roleBadge[user.role]}`}>
            {user.role}
          </span>
          <span className="text-[10px] text-muted">{user.team}</span>
        </div>
      </div>
    </button>
  );
}

export default function LoginPage() {
  const { t } = useTranslation();
  const { users, login } = useAuth();
  const entranceRef = usePageEntrance();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div ref={entranceRef} className="w-full max-w-md space-y-6">
        <div data-animate className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-ink">{t('auth.title')}</h1>
          <p className="mt-1 text-sm text-muted">{t('auth.subtitle')}</p>
        </div>

        <div data-animate className="space-y-3">
          {users.map((user) => (
            <UserCard key={user.id} user={user} onSelect={login} />
          ))}
        </div>

        <p data-animate className="text-center text-xs text-muted">
          {t('auth.mockNotice')}
        </p>
      </div>
    </div>
  );
}