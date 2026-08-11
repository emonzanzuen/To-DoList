import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  iconClass: string;
}

export function StatCard({ icon: Icon, label, value, iconClass }: StatCardProps) {
  return (
    <div data-animate className="rounded-2xl border border-line bg-surface p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}