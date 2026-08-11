import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NAV_ITEMS } from '../navigation/navItems';

// ✅ Harus named export (bukan export default)
export function MobileNav() {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t('nav.ariaLabel')}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface md:hidden"
    >
      <div className="grid grid-cols-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50 ${
                isActive ? 'text-primary' : 'text-muted'
              }`
            }
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}