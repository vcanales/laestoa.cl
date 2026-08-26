const NON_BROWSER =
  /\b(curl|wget|httpie|httpie-cli|aria2|libcurl|libwww-perl|go-http-client|python-requests|python-urllib|python-httpx|aiohttp|httpx|axios|got\/|node-fetch|undici|postmanruntime|insomnia|okhttp|apache-httpclient|winhttp|powershell|faraday|restsharp|java\/|libwww|fetch libfetch)\b/i;

const KNOWN_BROWSER =
  /\b(firefox\/|fxios\/|chrome\/|crios\/|edg(?:e|a|ios)?\/|opr\/|opera\/|safari\/|version\/\d.*safari\/|samsungbrowser\/|duckduckgo\/|brave\/|vivaldi\/|yabrowser\/)\b/i;

export function isBrowser(request: Request): boolean {
  const ua = request.headers.get("User-Agent") ?? "";
  if (!ua) return false;
  if (NON_BROWSER.test(ua)) return false;
  if (!/^Mozilla\/5\.0\b/i.test(ua)) return false;
  return KNOWN_BROWSER.test(ua);
}
