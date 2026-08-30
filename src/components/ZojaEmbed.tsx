import { useZojaFrame } from "../hooks/useZojaFrame";

interface Props {
  /** Origin apki rezerwacyjnej. Dokładny, bez ukośnika na końcu. */
  origin: string;
  /** Panel z podglądem wiadomości — pomoc przy integracji, nie dla gości. */
  showDiagnostics?: boolean;
}

export function ZojaEmbed({ origin, showDiagnostics = false }: Props) {
  const { frameRef, height, status, messageCount, handleLoad } = useZojaFrame(origin);

  return (
    <div className="embed">
      {status === "silent" && (
        <p className="embed__warning" role="status">
          Apka rezerwacyjna nie odpowiada. Sprawdź, czy działa pod{" "}
          <code>{origin}</code> i czy ma ustawione{" "}
          <code>NEXT_PUBLIC_PARENT_ORIGIN</code> na adres tej strony.
        </p>
      )}

      <iframe
        ref={frameRef}
        src={origin}
        title="Rezerwacja odwiedzin u Zoi"
        className="embed__frame"
        style={{ height }}
        onLoad={handleLoad}
        referrerPolicy="strict-origin-when-cross-origin"
      />

      {showDiagnostics && (
        <p className="embed__diagnostics">
          <span>
            wysokość ramki: <strong>{height} px</strong>
          </span>
          <span>
            odebranych wiadomości: <strong>{messageCount}</strong>
          </span>
          <span>
            origin: <code>{origin}</code>
          </span>
        </p>
      )}
    </div>
  );
}
