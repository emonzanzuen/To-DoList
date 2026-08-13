interface SimpleChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
}

export function SimpleChart({ data, title }: SimpleChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  let cumulativePercent = 0;
  const segments = data.map((d) => {
    const percent = (d.value / total) * 100;
    const startAngle = (cumulativePercent / 100) * 360;
    cumulativePercent += percent;
    const endAngle = (cumulativePercent / 100) * 360;
    return { ...d, percent, startAngle, endAngle };
  });

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
    const s = polarToCartesian(cx, cy, r, end);
    const e = polarToCartesian(cx, cy, r, start);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 0 ${e.x} ${e.y} Z`;
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold text-ink">{title}</h3>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 200 200" className="h-32 w-32 shrink-0">
          {segments.map((seg, i) => (
            <path
              key={i}
              d={describeArc(100, 100, 90, seg.startAngle, seg.endAngle)}
              fill={seg.color}
              stroke="var(--color-surface)"
              strokeWidth="2"
            />
          ))}
          <circle cx="100" cy="100" r="50" fill="var(--color-surface)" />
          <text x="100" y="95" textAnchor="middle" className="fill-ink text-2xl font-bold" fontSize="28">
            {total}
          </text>
          <text x="100" y="115" textAnchor="middle" className="fill-muted text-xs" fontSize="12">
            Total
          </text>
        </svg>
        <div className="flex-1 space-y-2">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="text-ink">{seg.label}</span>
              </div>
              <span className="font-medium text-muted">{seg.value} ({Math.round(seg.percent)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}