import type { ReactNode } from 'react';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  variant?: 'default' | 'danger';
  animate?: boolean;
}

export function SettingsSection({
  title,
  description,
  children,
  variant = 'default',
  animate = true,
}: SettingsSectionProps) {
  const borderClass =
    variant === 'danger' ? 'border-danger/30' : 'border-line';

  return (
    <section
      data-animate={animate || undefined}
      className={`rounded-2xl border bg-surface p-5 ${borderClass}`}
    >
      <div className="mb-4">
        <h2
          className={`text-base font-semibold ${
            variant === 'danger' ? 'text-danger' : 'text-ink'
          }`}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}