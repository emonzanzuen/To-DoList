import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ListChecks } from 'lucide-react';
import { NAV_ITEMS } from '../navigation/navItems';

export function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface md:flex">
      <div className="flex items-center gap-2.5 border-b border-line px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
          <ListChecks className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="text-base font-bold text-ink">{t('app.name')}</span>
      </div>

      <nav aria-label={t('nav.ariaLabel')} className="flex-1 space-y-1 px-3 py-4">
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
    </aside>
  );
}