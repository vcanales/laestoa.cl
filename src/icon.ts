export type IconKind = "ico" | "svg" | "light" | "dark" | "apple";

export const ICON_LINKS = `<link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon-light.png" type="image/png" sizes="32x32" media="(prefers-color-scheme: light)">
  <link rel="icon" href="/favicon-dark.png" type="image/png" sizes="32x32" media="(prefers-color-scheme: dark)">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">`;

const ICON_TYPES: Record<IconKind, string> = {
  ico: "image/x-icon",
  svg: "image/svg+xml",
  light: "image/png",
  dark: "image/png",
  apple: "image/png",
};

/** Browser favicon requests. Matched before page routing and the CLI limiter. */
export function iconKind(pathname: string): IconKind | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  switch (path) {
    case "/favicon.ico":
      return "ico";
    case "/favicon.svg":
      return "svg";
    case "/favicon-light.png":
      return "light";
    case "/favicon-dark.png":
      return "dark";
    case "/apple-touch-icon.png":
      return "apple";
    default:
      return null;
  }
}

export function iconResponse(kind: IconKind, body: BodyInit): Response {
  return new Response(body, {
    headers: {
      "Content-Type": ICON_TYPES[kind],
      "Cache-Control": "public, max-age=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
