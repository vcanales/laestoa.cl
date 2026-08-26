import { isBrowser } from "./client.ts";

function requestWithUa(ua: string): Request {
  return new Request("https://laestoa.cl/", {
    headers: { "User-Agent": ua },
  });
}

const browsers = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:129.0) Gecko/20100101 Firefox/129.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
];

const bots = [
  "",
  "curl/8.7.1",
  "Wget/1.21.4",
  "Mozilla/5.0 Wget/1.21.4",
  "HTTPie/3.2.2",
  "python-requests/2.32.3",
  "python-urllib3/2.2.2",
  "Go-http-client/1.1",
  "Java/21.0.2",
  "axios/1.7.2",
  "got/14.0.0",
  "node-fetch/3.3.2",
  "undici",
  "okhttp/4.12.0",
  "Apache-HttpClient/4.5.14 (Java/17)",
  "Mozilla/5.0",
  "bot",
];

let failed = 0;

for (const ua of browsers) {
  if (!isBrowser(requestWithUa(ua))) {
    console.error("expected browser:", ua);
    failed += 1;
  }
}

for (const ua of bots) {
  if (isBrowser(requestWithUa(ua))) {
    console.error("expected bot:", ua || "(empty)");
    failed += 1;
  }
}

if (failed > 0) {
  process.exit(1);
}

console.log("client classification ok");
