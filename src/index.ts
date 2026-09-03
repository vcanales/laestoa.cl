import { captureWorkerEvent } from "./analytics";
import { isBrowser } from "./client";
import { dayIndex, secondsUntilSantiagoMidnight, santiagoMidnightExpires, santiagoYmd } from "./day";
import {
  formatFuentesPlain,
  formatPreguntasPlain,
  renderFuentes,
  renderNotFound,
  renderPage,
  renderPreguntas,
} from "./page";
import { findQuoteById, formatPlain, pickQuoteForDay } from "./quote";
import { quotes } from "./quotes";

export type Env = {
  CLI_RATE_LIMIT: RateLimit;
  POSTHOG_PROJECT_TOKEN: string;
  POSTHOG_HOST: string;
};

const RETRY_AFTER_SECONDS = "60";

const PLAIN = {
  "Content-Type": "text/plain; charset=utf-8",
} as const;

const HTML = {
  "Content-Type": "text/html; charset=utf-8",
} as const;

type Route =
  | { kind: "today" }
  | { kind: "permalink"; id: string }
  | { kind: "fuentes" }
  | { kind: "preguntas" }
  | { kind: "missing" };

export default {
  async fetch(request, env, ctx): Promise<Response> {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Método no permitido\n", {
        status: 405,
        headers: {
          ...PLAIN,
          Allow: "GET, HEAD",
          "Cache-Control": "no-store",
        },
      });
    }

    const route = classifyPath(new URL(request.url).pathname);
    const browser = isBrowser(request);
    const response = browser
      ? htmlResponse(request, env, ctx, route)
      : await cliResponse(request, env, ctx, route);

    if (request.method === "HEAD") {
      return new Response(null, {
        status: response.status,
        headers: response.headers,
      });
    }

    return response;
  },
} satisfies ExportedHandler<Env>;

function classifyPath(pathname: string): Route {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return { kind: "today" };
  if (path === "/fuentes") return { kind: "fuentes" };
  if (path === "/preguntas") return { kind: "preguntas" };
  const permalink = path.match(/^\/q\/([^/]+)$/);
  if (permalink) return { kind: "permalink", id: permalink[1] };
  return { kind: "missing" };
}

function htmlHeaders(status: number): HeadersInit {
  if (status >= 400) {
    return { ...HTML, "Cache-Control": "no-store" };
  }
  const ttl = secondsUntilSantiagoMidnight();
  return {
    ...HTML,
    "Cache-Control": `public, max-age=${ttl}`,
    Expires: santiagoMidnightExpires(),
  };
}

function analyticsEnv(env: Env) {
  return {
    POSTHOG_PROJECT_TOKEN: env.POSTHOG_PROJECT_TOKEN,
    POSTHOG_HOST: env.POSTHOG_HOST,
  };
}

function htmlResponse(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  route: Route,
): Response {
  const analytics = analyticsEnv(env);
  const url = request.url;

  if (route.kind === "fuentes") {
    captureWorkerEvent(analytics, ctx, "fuentes_viewed", { $current_url: url });
    return new Response(renderFuentes(analytics), { headers: htmlHeaders(200) });
  }
  if (route.kind === "preguntas") {
    captureWorkerEvent(analytics, ctx, "preguntas_viewed", { $current_url: url });
    return new Response(renderPreguntas(analytics), { headers: htmlHeaders(200) });
  }
  if (route.kind === "missing") {
    return new Response(renderNotFound(analytics), { status: 404, headers: htmlHeaders(404) });
  }

  const quote =
    route.kind === "today"
      ? pickQuoteForDay(quotes, dayIndex())
      : findQuoteById(quotes, route.id);

  if (!quote) {
    return new Response(renderNotFound(analytics), { status: 404, headers: htmlHeaders(404) });
  }

  captureWorkerEvent(analytics, ctx, "quote_viewed", {
    $current_url: url,
    quote_id: quote.id,
    author: quote.author,
    work: quote.work,
    route: route.kind,
  });

  return new Response(renderPage(quote, analytics), { headers: htmlHeaders(200) });
}

async function cliResponse(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  route: Route,
): Promise<Response> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const { success } = await env.CLI_RATE_LIMIT.limit({ key: ip });

  if (!success) {
    return new Response("Demasiadas peticiones\n", {
      status: 429,
      headers: {
        ...PLAIN,
        "Cache-Control": "no-store",
        "Retry-After": RETRY_AFTER_SECONDS,
      },
    });
  }

  const cache = caches.default;
  const cachePath = cliCachePath(route);
  const cacheKey = new Request(new URL(cachePath, request.url).toString());
  const cached = await cache.match(cacheKey);
  if (cached) {
    return withCliClientHeaders(cached);
  }

  const built = buildCliBody(route);
  const ttl = secondsUntilSantiagoMidnight();
  const stored = new Response(built.body, {
    status: built.status,
    headers: {
      ...PLAIN,
      "Cache-Control": `public, max-age=${ttl}`,
      Expires: santiagoMidnightExpires(),
    },
  });
  if (built.status < 400) {
    ctx.waitUntil(cache.put(cacheKey, stored.clone()));
  }

  return withCliClientHeaders(stored);
}

function withCliClientHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  // The Worker must see every CLI hit for rate limiting. Do not let a
  // CDN Cache-Control on the client response skip the limiter.
  headers.set("Cache-Control", "no-store");
  headers.delete("Expires");
  return new Response(response.body, {
    status: response.status,
    headers,
  });
}

function cliCachePath(route: Route): string {
  const day = santiagoYmd();
  if (route.kind === "today") return `/__cli/${day}/today`;
  if (route.kind === "fuentes") return `/__cli/${day}/fuentes`;
  if (route.kind === "preguntas") return `/__cli/${day}/preguntas`;
  if (route.kind === "permalink") return `/__cli/${day}/q/${route.id}`;
  return `/__cli/${day}/missing`;
}

function buildCliBody(route: Route): { status: number; body: string } {
  if (route.kind === "fuentes") {
    return { status: 200, body: formatFuentesPlain() };
  }
  if (route.kind === "preguntas") {
    return { status: 200, body: formatPreguntasPlain() };
  }
  if (route.kind === "missing") {
    return { status: 404, body: "No se encontró esa cita\n" };
  }

  const quote =
    route.kind === "today"
      ? pickQuoteForDay(quotes, dayIndex())
      : findQuoteById(quotes, route.id);

  if (!quote) {
    return { status: 404, body: "No se encontró esa cita\n" };
  }

  return { status: 200, body: formatPlain(quote) };
}
