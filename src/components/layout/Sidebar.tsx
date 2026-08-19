import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ListChecks, LogOut, X, ZoomIn } from 'lucide-react';
import { NAV_ITEMS } from '../navigation/navItems';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { readStorage } from '../../utils/storage';

const COMPANY_KEY = 'app_company_profile';

interface CompanyProfile {
  name: string;
  tagline: string;
  logoUrl: string;
}

function loadCompanyProfile(): CompanyProfile {
  const data = readStorage<unknown>(COMPANY_KEY, null);
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    return {
      name: typeof d.name === 'string' ? d.name : '',
      tagline: typeof d.tagline === 'string' ? d.tagline : '',
      logoUrl: typeof d.logoUrl === 'string' ? d.logoUrl : '',
    };
  }
  return { name: '', tagline: '', logoUrl: '' };
}

export function Sidebar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const company = loadCompanyProfile();
  const companyName = company.name || t('app.name');
  const companyTagline = company.tagline || t('app.tagline');
  const hasLogo = !!company.logoUrl;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface md:flex">
        {/* Brand — Fixed top */}
        <div className="shrink-0 border-b border-line px-6 py-5">
          <div className="flex items-center gap-2.5">
            {hasLogo ? (
              <div className="group relative shrink-0">
                <img
                  src={company.logoUrl}
                  alt={companyName}
                  className="h-9 w-9 cursor-zoom-in rounded-xl object-cover transition-transform hover:scale-105"
                  onDoubleClick={() => setPreviewImage(company.logoUrl)}
                  title={t('settings.doubleClickToPreview')}
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 transition-all group-hover:bg-black/30">
                  <ZoomIn className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                <ListChecks className="h-5 w-5" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0">
              <span className="block truncate text-sm font-bold leading-tight text-ink">
                {companyName}
              </span>
              <span className="block truncate text-[10px] font-medium leading-tight text-muted">
                {companyTagline}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation — Independent scroll, excluded from Lenis */}
        <nav
          data-lenis-prevent
          aria-label={t('nav.ariaLabel')}
          className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4 scrollbar-hide"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
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

        {/* User Info + Logout — Fixed bottom */}
        <div className="shrink-0 border-t border-line p-4">
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

      {/* Fullscreen Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-6 text-center text-xs text-white/60">
            {t('settings.clickOutsideToClose')}
          </p>
        </div>
      )}
    </>
  );
}