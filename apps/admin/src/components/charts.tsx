import { compactInr } from "@/lib/format";

/** Area + line chart for a daily series. Pure SVG, server-rendered. */
export function TrendChart({
  data,
  height = 220,
}: {
  data: Array<{ label: string; revenue: number; orders: number }>;
  height?: number;
}) {
  const W = 720;
  const H = height;
  const pad = { l: 48, r: 12, t: 12, b: 26 };
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const nice = Math.ceil(max / 10000) * 10000 || 10000;
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, data.length - 1);
  const y = (v: number) => pad.t + (1 - v / nice) * (H - pad.t - pad.b);
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.revenue).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * nice);
  const maxOrders = Math.max(1, ...data.map((d) => d.orders));
  const bw = Math.max(2, (W - pad.l - pad.r) / data.length - 4);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Revenue trend">
      <defs>
        <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#A6844A" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#A6844A" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="stroke-line" strokeDasharray={t ? "3 4" : undefined} />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="fill-muted text-[10px]">
            {compactInr(t)}
          </text>
        </g>
      ))}
      {data.map((d, i) => (
        <rect
          key={d.label}
          x={x(i) - bw / 2}
          width={bw}
          y={H - pad.b - (d.orders / maxOrders) * (H - pad.t - pad.b) * 0.35}
          height={(d.orders / maxOrders) * (H - pad.t - pad.b) * 0.35}
          className="fill-ink/10"
        >
          <title>{`${d.label}: ${d.orders} orders`}</title>
        </rect>
      ))}
      <path d={area} fill="url(#trendFill)" />
      <path d={line} fill="none" className="stroke-ink" strokeWidth={2.2} strokeLinejoin="round" />
      {data.map((d, i) => (
        <circle key={d.label} cx={x(i)} cy={y(d.revenue)} r={i === data.length - 1 ? 4 : 0} className="fill-ink">
          <title>{`${d.label}: ${compactInr(d.revenue)}`}</title>
        </circle>
      ))}
      {data.map((d, i) =>
        i % Math.ceil(data.length / 7) === 0 || i === data.length - 1 ? (
          <text key={d.label} x={x(i)} y={H - 8} textAnchor="middle" className="fill-muted text-[10px]">
            {d.label}
          </text>
        ) : null
      )}
    </svg>
  );
}

const PALETTE = ["rgb(var(--ink))", "#A6844A", "#8B5CF6", "#F97316", "#0EA5E9", "#E11D48", "#10B981", "#A3A3A3", "#FACC15", "#64748B"];

export function Donut({
  data,
  centerLabel,
  centerValue,
}: {
  data: Array<{ name: string; value: number }>;
  centerLabel: string;
  centerValue: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 70;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <svg viewBox="0 0 200 200" className="h-44 w-44 shrink-0" role="img" aria-label={centerLabel}>
        <circle cx="100" cy="100" r={R} fill="none" className="stroke-line" strokeWidth="26" />
        <g transform="rotate(-90 100 100)">
        {data.map((d, i) => {
          const len = (d.value / total) * C;
          const el = (
            <circle
              key={d.name}
              cx="100"
              cy="100"
              r={R}
              fill="none"
              style={{ stroke: PALETTE[i % PALETTE.length] }}
              strokeWidth="26"
              strokeDasharray={`${Math.max(0, len - 1.5)} ${C}`}
              strokeDashoffset={-offset}
            >
              <title>{`${d.name}: ${Math.round((d.value / total) * 100)}%`}</title>
            </circle>
          );
          offset += len;
          return el;
        })}
        </g>
        <g>
          <text x="100" y="96" textAnchor="middle" className="fill-muted text-[10px] uppercase tracking-widest">
            {centerLabel}
          </text>
          <text x="100" y="118" textAnchor="middle" className="fill-ink font-display text-[22px]">
            {centerValue}
          </text>
        </g>
      </svg>
      <ul className="w-full space-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm ring-1 ring-line" style={{ background: PALETTE[i % PALETTE.length] }} />
              {d.name}
            </span>
            <span className="tabular-nums text-muted">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BarList({ rows }: { rows: Array<{ label: string; value: number; display: string; sub?: string; highlight?: boolean }> }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium">
              {r.label} {r.sub ? <span className="text-xs font-normal text-muted">· {r.sub}</span> : null}
            </span>
            <span className="tabular-nums text-muted">{r.display}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink/5">
            <div className={`h-full rounded-full ${r.highlight ? "bg-gold" : "bg-ink"}`} style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
