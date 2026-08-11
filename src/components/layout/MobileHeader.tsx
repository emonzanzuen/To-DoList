import { useTranslation } from 'react-i18next';
import { ListChecks } from 'lucide-react';

export function MobileHeader() {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2.5 border-b border-line bg-surface px-4 py-3 md:hidden">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
        <ListChecks className="h-4 w-4" aria-hidden="true" />
      </div>
      <span className="text-sm font-bold text-ink">{t('app.name')}</span>
    </header>
  );
}