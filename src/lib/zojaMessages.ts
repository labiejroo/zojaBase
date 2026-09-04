/**
 * Kontrakt wiadomości ze stroną rezerwacji w iframe.
 * Lustrzane odbicie `nextjs/lib/iframeMessages.ts` — zmiana po jednej stronie
 * wymaga zmiany po drugiej.
 */

export const ZOJA_IFRAME_RESIZE = "ZOJA_IFRAME_RESIZE";
export const ZOJA_PARENT_VIEWPORT = "ZOJA_PARENT_VIEWPORT";
export const ZOJA_SCROLL_TO_EMBED = "ZOJA_SCROLL_TO_EMBED";

/**
 * Kotwica, do której przewijamy na prośbę ramki. Należy do NAS — ramka nie wie
 * i nie musi wiedzieć, jak zbudowana jest ta strona. Musi zgadzać się z `id`
 * nagłówka sekcji w App.tsx.
 */
export const EMBED_ANCHOR_ID = "rezerwacja";

/** iframe → my */
export interface ZojaResizeMessage {
  type: typeof ZOJA_IFRAME_RESIZE;
  height: number;
}

/** iframe → my: „otwarto formularz, dobry moment żeby przewinąć do sekcji”. */
export interface ZojaScrollToEmbedMessage {
  type: typeof ZOJA_SCROLL_TO_EMBED;
}

export function isScrollToEmbedMessage(data: unknown): data is ZojaScrollToEmbedMessage {
  if (typeof data !== "object" || data === null) return false;
  return (data as Record<string, unknown>).type === ZOJA_SCROLL_TO_EMBED;
}

/** my → iframe */
export interface ZojaParentViewportMessage {
  type: typeof ZOJA_PARENT_VIEWPORT;
  offsetTop: number;
  viewportHeight: number;
}

/** Rozsądne granice — chronią przed literówką albo błędem po drugiej stronie. */
export const MIN_FRAME_HEIGHT = 200;
export const MAX_FRAME_HEIGHT = 20000;

export function isResizeMessage(data: unknown): data is ZojaResizeMessage {
  if (typeof data !== "object" || data === null) return false;
  const message = data as Record<string, unknown>;
  return (
    message.type === ZOJA_IFRAME_RESIZE &&
    typeof message.height === "number" &&
    Number.isFinite(message.height)
  );
}

export function clampHeight(height: number): number {
  return Math.min(Math.max(Math.round(height), MIN_FRAME_HEIGHT), MAX_FRAME_HEIGHT);
}
