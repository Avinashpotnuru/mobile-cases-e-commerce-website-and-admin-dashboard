export function formatCents(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export interface ChartSegment {
  key: string;
  label: string;
  value: number;
  /** Tailwind color class for the rendered dot / bar / stroke. */
  color: string;
}

function percentOf(segment: ChartSegment, total: number): number {
  return total > 0 ? (segment.value / total) * 100 : 0;
}

export function DonutChart({
  segments,
  size = 168,
  thickness = 16,
  centerLabel,
  centerValue,
}: {
  segments: ChartSegment[];
  size?: number;
  thickness?: number;
  centerLabel: string;
  centerValue: number;
}) {
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const arcs = segments
    .filter((segment) => segment.value > 0)
    .reduce<
      Array<
        ChartSegment & {
          dash: string;
          offset: number;
        }
      >
    >((acc, segment) => {
      const fraction = segment.value / total;
      const startFraction = acc.reduce((sum, arc) => sum + arc.value, 0) / total;
      const dashLength = fraction * circumference;
      return [
        ...acc,
        {
          ...segment,
          dash: `${dashLength} ${circumference - dashLength}`,
          offset: -startFraction * circumference,
        },
      ];
    }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 sm:justify-start">
      <svg
        role="img"
        viewBox={`0 0 ${size} ${size}`}
        className="h-36 w-36 shrink-0 sm:h-40 sm:w-40"
      >
        <title>
          {formatCount(centerValue)} {centerLabel}:{" "}
          {segments
            .map((segment) => `${segment.label} ${Math.round(percentOf(segment, total))}%`)
            .join(", ")}
        </title>
        {arcs.length === 0 ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={thickness}
            className="text-border"
          />
        ) : (
          arcs.map((arc) => (
            <circle
              key={arc.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth={thickness}
              strokeDasharray={arc.dash}
              strokeDashoffset={arc.offset}
              className={arc.color}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          ))
        )}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-foreground font-display text-2xl font-semibold"
        >
          {formatCount(centerValue)}
        </text>
      </svg>

      <ul className="flex min-w-0 flex-1 flex-col gap-2">
        {segments.map((segment) => (
          <li
            key={segment.key}
            className="flex items-center gap-2.5 text-sm text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${segment.color}`}
            />
            <span className="font-medium">{segment.label}</span>
            <span className="ml-auto font-semibold tabular-nums text-foreground">
              {formatCount(segment.value)}
            </span>
            <span className="w-10 text-right tabular-nums">
              {Math.round(percentOf(segment, total))}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DistributionBar({
  segments,
}: {
  segments: ChartSegment[];
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const hasData = total > 0;

  return (
    <div className="flex flex-col gap-4">
      <div
        role="img"
        aria-label={
          hasData
            ? segments
                .map(
                  (segment) =>
                    `${segment.label}: ${formatCount(segment.value)} (${Math.round(
                      percentOf(segment, total),
                    )}%)`,
                )
                .join(", ")
            : "No data"
        }
        className="flex h-2.5 w-full overflow-hidden rounded-full bg-border/60"
      >
        {hasData ? (
          segments
            .filter((segment) => segment.value > 0)
            .map((segment) => (
              <span
                key={segment.key}
                className={`h-full ${segment.color}`}
                style={{ width: `${percentOf(segment, total)}%` }}
              />
            ))
        ) : null}
      </div>

      <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {segments.map((segment) => (
          <li
            key={segment.key}
            className="flex items-center gap-2.5 text-sm text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${segment.color}`}
            />
            <span className="font-medium">{segment.label}</span>
            {hasData ? (
              <span className="ml-auto font-semibold tabular-nums text-foreground">
                {formatCount(segment.value)}
              </span>
            ) : null}
            <span className="w-10 text-right tabular-nums">
              {Math.round(percentOf(segment, total))}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}