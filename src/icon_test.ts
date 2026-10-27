import { readFileSync } from "node:fs";
import { ICON_LINKS, iconKind, iconResponse } from "./icon.ts";

let failed = 0;

function assert(cond: boolean, message: string): void {
  if (!cond) {
    console.error(message);
    failed += 1;
  }
}

for (const snippet of [
  '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
  'href="/favicon-light.png"',
  'href="/favicon-dark.png"',
  'media="(prefers-color-scheme: light)"',
  'media="(prefers-color-scheme: dark)"',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
]) {
  assert(ICON_LINKS.includes(snippet), `links missing ${snippet}`);
}

const page = readFileSync(new URL("./page.ts", import.meta.url), "utf8");
assert(page.includes("${ICON_LINKS}"), "pages should emit the icon links");

assert(iconKind("/") === null, "home is not an icon");
assert(iconKind("/fuentes") === null, "fuentes is not an icon");
assert(iconKind("/favicon.ico") === "ico", "ico");
assert(iconKind("/favicon.ico/") === "ico", "ico trailing slash");
assert(iconKind("/favicon.svg") === "svg", "svg");
assert(iconKind("/favicon-light.png") === "light", "light png");
assert(iconKind("/favicon-dark.png") === "dark", "dark png");
assert(iconKind("/apple-touch-icon.png") === "apple", "apple touch");
assert(iconKind("/favicon.ico/extra") === null, "ico prefix is not an icon");

const svgResponse = iconResponse("svg", "<svg></svg>");
assert(svgResponse.headers.get("Content-Type") === "image/svg+xml", "svg type");
assert(
  svgResponse.headers.get("Cache-Control") === "public, max-age=604800",
  "icon cache",
);
assert(svgResponse.headers.get("X-Content-Type-Options") === "nosniff", "nosniff");
assert(iconResponse("ico", "").headers.get("Content-Type") === "image/x-icon", "ico type");
assert(iconResponse("light", "").headers.get("Content-Type") === "image/png", "png type");

const svg = readFileSync(new URL("./icons/favicon.svg", import.meta.url), "utf8");
assert(svg.includes("#f3ead8"), "light paper");
assert(svg.includes("#2c2416"), "light ink");
assert(svg.includes("#11100e"), "dark paper");
assert(svg.includes("#e8e0d0"), "dark ink");
assert(svg.includes("prefers-color-scheme: dark"), "svg dark scheme");
assert(svg.includes('fill-rule="evenodd"'), "porch gaps");

function pngSize(bytes: Buffer): { w: number; h: number } {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  assert(bytes.subarray(0, 8).equals(sig), "png signature");
  assert(bytes.toString("ascii", 12, 16) === "IHDR", "png ihdr");
  return { w: bytes.readUInt32BE(16), h: bytes.readUInt32BE(20) };
}

const light = pngSize(readFileSync(new URL("./icons/favicon-light.png", import.meta.url)));
const dark = pngSize(readFileSync(new URL("./icons/favicon-dark.png", import.meta.url)));
const apple = pngSize(readFileSync(new URL("./icons/apple-touch-icon.png", import.meta.url)));
assert(light.w === 32 && light.h === 32, `light png ${light.w}x${light.h}`);
assert(dark.w === 32 && dark.h === 32, `dark png ${dark.w}x${dark.h}`);
assert(apple.w === 180 && apple.h === 180, `apple png ${apple.w}x${apple.h}`);

const lightBytes = readFileSync(new URL("./icons/favicon-light.png", import.meta.url));
const darkBytes = readFileSync(new URL("./icons/favicon-dark.png", import.meta.url));
assert(!lightBytes.equals(darkBytes), "light and dark pngs should differ");

const ico = readFileSync(new URL("./icons/favicon.ico", import.meta.url));
assert(ico.readUInt16LE(0) === 0, "ico reserved");
assert(ico.readUInt16LE(2) === 1, "ico type");
assert(ico.readUInt16LE(4) === 2, "ico image count");
assert(ico.readUInt8(6) === 16 && ico.readUInt8(7) === 16, "ico 16");
assert(ico.readUInt8(22) === 32 && ico.readUInt8(23) === 32, "ico 32");
const pngSig = Buffer.from([137, 80, 78, 71]);
assert(ico.includes(pngSig), "ico embeds png");

if (failed > 0) {
  process.exit(1);
}

console.log("icons ok");
