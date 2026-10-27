import appleTouchIcon from "./icons/apple-touch-icon.png";
import faviconDark from "./icons/favicon-dark.png";
import faviconIco from "./icons/favicon.ico";
import faviconLight from "./icons/favicon-light.png";
import faviconSvg from "./icons/favicon.svg";
import type { IconKind } from "./icon";

export const ICON_BODIES: Record<IconKind, BodyInit> = {
  ico: faviconIco,
  svg: faviconSvg,
  light: faviconLight,
  dark: faviconDark,
  apple: appleTouchIcon,
};
