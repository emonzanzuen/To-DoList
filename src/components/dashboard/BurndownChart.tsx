import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Task } from '../../types/task';

interface BurndownChartProps {
  tasks: Task[];
  title: string;
}

export function BurndownChart({ tasks, title }: BurndownChartProps) {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const completedByDate: Record<string, number> = {};
    const totalByDate: Record<string, number> = {};

    tasks.forEach((task) => {
      if (!task.dueDate) return;
      if (!totalByDate[task.dueDate]) totalByDate[task.dueDate] = 0;
      totalByDate[task.dueDate]++;

      if (task.status === 'completed') {
        if (!completedByDate[task.dueDate]) completedByDate[task.dueDate] = 0;
        completedByDate[task.dueDate]++;
      }
    });

    const dates = Object.keys(totalByDate).sort();
    if (dates.length < 2) return null;

    let remaining = tasks.filter((t) => t.dueDate).length;
    const totalTasks = remaining;
    const points: { date: string; ideal: number; actual: number }[] = [];

    dates.forEach((date, i) => {
      const ideal = totalTasks - (totalTasks / dates.length) * (i + 1);
      remaining -= completedByDate[date] ?? 0;
      points.push({ date, ideal: Math.max(0, ideal), actual: Math.max(0, remaining) });
    });

    return { points, totalTasks };
  }, [tasks]);

  if (!chartData || chartData.points.length < 2) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-5">
        <h3 className="mb-2 text-sm font-semibold text-ink">{title}</h3>
        <p className="text-xs text-muted">{t('dashboard.burndownNoData')}</p>
      </div>
    );
  }

  const width = 400;
  const height = 200;
  const padding = 30;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;
  const maxVal = chartData.totalTasks;
  const lastIndex = chartData.points.length - 1;

  function x(i: number) {
    return padding + (i / lastIndex) * chartW;
  }
  function y(val: number) {
    return padding + chartH - (val / maxVal) * chartH;
  }

  const idealPath = chartData.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.ideal)}`).join(' ');
  const actualPath = chartData.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.actual)}`).join(' ');
  const lastPoint = chartData.points[lastIndex];

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold text-ink">{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" aria-label={title}>
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <line key={frac} x1={padding} y1={y(maxVal * frac)} x2={width - padding} y2={y(maxVal * frac)} stroke="var(--color-line)" strokeWidth="0.5" />
        ))}
        <path d={idealPath} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 3" />
        <path d={actualPath} fill="none" stroke="#4f46e5" strokeWidth="2.5" />
        {chartData.points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.actual)} r="3" fill="#4f46e5" />
        ))}
        <text x={padding} y={height - 5} fontSize="9" fill="var(--color-muted)">{chartData.points[0].date.slice(5)}</text>
        <text x={width - padding} y={height - 5} fontSize="9" fill="var(--color-muted)" textAnchor="end">{lastPoint.date.slice(5)}</text>
        <text x={5} y={padding} fontSize="9" fill="var(--color-muted)">{maxVal}</text>
        <text x={5} y={padding + chartH} fontSize="9" fill="var(--color-muted)">0</text>
      </svg>
      <div className="mt-3 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-[#94a3b8]" />
          {t('dashboard.ideal')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded bg-[#4f46e5]" />
          {t('dashboard.actual')}
        </span>
      </div>
    </div>
  );
}