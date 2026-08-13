import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ListChecks, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function MobileHeader() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:hidden">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
        </div>
        <span className="text-sm font-bold text-ink">{t('app.name')}</span>
      </div>

      {user && (
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${user.avatarColor}`}
            title={`${user.name} (${t(`auth.role.${user.role}`)})`}
          >
            {initials}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label={t('auth.logout')}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </header>
  );
}