import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Moon, Sun, Trash2, Building2, MapPin, Phone, Mail, ExternalLink, Upload, User, Save, Lock, X, ZoomIn } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useTheme } from '../../context/ThemeContext';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import { readStorage, writeStorage } from '../../utils/storage';

const COMPANY_KEY = 'app_company_profile';

interface CompanyProfile {
  name: string;
  tagline: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  logoUrl: string;
}

const DEFAULT_COMPANY: CompanyProfile = {
  name: 'Zanzuen Family',
  tagline: 'Business Todo & Task Management',
  address: 'Jl. Sudirman Kav. 52-53, Gedung Zanzuen Tower Lt. 15, Jakarta Selatan 12190, Indonesia',
  email: 'info@zanzuenfamily.com',
  phone: '+62 21 5551 234',
  website: 'https://zanzuenfamily.com',
  logoUrl: '',
};

function loadCompany(): CompanyProfile {
  const data = readStorage<unknown>(COMPANY_KEY, null);
  if (data && typeof data === 'object') return { ...DEFAULT_COMPANY, ...(data as Partial<CompanyProfile>) };
  return DEFAULT_COMPANY;
}

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { deleteAll } = useTasks();
  const { canDeleteAllData, user } = useAuth();
  const entranceRef = usePageEntrance();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [company, setCompany] = useState<CompanyProfile>(() => loadCompany());
  const [companySaved, setCompanySaved] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = canDeleteAllData;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleCompanyChange = (field: keyof CompanyProfile, value: string) => {
    setCompany((prev) => ({ ...prev, [field]: value }));
    setCompanySaved(false);
  };

  const handleSaveCompany = () => {
    writeStorage(COMPANY_KEY, company);
    setCompanySaved(true);
    setTimeout(() => setCompanySaved(false), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCompany((prev) => ({ ...prev, logoUrl: base64 }));
      setCompanySaved(false);
    };
    reader.readAsDataURL(file);
  };

  const inputClass =
    'w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40';

  const readOnlyInputClass =
    'w-full rounded-lg border border-line bg-muted/5 px-3 py-2 text-sm text-ink cursor-not-allowed opacity-70';

  // Generate avatar URL for personal profile preview
  const getAvatarInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div ref={entranceRef} className="space-y-8">
      {/* Header */}
      <div data-animate>
        <h1 className="text-2xl font-bold text-ink">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('settings.subtitle')}</p>
      </div>

      {/* Company Profile Section — Visible to ALL, Editable by Admin only */}
      <section data-animate className="rounded-2xl border border-line bg-surface p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-ink">{t('settings.companyProfile')}</h2>
            <p className="text-xs text-muted">{t('settings.companyProfileDescription')}</p>
          </div>
          {!isAdmin && (
            <div className="flex items-center gap-1 rounded-lg bg-muted/10 px-2 py-1 text-xs text-muted">
              <Lock className="h-3 w-3" />
              {t('settings.viewOnly')}
            </div>
          )}
        </div>

        {/* Logo + Company Identity */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative group">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt="Company Logo"
                className="h-20 w-20 cursor-zoom-in rounded-xl border border-line object-cover transition-transform hover:scale-105"
                onDoubleClick={() => setPreviewImage(company.logoUrl)}
                title={t('settings.doubleClickToPreview')}
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-line bg-background text-muted">
                <Building2 className="h-8 w-8" />
              </div>
            )}
            {/* Zoom hint overlay on hover */}
            {company.logoUrl && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 transition-all group-hover:bg-black/30">
                <ZoomIn className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md transition-colors hover:bg-primary-hover"
                title={t('settings.changeLogo')}
              >
                <Upload className="h-3.5 w-3.5" />
              </button>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-ink">{company.name}</h3>
            <p className="truncate text-sm text-muted">{company.tagline}</p>
          </div>
        </div>

        {/* Company Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">{t('settings.companyName')}</label>
            {isAdmin ? (
              <input className={inputClass} value={company.name} onChange={(e) => handleCompanyChange('name', e.target.value)} />
            ) : (
              <div className={readOnlyInputClass}>{company.name}</div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">{t('settings.tagline')}</label>
            {isAdmin ? (
              <input className={inputClass} value={company.tagline} onChange={(e) => handleCompanyChange('tagline', e.target.value)} />
            ) : (
              <div className={readOnlyInputClass}>{company.tagline}</div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted">{t('settings.address')}</label>
            {isAdmin ? (
              <input className={inputClass} value={company.address} onChange={(e) => handleCompanyChange('address', e.target.value)} />
            ) : (
              <div className={readOnlyInputClass}>{company.address}</div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">{t('settings.contactEmail')}</label>
            {isAdmin ? (
              <input className={inputClass} type="email" value={company.email} onChange={(e) => handleCompanyChange('email', e.target.value)} />
            ) : (
              <div className={readOnlyInputClass}>{company.email}</div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">{t('settings.contactPhone')}</label>
            {isAdmin ? (
              <input className={inputClass} value={company.phone} onChange={(e) => handleCompanyChange('phone', e.target.value)} />
            ) : (
              <div className={readOnlyInputClass}>{company.phone}</div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted">{t('settings.website')}</label>
            {isAdmin ? (
              <input className={inputClass} type="url" value={company.website} onChange={(e) => handleCompanyChange('website', e.target.value)} placeholder="https://" />
            ) : (
              <div className={readOnlyInputClass}>
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                    {company.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : '-'}
              </div>
            )}
          </div>
        </div>

        {/* Save Button — Admin Only */}
        {isAdmin && (
          <div className="mt-5 flex items-center gap-3">
            <Button size="sm" onClick={handleSaveCompany}>
              <Save className="h-4 w-4" />
              {t('settings.saveChanges')}
            </Button>
            {companySaved && (
              <span className="text-xs font-medium text-success">{t('settings.savedSuccessfully')}</span>
            )}
          </div>
        )}
      </section>

      {/* Personal Profile Section — All Roles */}
      {user && (
        <section data-animate className="rounded-2xl border border-line bg-surface p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">{t('settings.personalProfile')}</h2>
              <p className="text-xs text-muted">{t('settings.personalProfileDescription')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`group relative flex h-16 w-16 shrink-0 cursor-zoom-in items-center justify-center rounded-full text-lg font-bold text-white transition-transform hover:scale-105 ${user.avatarColor}`}
              onDoubleClick={() => {
                // For avatar without photo, we show a canvas-generated image
                const canvas = document.createElement('canvas');
                canvas.width = 256;
                canvas.height = 256;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  // Background color from avatarColor class
                  const colorMap: Record<string, string> = {
                    'bg-indigo-500': '#6366f1',
                    'bg-purple-500': '#a855f7',
                    'bg-blue-500': '#3b82f6',
                    'bg-pink-500': '#ec4899',
                    'bg-teal-500': '#14b8a6',
                  };
                  ctx.fillStyle = colorMap[user.avatarColor] || '#6366f1';
                  ctx.fillRect(0, 0, 256, 256);
                  ctx.fillStyle = '#ffffff';
                  ctx.font = 'bold 96px sans-serif';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillText(getAvatarInitials(user.name), 128, 128);
                  setPreviewImage(canvas.toDataURL());
                }
              }}
              title={t('settings.doubleClickToPreview')}
            >
              {getAvatarInitials(user.name)}
              {/* Zoom hint overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-all group-hover:bg-black/30">
                <ZoomIn className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </div>
            <div className="min-w-0 space-y-1">
              <p className="truncate text-base font-semibold text-ink">{user.name}</p>
              <p className="truncate text-sm text-muted">{user.email}</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {t(`auth.role.${user.role}`)}
                </span>
                {user.team && (
                  <span className="text-xs text-muted">{user.team}</span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Language & Theme Section */}
      <section data-animate className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-ink">{t('settings.preferences')}</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink">{t('settings.language')}</label>
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="en">English</option>
              <option value="id">Bahasa Indonesia</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink">{t('settings.theme')}</label>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center justify-between rounded-lg border border-line bg-background px-3 py-2 text-sm text-ink transition-colors hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <span>{theme === 'dark' ? t('settings.themeDark') : t('settings.themeLight')}</span>
              {theme === 'dark' ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-warning" />}
            </button>
          </div>
        </div>
      </section>

      {/* Danger Zone — Hanya Admin */}
      {canDeleteAllData && (
        <section data-animate className="rounded-2xl border border-danger/30 bg-danger/5 p-6">
          <div className="mb-3 flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-danger" />
            <h2 className="text-lg font-semibold text-danger">{t('settings.dangerZone')}</h2>
          </div>
          <p className="mb-4 text-sm text-muted">{t('settings.dangerDescription')}</p>
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            {t('settings.deleteAll')}
          </Button>
        </section>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        title={t('settings.deleteAllConfirmTitle')}
        message={t('settings.deleteAllConfirmMessage')}
        onConfirm={() => {
          deleteAll();
          setDeleteOpen(false);
        }}
        onClose={() => setDeleteOpen(false)}
      />

      {/* Fullscreen Image Preview Modal — WhatsApp Style */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Image */}
          <img
            src={previewImage}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Hint text */}
          <p className="absolute bottom-6 text-center text-xs text-white/60">
            {t('settings.clickOutsideToClose')}
          </p>
        </div>
      )}
    </div>
  );
}