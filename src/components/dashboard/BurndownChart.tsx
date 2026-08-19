import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
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
  const pt = 20;   // padding top
  const pb = 35;   // padding bottom
  const pl = 35;   // padding left
  const pr = 15;   // padding right
  const cw = width - pl - pr;
  const ch = height - pt - pb;
  const maxVal = Math.max(chartData.totalTasks, ...chartData.points.map((p) => Math.max(p.ideal, p.actual)));
  const li = chartData.points.length - 1;

  const x = (i: number) => pl + (i / li) * cw;
  const y = (v: number) => pt + ch - (v / maxVal) * ch;

  // Paths
  const idealPath = chartData.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.ideal)}`).join(' ');
  const actualPath = chartData.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.actual)}`).join(' ');
  const areaPath = `${actualPath} L ${x(li)} ${y(0)} L ${x(0)} ${y(0)} Z`;

  // Status config — matches badge style dari Settings & Dashboard
  const statusMap = {
    ahead: { icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', label: t('dashboard.statusAhead') },
    'on-track': { icon: Minus, color: 'text-info', bg: 'bg-info/10', label: t('dashboard.statusOnTrack') },
    behind: { icon: TrendingDown, color: 'text-danger', bg: 'bg-danger/10', label: t('dashboard.statusBehind') },
  };
  const st = statusMap[chartData.status];
  const StIcon = st.icon;

  // Date formatter
  const fmtDate = (d: string) => {
    const dt = new Date(`${d}T00:00:00`);
    return `${dt.getDate()}/${dt.getMonth() + 1}`;
  };

  // Y-axis ticks (4 steps)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxVal * f));

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${st.bg} ${st.color}`}>
          <StIcon className="h-3 w-3" />
          {st.label}
        </span>
      </div>

      {/* SVG Chart */}
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full select-none" aria-label={title}>
          {/* Horizontal grid lines + Y labels */}
          {yTicks.map((val) => (
            <g key={val}>
              <line
                x1={pl} y1={y(val)} x2={width - pr} y2={y(val)}
                stroke="var(--color-line)" strokeWidth="0.5"
                strokeDasharray={val === 0 ? 'none' : '3 3'}
              />
              <text x={pl - 6} y={y(val) + 3} fontSize="8" fill="var(--color-muted)" textAnchor="end">
                {val}
              </text>
            </g>
          ))}

          {/* X-axis date labels */}
          {chartData.points.map((p, i) => {
            const show = i === 0 || i === li || chartData.points.length <= 7 || i % Math.ceil(chartData.points.length / 5) === 0;
            if (!show) return null;
            return (
              <text key={i} x={x(i)} y={height - pb + 16} fontSize="8" fill="var(--color-muted)" textAnchor="middle">
                {fmtDate(p.date)}
              </text>
            );
          })}

          {/* Area fill under actual line */}
          <path d={areaPath} fill="var(--color-primary)" opacity="0.06" />

          {/* Ideal line (dashed, muted) */}
          <path d={idealPath} fill="none" stroke="var(--color-muted)" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.5" />

          {/* Actual line (solid, primary) */}
          <path d={actualPath} fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive data points */}
          {chartData.points.map((p, i) => (
            <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
              {/* Hit area */}
              <circle cx={x(i)} cy={y(p.actual)} r="10" fill="transparent" className="cursor-pointer" />
              {/* Actual dot */}
              <circle
                cx={x(i)} cy={y(p.actual)}
                r={hoveredIndex === i ? 4.5 : 2.5}
                fill="var(--color-primary)"
                stroke="var(--color-surface)" strokeWidth="1.5"
                className="transition-all duration-150"
              />
              {/* Ideal dot (tiny, muted) */}
              <circle cx={x(i)} cy={y(p.ideal)} r="1.5" fill="var(--color-muted)" opacity="0.4" />
            </g>
          ))}

          {/* Hover vertical guide */}
          {hoveredIndex !== null && (
            <line
              x1={x(hoveredIndex)} y1={pt}
              x2={x(hoveredIndex)} y2={pt + ch}
              stroke="var(--color-primary)" strokeWidth="0.8"
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
              <p className="mb-1 text-[10px] font-semibold text-ink">{fmtDate(p.date)}</p>
              <div className="space-y-0.5 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-muted">{t('dashboard.actual')}:</span>
                  <span className="font-bold text-ink">{p.actual}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-muted opacity-50" />
                  <span className="text-muted">{t('dashboard.ideal')}:</span>
                  <span className="font-medium text-muted">{p.ideal}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-muted">{t('dashboard.completedToday')}:</span>
                  <span className="font-medium text-success">{p.completed}</span>
                </div>
                {Math.abs(diff) > 0.5 && (
                  <p className={`mt-1 border-t border-line pt-1 text-[10px] font-medium ${diff > 0 ? 'text-danger' : 'text-success'}`}>
                    {diff > 0 ? `+${diff.toFixed(1)} ${t('dashboard.behindSchedule')}` : `${diff.toFixed(1)} ${t('dashboard.aheadSchedule')}`}
                  </p>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Legend — matches SimpleChart legend style */}
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
            <span className="h-2.5 w-2.5 rounded-sm bg-primary opacity-[0.06] ring-1 ring-primary/20" />
            <span className="text-ink">{t('dashboard.remainingArea')}</span>
          </div>
          <span className="font-medium text-muted">{t('dashboard.totalTasksWithDeadline', { count: chartData.totalTasks })}</span>
        </div>
      </div>
    </div>
  );
}