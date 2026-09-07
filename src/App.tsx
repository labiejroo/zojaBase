import { ZojaEmbed } from "./components/ZojaEmbed";

/**
 * Makieta strony rodzinnej. Jedyne, co tu naprawdę robimy, to osadzenie
 * apki rezerwacyjnej — reszta jest po to, żeby strona miała realną długość
 * i dało się sprawdzić, czy modal w iframe trzyma się pola widzenia.
 */

/**
 * Origin apki sprowadzamy do postaci kanonicznej.
 *
 * `event.origin` z przeglądarki NIGDY nie ma końcowego ukośnika, więc adres
 * zapisany jako "https://…/" nie dopasuje się do żadnej wiadomości od ramki.
 * Objaw jest wredny: nic nie wybucha, ramka po prostu przestaje zmieniać
 * wysokość, a w konsoli cisza.
 *
 * Dokładnie ten błąd naprawialiśmy już po drugiej stronie, w apce Next
 * (lib/iframeMessages.ts). Tutaj ratowało nas dotąd wyłącznie to, że nikt tego
 * ukośnika nie postawił w .env — jedna literówka w panelu Netlify wystarczyłaby,
 * żeby wrócił.
 *
 * new URL().origin obcina też ścieżkę, port domyślny i normalizuje wielkość
 * liter w hoście. Przy adresie nie do sparsowania zostajemy przy wartości
 * surowej bez końcowych ukośników — lepsze to niż pusty origin, który nie
 * dopasowałby się do niczego.
 */
function normalizeOrigin(value: string): string {
  const trimmed = value.trim();
  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed.replace(/\/+$/, "");
  }
}

const ZOJA_ORIGIN = normalizeOrigin(
  import.meta.env.VITE_ZOJA_ORIGIN ?? "https://d3idn259a1zzt7.cloudfront.net",
);
const SHOW_DIAGNOSTICS = import.meta.env.VITE_SHOW_DIAGNOSTICS === "true";

export default function App() {
  return (
    <div className="page">
      <header className="header">
        <h1 className="header__title">Zoja jest już z nami</h1>
        <p className="header__lead">
          Urodziła się 25 lipca, ważyła prawie cztery kilo i śpi wyłącznie
          wtedy, gdy ktoś ją nosi.
        </p>
      </header>

      <main className="content">
        <section className="prose">
          <h2>Kilka słów, zanim przyjedziecie</h2>
          <p>
            Bardzo chcemy Was zobaczyć, ale pierwsze tygodnie są
            nieprzewidywalne. Dlatego zamiast umawiać się przez telefon,
            zrobiliśmy kalendarz. Wybierzcie weekend, który Wam pasuje, a my
            potwierdzimy go mailem.
          </p>
          <p>
            Rezerwujemy całe weekendy, sobota i niedziela zawsze razem.
            Przyjazd jest tylko na jeden dzień, drugi jest dla nas, bo też
            chcemy odpocząć po tygodniu.
          </p>
        </section>

        <section className="embed-section" aria-labelledby="rezerwacja">
          <h2 id="rezerwacja">Wybierzcie termin</h2>
          <ZojaEmbed origin={ZOJA_ORIGIN} showDiagnostics={SHOW_DIAGNOSTICS} />

          <p className="made-by-line">
            <a
              className="made-by"
              href="https://wizjaikod.netlify.app"
              target="_blank"
              // noopener odcina nowej karcie dostęp do window.opener,
              // noreferrer nie wysyła nagłówka Referer.
              rel="noopener noreferrer"
            >
              <span>Stworzone przez</span>
              {/*
                Ten sam wariant logo i ta sama plakietka co w stopce Domków na
                Pniu: `logo-ink` jest ciemne, więc potrzebuje jasnego podkładu.
                Wysokość zadana w CSS, szerokość z proporcji — plik ma 893×209 px,
                a `width`/`height` są tu po to, żeby przeglądarka zarezerwowała
                miejsce i układ nie skoczył po doczytaniu obrazka.
              */}
              <span className="made-by__badge">
                <img src="/assets/logo-ink.png" alt="WizjaKod" width={893} height={209} />
              </span>
            </a>
            {/* Poza linkiem: klikalna ma być sama atrybucja, nie cała fraza. */}
            <span>między jednym karmieniem, a drugim.</span>
          </p>
        </section>

        <section className="prose">
          <h2>O co pytacie najczęściej</h2>
          <p>
            <strong>Czy można z dziećmi?</strong> Można, tylko dajcie znać w
            notatce, żebyśmy przygotowali miejsce.
          </p>
          <p>
            <strong>Czy przynosić prezenty?</strong> Naprawdę nie trzeba. Jeśli
            bardzo chcecie, pieluchy rozmiar 2 znikają najszybciej.
          </p>
          <p>
            <strong>Co, jeśli termin zniknie z kalendarza?</strong> Znaczy, że
            ktoś był szybszy. Kalendarz odświeża się sam, więc warto zajrzeć za
            kilka dni.
          </p>
        </section>
      </main>

    </div>
  );
}
