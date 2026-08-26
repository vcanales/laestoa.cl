export type QuoteSource = {
  translator: string;
  edition: string;
  year: number;
  url: string;
};

export type Quote = {
  id: string;
  text: string;
  author: string;
  work: string;
  locator: string;
  source: QuoteSource;
};

export function sortQuotes(quotes: readonly Quote[]): Quote[] {
  return [...quotes].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export function pickQuoteForDay(
  quotes: readonly Quote[],
  index: number,
): Quote {
  const sorted = sortQuotes(quotes);
  const n = sorted.length;
  const dayIndex = ((index % n) + n) % n;
  return sorted[dayIndex];
}

export function findQuoteById(
  quotes: readonly Quote[],
  id: string,
): Quote | undefined {
  return quotes.find((quote) => quote.id === id);
}

export function formatPlain(quote: Quote): string {
  return `${quote.text}\n\n${quote.author}, ${quote.work} ${quote.locator}\n`;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
