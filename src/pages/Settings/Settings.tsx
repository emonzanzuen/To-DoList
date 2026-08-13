import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Moon, Sun, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import i18n from '../../i18n';
import type { Language } from '../../constants';

export default function Settings() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { canDeleteAllData } = useAuth();
  const { deleteAll } = useTasks();
  const { showToast } = useToast();
  const entranceRef = usePageEntrance();

  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const currentLang = i18n.language as Language;

  const handleLanguageChange = (lang: Language) => {
    i18n.changeLanguage(lang);
    showToast(t('toast.languageChanged', { language: lang === 'id' ? 'Indonesia' : 'English' }), 'success');
  };

  const handleDeleteAll = () => {
    deleteAll();
    setDeleteAllOpen(false);
    showToast(t('toast.allDataDeleted'), 'success');
  };

  return (
    <div ref={entranceRef} className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div data-animate>
        <h1 className="text-2xl font-bold text-ink">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('settings.subtitle')}</p>
      </div>

      {/* Language Setting */}
      <section data-animate className="rounded-2xl border border-line bg-surface p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Globe className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink">{t('settings.language')}</h2>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant={currentLang === 'id' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleLanguageChange('id')}
          >
            🇮🇩 Indonesia
          </Button>
          <Button
            variant={currentLang === 'en' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleLanguageChange('en')}
          >
            🇬🇧 English
          </Button>
        </div>
      </section>

      {/* Theme Setting */}
      <section data-animate className="rounded-2xl border border-line bg-surface p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
            {theme === 'dark' ? (
              <Moon className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Sun className="h-5 w-5" aria-hidden="true" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink">{t('settings.theme')}</h2>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant={theme === 'light' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => { if (theme !== 'light') toggleTheme(); }}
          >
            <Sun className="h-4 w-4" aria-hidden="true" />
            {t('settings.themeLight')}
          </Button>
          <Button
            variant={theme === 'dark' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => { if (theme !== 'dark') toggleTheme(); }}
          >
            <Moon className="h-4 w-4" aria-hidden="true" />
            {t('settings.themeDark')}
          </Button>
        </div>
      </section>

      {/* Danger Zone — HANYA untuk Admin */}
      {canDeleteAllData && (
        <section data-animate className="rounded-2xl border border-danger/30 bg-danger/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10 text-danger">
              <Trash2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-danger">{t('settings.dangerZone')}</h2>
              <p className="text-xs text-muted">{t('settings.dangerDescription')}</p>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={() => setDeleteAllOpen(true)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {t('settings.deleteAll')}
          </Button>
        </section>
      )}

      {/* Delete All Confirm Dialog */}
      <ConfirmDialog
        open={deleteAllOpen}
        title={t('settings.deleteAllConfirmTitle')}
        message={t('settings.deleteAllConfirmMessage')}
        onConfirm={handleDeleteAll}
        onClose={() => setDeleteAllOpen(false)}
      />
    </div>
  );
}