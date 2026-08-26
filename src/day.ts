/** Calendar epoch for the daily quote index, in America/Santiago. */
export const QUOTE_EPOCH = "2026-01-01";

const TIME_ZONE = "America/Santiago";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function partsInZone(date: Date): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const bag: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== "literal") bag[part.type] = part.value;
  }
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour: Number(bag.hour),
    minute: Number(bag.minute),
    second: Number(bag.second),
  };
}

/** Gregorian civil day number (proleptic), for date arithmetic. */
export function civilDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

export function santiagoYmd(date: Date = new Date()): string {
  const p = partsInZone(date);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

export function parseYmd(ymd: string): { year: number; month: number; day: number } {
  const [year, month, day] = ymd.split("-").map(Number);
  return { year, month, day };
}

/**
 * Number of calendar days in America/Santiago since QUOTE_EPOCH (that date is 0).
 */
export function dayIndex(date: Date = new Date()): number {
  const today = parseYmd(santiagoYmd(date));
  const epoch = parseYmd(QUOTE_EPOCH);
  return (
    civilDayNumber(today.year, today.month, today.day) -
    civilDayNumber(epoch.year, epoch.month, epoch.day)
  );
}

/** Seconds remaining until the next calendar midnight in America/Santiago. */
export function secondsUntilSantiagoMidnight(date: Date = new Date()): number {
  const p = partsInZone(date);
  const elapsed = p.hour * 3600 + p.minute * 60 + p.second;
  const remaining = 86400 - elapsed;
  return remaining > 0 ? remaining : 86400;
}

export function santiagoMidnightExpires(date: Date = new Date()): string {
  const ttl = secondsUntilSantiagoMidnight(date);
  return new Date(date.getTime() + ttl * 1000).toUTCString();
}
