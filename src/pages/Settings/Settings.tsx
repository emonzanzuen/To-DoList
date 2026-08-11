import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useTheme } from '../../context/ThemeContext';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import { STORAGE_KEYS, type Language } from '../../constants';
import { writeStorage } from '../../utils/storage';

function OptionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-line bg-background text-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { deleteAll } = useTasks();
  const { showToast } = useToast();
  const entranceRef = usePageEntrance();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const changeLanguage = (language: Language) => {
    void i18n.changeLanguage(language);
    writeStorage(STORAGE_KEYS.LANGUAGE, language); // persistent: app_language
    document.documentElement.lang = language;
    showToast(
      t('toast.languageChanged', { language: language === 'id' ? 'Indonesia' : 'English' }),
      'info',
    );
  };

  const handleDeleteAll = () => {
    deleteAll();
    setConfirmOpen(false);
    showToast(t('toast.allDataDeleted'), 'success');
  };

  return (
    <div ref={entranceRef} className="space-y-6">
      <div data-animate>
        <h1 className="text-2xl font-bold text-ink">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('settings.subtitle')}</p>
      </div>

      <section data-animate className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-base font-semibold text-ink">{t('settings.language')}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <OptionButton active={i18n.language === 'id'} onClick={() => changeLanguage('id')}>
            🇮🇩 Indonesia
          </OptionButton>
          <OptionButton active={i18n.language === 'en'} onClick={() => changeLanguage('en')}>
            🇬🇧 English
          </OptionButton>
        </div>
      </section>

      <section data-animate className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-base font-semibold text-ink">{t('settings.theme')}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <OptionButton active={theme === 'light'} onClick={() => setTheme('light')}>
            <Sun className="h-4 w-4" aria-hidden="true" />
            {t('settings.themeLight')}
          </OptionButton>
          <OptionButton active={theme === 'dark'} onClick={() => setTheme('dark')}>
            <Moon className="h-4 w-4" aria-hidden="true" />
            {t('settings.themeDark')}
          </OptionButton>
        </div>
      </section>

      <section data-animate className="rounded-2xl border border-danger/30 bg-surface p-5">
        <h2 className="text-base font-semibold text-danger">{t('settings.dangerZone')}</h2>
        <p className="mt-1 text-sm text-muted">{t('settings.dangerDescription')}</p>
        <Button variant="danger" className="mt-4" onClick={() => setConfirmOpen(true)}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {t('settings.deleteAll')}
        </Button>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title={t('settings.deleteAllConfirmTitle')}
        message={t('settings.deleteAllConfirmMessage')}
        onConfirm={handleDeleteAll}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}