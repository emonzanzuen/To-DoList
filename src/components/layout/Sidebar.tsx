import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ListChecks, LogOut } from 'lucide-react';
import { NAV_ITEMS } from '../navigation/navItems';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export function Sidebar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface md:flex">
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-line px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
          <ListChecks className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="text-base font-bold text-ink">{t('app.name')}</span>
      </div>

      {/* Navigation */}
      <nav aria-label={t('nav.ariaLabel')} className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-background hover:text-ink'
              }`
            }
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="border-t border-line p-4">
        {user && (
          <div className="mb-3 flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${user.avatarColor}`}
            >
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
              <p className="truncate text-xs text-muted">
                {t(`auth.role.${user.role}`)} · {user.team}
              </p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {t('auth.logout')}
        </Button>
      </div>
    </aside>
  );
}