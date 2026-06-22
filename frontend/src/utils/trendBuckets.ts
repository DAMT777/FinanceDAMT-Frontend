import { TransactionDto } from "../types/api";

// Selectable chart windows, ordered as shown in the UI.
export type ChartRange = "1d" | "1w" | "1m" | "3m" | "6m" | "1y";

export const CHART_RANGES: ChartRange[] = ["1d", "1w", "1m", "3m", "6m", "1y"];

// Short labels for the period selector (language-neutral codes).
export const CHART_RANGE_LABELS: Record<ChartRange, string> = {
  "1d": "1D",
  "1w": "1S",
  "1m": "1M",
  "3m": "3M",
  "6m": "6M",
  "1y": "1A",
};

export interface TrendBucket {
  label: string;
  income: number;
  expenses: number;
}

type Unit = "day" | "week" | "month";

// How each range is sliced: unit of each bar and how many bars to show.
const RANGE_CONFIG: Record<ChartRange, { unit: Unit; count: number }> = {
  "1d": { unit: "day", count: 1 },
  "1w": { unit: "day", count: 7 },
  "1m": { unit: "week", count: 4 },
  "3m": { unit: "month", count: 3 },
  "6m": { unit: "month", count: 6 },
  "1y": { unit: "month", count: 12 },
};

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function shortMonth(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { month: "short" }).replace(".", "");
}

function dayLabel(date: Date, locale: string, count: number): string {
  // A single-day window shows the date; a week of days shows weekday names.
  if (count <= 1) return `${date.getDate()} ${shortMonth(date, locale)}`;
  return date.toLocaleDateString(locale, { weekday: "short" }).replace(".", "");
}

/** Earliest date that needs to be fetched to fill the chart for `range`. */
export function rangeStart(range: ChartRange, now: Date = new Date()): Date {
  const { unit, count } = RANGE_CONFIG[range];
  const start = startOfDay(now);
  if (unit === "day") {
    start.setDate(start.getDate() - (count - 1));
  } else if (unit === "week") {
    start.setDate(start.getDate() - (count * 7 - 1));
  } else {
    start.setMonth(start.getMonth() - (count - 1));
    start.setDate(1);
  }
  return start;
}

/**
 * Buckets `transactions` into a fixed series of income/expense totals for the
 * given range. Empty buckets are kept (rendered as zero bars) so the axis stays
 * stable. Built backwards from `now` so the last bucket is always the present.
 */
export function buildTrendBuckets(
  transactions: TransactionDto[],
  range: ChartRange,
  locale: string,
  now: Date = new Date(),
): TrendBucket[] {
  const { unit, count } = RANGE_CONFIG[range];
  const today = startOfDay(now);

  const buckets = Array.from({ length: count }, (_, idx) => {
    // idx 0 = oldest bucket, idx count-1 = most recent.
    const i = count - 1 - idx;
    let start: Date;
    let end: Date;
    let label: string;

    if (unit === "day") {
      start = new Date(today);
      start.setDate(today.getDate() - i);
      end = new Date(start);
      end.setDate(start.getDate() + 1);
      label = dayLabel(start, locale, count);
    } else if (unit === "week") {
      end = new Date(today);
      end.setDate(today.getDate() + 1 - i * 7);
      start = new Date(end);
      start.setDate(end.getDate() - 7);
      label = `${start.getDate()} ${shortMonth(start, locale)}`;
    } else {
      start = new Date(today.getFullYear(), today.getMonth() - i, 1);
      end = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
      label = shortMonth(start, locale);
    }

    return { start, end, label, income: 0, expenses: 0 };
  });

  for (const tx of transactions) {
    const date = new Date(tx.date);
    if (Number.isNaN(date.getTime())) continue;
    const bucket = buckets.find((b) => date >= b.start && date < b.end);
    if (!bucket) continue;
    if (tx.type === "Income") bucket.income += tx.amount;
    else if (tx.type === "Expense") bucket.expenses += tx.amount;
  }

  return buckets.map(({ label, income, expenses }) => ({ label, income, expenses }));
}
