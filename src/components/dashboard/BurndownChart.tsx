import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingDown, TrendingUp, Minus, Calendar, Circle, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Task } from '../../types/task';

interface BurndownChartProps {
  tasks: Task[];
  title: string;
}

export function BurndownChart({ tasks, title }: BurndownChartProps) {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
    const points: { date: string; ideal: number; actual: number; completed: number }[] = [];

    dates.forEach((date, i) => {
      const ideal = totalTasks - (totalTasks / dates.length) * (i + 1);
      const completedToday = completedByDate[date] ?? 0;
      remaining -= completedToday;
      points.push({
        date,
        ideal: Math.max(0, Math.round(ideal * 10) / 10),
        actual: Math.max(0, remaining),
        completed: completedToday,
      });
    });

    const lastPoint = points[points.length - 1];
    const diff = lastPoint.actual - lastPoint.ideal;
    let status: 'ahead' | 'on-track' | 'behind' = 'on-track';
    if (diff > totalTasks * 0.1) status = 'behind';
    else if (diff < -totalTasks * 0.1) status = 'ahead';

    return { points, totalTasks, status };
  }, [tasks]);

  if (!chartData || chartData.points.length < 2) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold text-ink">{title}</h3>
        <p className="text-xs text-muted">{t('dashboard.burndownNoData')}</p>
      </div>
    );
  }

  // Chart dimensions
  const width = 480;
  const height = 220;
  const pt = 25;
  const pb = 40;
  const pl = 40;
  const pr = 15;
  const cw = width - pl - pr;
  const ch = height - pt - pb;
  const maxVal = Math.max(chartData.totalTasks, ...chartData.points.map((p) => Math.max(p.ideal, p.actual)));
  const li = chartData.points.length - 1;

  const x = (i: number) => pl + (i / li) * cw;
  const y = (v: number) => pt + ch - (v / maxVal) * ch;

  // Build SVG path strings (no spaces for cross-browser reliability)
  const idealPath = chartData.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.ideal)}`).join(' ');
  const actualPath = chartData.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.actual)}`).join(' ');
  const areaPath = `${actualPath} L${x(li)},${y(0)} L${x(0)},${y(0)} Z`;

  // Status config
  const statusMap = {
    ahead: { icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', label: t('dashboard.statusAhead') },
    'on-track': { icon: Minus, color: 'text-info', bg: 'bg-info/10', label: t('dashboard.statusOnTrack') },
    behind: { icon: TrendingDown, color: 'text-danger', bg: 'bg-danger/10', label: t('dashboard.statusBehind') },
  };
  const st = statusMap[chartData.status];
  const StIcon = st.icon;

  const fmtDate = (d: string) => {
    const dt = new Date(`${d}T00:00:00`);
    return `${dt.getDate()}/${dt.getMonth() + 1}`;
  };

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxVal * f));

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      {/* Header with status badge */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${st.bg} ${st.color}`}>
          <StIcon className="h-3 w-3" />
          {st.label}
        </span>
      </div>

      {/* SVG Chart */}
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full select-none overflow-visible" aria-label={title}>
          {/* Y-axis label */}
          <text x={pl - 6} y={pt - 8} fontSize="8" className="fill-muted" textAnchor="end" fontWeight="600">
            {t('dashboard.tasksRemaining')}
          </text>

          {/* X-axis label */}
          <text x={width - pr} y={height - 4} fontSize="8" className="fill-muted" textAnchor="end" fontWeight="600">
            {t('dashboard.timeline')}
          </text>

          {/* Horizontal grid lines + Y labels */}
          {yTicks.map((val) => (
            <g key={val}>
              <line
                x1={pl} y1={y(val)} x2={width - pr} y2={y(val)}
                className="stroke-line" strokeWidth="0.5"
                strokeDasharray={val === 0 ? 'none' : '3 3'}
              />
              <text x={pl - 6} y={y(val) + 3} fontSize="8" className="fill-muted" textAnchor="end">
                {val}
              </text>
            </g>
          ))}

          {/* X-axis date labels */}
          {chartData.points.map((p, i) => {
            const show = i === 0 || i === li || chartData.points.length <= 7 || i % Math.ceil(chartData.points.length / 5) === 0;
            if (!show) return null;
            return (
              <text key={i} x={x(i)} y={height - pb + 16} fontSize="8" className="fill-muted" textAnchor="middle">
                {fmtDate(p.date)}
              </text>
            );
          })}

          {/* Area fill under actual line */}
          <path d={areaPath} className="fill-primary" opacity="0.08" />

          {/* Ideal line (dashed, muted) */}
          <path d={idealPath} fill="none" className="stroke-muted" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.5" />

          {/* Actual line (solid, primary, 2.5px) */}
          <path d={actualPath} fill="none" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive data points */}
          {chartData.points.map((p, i) => (
            <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
              <circle cx={x(i)} cy={y(p.actual)} r="10" fill="transparent" className="cursor-pointer" />
              <circle
                cx={x(i)} cy={y(p.actual)}
                r={hoveredIndex === i ? 5 : 3}
                className="fill-primary stroke-surface"
                strokeWidth="1.5"
                style={{ transition: 'r 150ms ease' }}
              />
              <circle cx={x(i)} cy={y(p.ideal)} r="2" className="fill-muted" opacity="0.4" />
            </g>
          ))}

          {/* Hover vertical guide */}
          {hoveredIndex !== null && (
            <line
              x1={x(hoveredIndex)} y1={pt}
              x2={x(hoveredIndex)} y2={pt + ch}
              className="stroke-primary" strokeWidth="0.8"
              strokeDasharray="3 2" opacity="0.3"
            />
          )}
        </svg>

        {/* Tooltip */}
        {hoveredIndex !== null && (() => {
          const p = chartData.points[hoveredIndex];
          const diff = p.actual - p.ideal;
          const isRight = hoveredIndex > li / 2;
          return (
            <div
              className="pointer-events-none absolute z-10 rounded-xl border border-line bg-surface px-3 py-2 shadow-lg"
              style={{
                left: `${(hoveredIndex / li) * 100}%`,
                top: '8%',
                transform: isRight ? 'translateX(-110%)' : 'translateX(10%)',
              }}
            >
              <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-ink">
                <Calendar className="h-3 w-3 text-muted" />
                {fmtDate(p.date)}
              </div>
              <div className="space-y-0.5 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <Circle className="h-3 w-3 fill-primary text-primary" />
                  <span className="text-muted">{t('dashboard.actual')}:</span>
                  <span className="font-bold text-ink">{p.actual}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Circle className="h-3 w-3 text-muted opacity-50" />
                  <span className="text-muted">{t('dashboard.ideal')}:</span>
                  <span className="font-medium text-muted">{p.ideal}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  <span className="text-muted">{t('dashboard.completedToday')}:</span>
                  <span className="font-medium text-success">{p.completed}</span>
                </div>
                {Math.abs(diff) > 0.5 && (
                  <div className={`mt-1 flex items-center gap-1 border-t border-line pt-1 text-[10px] font-medium ${diff > 0 ? 'text-danger' : 'text-success'}`}>
                    <AlertTriangle className="h-3 w-3" />
                    {diff > 0 ? `+${diff.toFixed(1)} ${t('dashboard.behindSchedule')}` : `${diff.toFixed(1)} ${t('dashboard.aheadSchedule')}`}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Legend — vertical stacked list */}
      <div className="mt-4 space-y-1.5 border-t border-line pt-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-ink">{t('dashboard.actual')}</span>
          </div>
          <span className="font-medium text-muted">{chartData.points[li].actual}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-muted opacity-50" />
            <span className="text-ink">{t('dashboard.ideal')}</span>
          </div>
          <span className="font-medium text-muted">{chartData.points[li].ideal}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary opacity-[0.08] ring-1 ring-primary/20" />
            <span className="text-ink">{t('dashboard.remainingArea')}</span>
          </div>
          <span className="font-medium text-muted">{t('dashboard.totalTasksWithDeadline', { count: chartData.totalTasks })}</span>
        </div>
      </div>
    </div>
  );
}