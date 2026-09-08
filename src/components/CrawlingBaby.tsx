import { useEffect, useRef, useState, type CSSProperties } from "react";

interface CrawlingBabyProps {
  /** Ile sekund zajmuje przejazd przez cały ekran. */
  duration?: number;
  /** Szerokość obrazka na desktopie, w pikselach. Na wąskich ekranach maleje sama. */
  size?: number;
  /** O ile pikseli podnieść dziecko nad dolną krawędź sekcji. */
  bottomOffset?: number;
  /** Zwłoka przed ruszeniem, w sekundach — liczona od wejścia sekcji w kadr. */
  delay?: number;
  /** Jaka część sekcji ma być widoczna, żeby animacja ruszyła (0–1). */
  threshold?: number;
  className?: string;
  src?: string;
}

/**
 * Dekoracyjne dziecko pełzające przez ekran.
 *
 * PODZIAŁ PRACY: sam WebP animuje pełzanie (ruch rąk i nóg), a ten komponent
 * odpowiada wyłącznie za przesuwanie całości po osi X. Dzięki temu tempo
 * pełzania i tempo przejazdu są od siebie niezależne — zmiana `duration` nie
 * przyspiesza rączek.
 *
 * BEZ BIBLIOTEKI. Projekt nie ma Framer Motion ani niczego podobnego, a jedno
 * przejście liniowe to jedna klatka kluczowa w CSS. Dokładanie kilkudziesięciu
 * kilobajtów zależności dla jednej dekoracji byłoby nieproporcjonalne.
 *
 * Ruch robi `transform`, nie `left` — przeglądarka animuje go na kompozytorze,
 * bez przeliczania układu przy każdej klatce. Stąd płynność także na telefonie.
 */
export function CrawlingBaby({
  duration = 12,
  size = 180,
  bottomOffset = 0,
  delay = 0,
  threshold = 0.25,
  className = "",
  src = "/baby-crawling.webp",
}: CrawlingBabyProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [hidden, setHidden] = useState(false);

  /**
   * Bez IntersectionObserver ruszamy od razu.
   *
   * Wartosc poczatkowa, nie setState w efekcie: przegladarka albo ma to API,
   * albo nie ma, i nie zmieni tego w trakcie zycia komponentu. Ustawianie tego
   * po pierwszym renderze wymuszaloby drugi przebieg bez zadnego zysku.
   */
  const [running, setRunning] = useState(() => typeof IntersectionObserver === "undefined");

  /**
   * SZANUJEMY USTAWIENIE SYSTEMOWE.
   *
   * Przy „ogranicz animacje" nie renderujemy niczego. Dekoracja, która jeździ
   * przez ekran, jest dokładnie tym, co to ustawienie ma wyłączać — a osoba,
   * która je włączyła, zwykle robi to z powodu zawrotów głowy albo migreny,
   * nie z kaprysu.
   *
   * Wartosc czytamy juz przy pierwszym renderze, zeby nie mignela animacja
   * przed jej wylaczeniem. Straznik na window jest dla srodowisk bez DOM;
   * efekt nizej tylko nasluchuje, gdyby ktos zmienil ustawienie w trakcie.
   */
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion || running) return;

    const track = trackRef.current;
    if (!track) return;

    // Obserwujemy SEKCJĘ, nie sam tor: tor jest niski i przyklejony do dolnej
    // krawędzi, więc wchodziłby w kadr dopiero pod koniec przewijania sekcji.
    const section = track.parentElement ?? track;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        // JEDEN RAZ NA WIZYTĘ. Rozłączamy się natychmiast, więc przewijanie
        // w górę i w dół nie odpala przejazdu od nowa.
        observer.disconnect();
        setRunning(true);
      },
      { threshold },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [reducedMotion, running, threshold]);

  if (reducedMotion || hidden) return null;

  const style = {
    "--crawl-duration": `${duration}s`,
    "--crawl-delay": `${delay}s`,
    "--crawl-size": `clamp(110px, 26vw, ${size}px)`,
    "--crawl-bottom": `${bottomOffset}px`,
  } as CSSProperties;

  return (
    <div
      ref={trackRef}
      className={`crawling-baby${running ? " crawling-baby--running" : ""} ${className}`.trim()}
      style={style}
      aria-hidden="true"
    >
      <img
        className="crawling-baby__img"
        src={src}
        alt=""
        /*
          Wymiary wlasne pliku (362x300). CSS i tak nadpisuje szerokosc, ale
          dzieki tym atrybutom przegladarka zna proporcje jeszcze przed
          pobraniem obrazka i `height: auto` liczy sie od razu poprawnie.
          Po podmianie assetu na inny warto je zaktualizowac.
        */
        width={362}
        height={300}
        decoding="async"
        loading="lazy"
        // Brak pliku nie może zostawić na stronie ikony zepsutego obrazka.
        onError={() => setHidden(true)}
      />
    </div>
  );
}
