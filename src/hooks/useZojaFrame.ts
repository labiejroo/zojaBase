import { useCallback, useEffect, useRef, useState } from "react";

import {
  ZOJA_PARENT_VIEWPORT,
  clampHeight,
  isResizeMessage,
  type ZojaParentViewportMessage,
} from "../lib/zojaMessages";

export type FrameStatus = "loading" | "ready" | "silent";

interface UseZojaFrameResult {
  frameRef: React.RefObject<HTMLIFrameElement | null>;
  /** Wysokość ustawiana na iframe. */
  height: number;
  status: FrameStatus;
  /** Ile wiadomości o wysokości dotarło — widoczne w panelu diagnostycznym. */
  messageCount: number;
  /** Wywołaj po `onLoad` iframe. */
  handleLoad: () => void;
}

/**
 * Zapas doklejany do wysokości ramki na każdej rozdzielczości.
 * Apka zgłasza wysokość swojej treści co do piksela; ten margines daje jej
 * trochę luzu na dole, żeby nic nie ocierało się o krawędź iframe.
 */
const FRAME_HEIGHT_PADDING = 100;

/** Po tylu ms bez wiadomości zakładamy, że apka nie odpowiada. */
const SILENCE_TIMEOUT = 5000;

/**
 * Obsługuje obie strony rozmowy z iframe:
 * odbiera wysokość treści i odsyła widoczny wycinek ramki.
 */
export function useZojaFrame(origin: string, initialHeight = 640): UseZojaFrameResult {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(initialHeight);
  const [status, setStatus] = useState<FrameStatus>("loading");
  const [messageCount, setMessageCount] = useState(0);

  /** Mówi apce, którą część ramki użytkownik faktycznie widzi. */
  const sendViewport = useCallback(() => {
    const frame = frameRef.current;
    const frameWindow = frame?.contentWindow;
    if (!frame || !frameWindow) return;

    const rect = frame.getBoundingClientRect();
    const visibleTop = Math.max(rect.top, 0);
    const visibleBottom = Math.min(rect.bottom, window.innerHeight);

    const message: ZojaParentViewportMessage = {
      type: ZOJA_PARENT_VIEWPORT,
      offsetTop: Math.max(0, -rect.top),
      viewportHeight: Math.max(0, visibleBottom - visibleTop),
    };
    // Konkretny origin, nigdy "*".
    frameWindow.postMessage(message, origin);
  }, [origin]);

  const frameRequest = useRef(0);
  const scheduleViewport = useCallback(() => {
    if (frameRequest.current) return;
    frameRequest.current = requestAnimationFrame(() => {
      frameRequest.current = 0;
      sendViewport();
    });
  }, [sendViewport]);

  // Odbiór wysokości.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Nadawcę sprawdzamy, ZANIM spojrzymy na treść wiadomości.
      if (event.origin !== origin) return;
      // I czy to nasza ramka, a nie inny iframe na stronie.
      if (event.source !== frameRef.current?.contentWindow) return;
      if (!isResizeMessage(event.data)) return;

      setHeight(clampHeight(event.data.height + FRAME_HEIGHT_PADDING));
      setStatus("ready");
      setMessageCount((count) => count + 1);
      scheduleViewport();
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [origin, scheduleViewport]);

  // Wysyłka widocznego wycinka przy scrollu i zmianie rozmiaru okna.
  useEffect(() => {
    window.addEventListener("scroll", scheduleViewport, { passive: true });
    window.addEventListener("resize", scheduleViewport);
    return () => {
      window.removeEventListener("scroll", scheduleViewport);
      window.removeEventListener("resize", scheduleViewport);
      if (frameRequest.current) cancelAnimationFrame(frameRequest.current);
    };
  }, [scheduleViewport]);

  // Cisza po drugiej stronie to zwykle niewłączony serwer albo zły origin.
  useEffect(() => {
    if (status !== "loading") return;
    const timer = window.setTimeout(() => {
      setStatus((current) => (current === "loading" ? "silent" : current));
    }, SILENCE_TIMEOUT);
    return () => window.clearTimeout(timer);
  }, [status]);

  const handleLoad = useCallback(() => sendViewport(), [sendViewport]);

  return { frameRef, height, status, messageCount, handleLoad };
}
