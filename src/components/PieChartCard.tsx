import { useState } from 'react';

export interface PieSlice {
  label: string;
  value: number;
  color: string;
}

interface PieChartCardProps {
  title: string;
  subtitle?: string;
  slices: PieSlice[];
  centerValue: string;
  centerLabel: string;
  emptyText?: string;
}

export function PieChartCard({
  title,
  subtitle,
  slices,
  centerValue,
  centerLabel,
  emptyText = 'Belum ada data penilaian.',
}: PieChartCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  const size = 164;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;
  const computedSlices = slices.map((slice) => {
    const pct = total > 0 ? slice.value / total : 0;
    const dashLength = pct * circumference;
    const dashOffset = -cumulativeOffset;
    cumulativeOffset += dashLength;
    return {
      ...slice,
      pct,
      dashLength,
      dashOffset,
    };
  });

  const activeSlice =
    hoveredIndex !== null ? computedSlices[hoveredIndex] : null;

  return (
    <div className="flex flex-col justify-between rounded-[7px] border border-[#dce3eb] bg-white p-4 shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
      <div className="mb-3 border-b border-[#e9eef4] pb-2">
        <h3 className="m-0 text-[14px] font-bold text-[#1d3554]">{title}</h3>
        {subtitle && (
          <p className="m-0 mt-0.5 text-[11px] text-[#718096]">{subtitle}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 py-1">
        {/* Donut / Pie SVG */}
        <div className="relative flex h-[164px] w-[164px] shrink-0 items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90"
            role="img"
            aria-label={title}
          >
            {/* Track ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#edf2f7"
              strokeWidth={strokeWidth}
            />

            {total > 0 &&
              computedSlices.map((s, idx) => {
                if (s.value <= 0) return null;
                const isHovered = hoveredIndex === idx;
                return (
                  <circle
                    key={s.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={`${s.dashLength} ${circumference}`}
                    strokeDashoffset={s.dashOffset}
                    className="cursor-pointer transition-all duration-150"
                    style={{
                      opacity:
                        hoveredIndex === null || isHovered ? 1 : 0.45,
                    }}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
          </svg>

          {/* Center label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <span className="text-[20px] font-extrabold leading-tight text-[#1d3554] tabular-nums">
              {activeSlice
                ? `${(activeSlice.pct * 100).toFixed(0)}%`
                : centerValue}
            </span>
            <span className="mt-0.5 line-clamp-2 text-[10px] font-semibold leading-tight text-[#64748b]">
              {activeSlice ? activeSlice.label : centerLabel}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="min-w-[170px] flex-1 space-y-1.5">
          {total === 0 ? (
            <div className="rounded border border-dashed border-[#cfd9e4] bg-[#f8fafc] px-3 py-3 text-center text-[12px] text-[#718096]">
              {emptyText}
            </div>
          ) : (
            computedSlices.map((s, idx) => {
              const pctText =
                total > 0 ? `${((s.value / total) * 100).toFixed(1)}%` : '0.0%';
              const isHovered = hoveredIndex === idx;
              return (
                <div
                  key={s.label}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`flex cursor-default items-center justify-between gap-2 rounded px-2 py-1 text-[12px] transition-colors ${
                    isHovered ? 'bg-[#f1f6fc]' : 'bg-transparent'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="truncate font-medium text-[#243247]">
                      {s.label}
                    </span>
                  </div>
                  <div className="shrink-0 font-semibold text-[#1d3554] tabular-nums">
                    {s.value}{' '}
                    <span className="text-[11px] font-normal text-[#718096]">
                      ({pctText})
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
