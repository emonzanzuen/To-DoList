import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ListChecks, LogOut, X, ZoomIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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

export function MobileHeader() {
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

  const initials = user
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:hidden">
        {/* Brand */}
        <div className="flex min-w-0 items-center gap-2.5">
          {hasLogo ? (
            <div className="group relative shrink-0">
              <img
                src={company.logoUrl}
                alt={companyName}
                className="h-8 w-8 cursor-zoom-in rounded-lg object-cover transition-transform hover:scale-105"
                onDoubleClick={() => setPreviewImage(company.logoUrl)}
                title={t('settings.doubleClickToPreview')}
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-all group-hover:bg-black/30">
                <ZoomIn className="h-3.5 w-3.5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </div>
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
              <ListChecks className="h-4 w-4" aria-hidden="true" />
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

        {/* User Avatar + Logout */}
        {user && (
          <div className="flex shrink-0 items-center gap-2">
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