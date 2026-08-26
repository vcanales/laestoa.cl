import { QUOTE_EPOCH, dayIndex, santiagoYmd } from "./day.ts";
import { pickQuoteForDay, sortQuotes } from "./quote.ts";
import { quotes } from "./quotes.ts";

let failed = 0;

function assert(cond: boolean, message: string): void {
  if (!cond) {
    console.error(message);
    failed += 1;
  }
}

const sorted = sortQuotes(quotes);
assert(sorted.length >= 80, `expected 80+ quotes, got ${sorted.length}`);

const ids = new Set(sorted.map((quote) => quote.id));
assert(ids.size === sorted.length, "quote ids must be unique");

for (const quote of sorted) {
  assert(/^[a-z0-9-]+$/.test(quote.id), `unsafe id: ${quote.id}`);
  assert(quote.text.length > 0, `empty text: ${quote.id}`);
  assert(
    quote.author === "Epicteto" ||
      quote.author === "Marco Aurelio" ||
      quote.author === "Séneca",
    `unexpected author: ${quote.author}`,
  );
  assert(Boolean(quote.source.translator), `missing translator: ${quote.id}`);
  assert(Boolean(quote.source.url), `missing url: ${quote.id}`);
}

const noon = (ymd: string) => new Date(`${ymd}T16:00:00.000Z`);

const a = pickQuoteForDay(quotes, dayIndex(noon("2026-03-15")));
const b = pickQuoteForDay(quotes, dayIndex(noon("2026-03-15")));
assert(a.id === b.id, "same Santiago date must yield the same quote");

const later = pickQuoteForDay(quotes, dayIndex(noon("2026-03-16")));
assert(a.id !== later.id, "next Santiago date should usually yield another quote");

const epochZero = dayIndex(noon(QUOTE_EPOCH));
assert(epochZero === 0, `epoch ${QUOTE_EPOCH} should be day index 0, got ${epochZero}`);

const sameCalendar = santiagoYmd(new Date("2026-06-01T12:00:00.000Z"));
const stillSame = santiagoYmd(new Date("2026-06-01T20:00:00.000Z"));
assert(
  sameCalendar === stillSame,
  `Santiago calendar date should be stable across those instants: ${sameCalendar} vs ${stillSame}`,
);

if (failed > 0) {
  process.exit(1);
}

console.log(`quote day index ok (${sorted.length} quotes)`);
