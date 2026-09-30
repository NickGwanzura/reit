const DAY = 24 * 60 * 60 * 1000;
const MAX_RANGE_DAYS = 366;

export type LeadReportRange = { from: string; to: string; start: Date; endExclusive: Date };

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const civil = new Date(`${value}T00:00:00.000Z`);
  if (civil.toISOString().slice(0, 10) !== value) return null;
  // Date inputs represent Harare calendar days, not UTC calendar days.
  return new Date(`${value}T00:00:00.000+02:00`);
}

function harareToday(now: Date) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Africa/Harare",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return dateKey(Number(value.year), Number(value.month), Number(value.day));
}

export function resolveReportRange(fromValue?: string, toValue?: string, now = new Date()): LeadReportRange {
  const todayKey = harareToday(now);
  const todayCivil = new Date(`${todayKey}T00:00:00.000Z`);
  const firstMonth = new Date(Date.UTC(todayCivil.getUTCFullYear(), todayCivil.getUTCMonth() - 5, 1));
  const defaultFrom = dateKey(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth() + 1, firstMonth.getUTCDate());
  const toKey = toValue ?? todayKey;
  const fromKey = fromValue ?? defaultFrom;
  const start = parseDate(fromKey);
  const toStart = parseDate(toKey);
  if (!start || !toStart || fromKey > toKey) throw new Error("Choose a valid date range.");

  const civilFrom = new Date(`${fromKey}T00:00:00.000Z`);
  const civilTo = new Date(`${toKey}T00:00:00.000Z`);
  const dayCount = Math.floor((civilTo.getTime() - civilFrom.getTime()) / DAY) + 1;
  if (dayCount > MAX_RANGE_DAYS) throw new Error("Choose a date range of 366 days or less.");

  civilTo.setUTCDate(civilTo.getUTCDate() + 1);
  const nextDayKey = dateKey(civilTo.getUTCFullYear(), civilTo.getUTCMonth() + 1, civilTo.getUTCDate());
  return { from: fromKey, to: toKey, start, endExclusive: new Date(`${nextDayKey}T00:00:00.000+02:00`) };
}
