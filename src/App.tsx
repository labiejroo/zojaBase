import { ZojaEmbed } from "./components/ZojaEmbed";

/**
 * Makieta strony rodzinnej. Jedyne, co tu naprawdę robimy, to osadzenie
 * apki rezerwacyjnej — reszta jest po to, żeby strona miała realną długość
 * i dało się sprawdzić, czy modal w iframe trzyma się pola widzenia.
 */

const ZOJA_ORIGIN = import.meta.env.VITE_ZOJA_ORIGIN ?? "http://localhost:3000";
const SHOW_DIAGNOSTICS = import.meta.env.VITE_SHOW_DIAGNOSTICS === "true";

export default function App() {
  return (
    <div className="page">
      <header className="header">
        <p className="header__eyebrow">Rodzina Labuz</p>
        <h1 className="header__title">Zoja jest już z nami</h1>
        <p className="header__lead">
          Urodziła się w sierpniu, waży trzy i pół kilo i śpi wyłącznie wtedy,
          gdy ktoś ją nosi. Dziękujemy za wszystkie wiadomości — jest ich tyle,
          że odpisujemy powoli.
        </p>
      </header>

      <main className="content">
        <section className="prose">
          <h2>Kilka słów, zanim przyjedziecie</h2>
          <p>
            Bardzo chcemy Was zobaczyć, ale pierwsze tygodnie są nieprzewidywalne.
            Dlatego zamiast umawiać się przez telefon, zrobiliśmy kalendarz.
            Wybierzcie weekend, który Wam pasuje, a my potwierdzimy go mailem.
          </p>
          <p>
            Rezerwujemy całe weekendy — sobota i niedziela zawsze razem. Jeśli
            wolicie przyjechać tylko na jeden dzień, to oczywiście też w porządku,
            po prostu zaznaczcie to w formularzu.
          </p>
        </section>

        <section className="embed-section" aria-labelledby="rezerwacja">
          <h2 id="rezerwacja">Wybierzcie termin</h2>
          <ZojaEmbed origin={ZOJA_ORIGIN} showDiagnostics={SHOW_DIAGNOSTICS} />
        </section>

        <section className="prose">
          <h2>Jak do nas trafić</h2>
          <p>
            Jesteśmy pod tym samym adresem co zawsze. Autobus 128 zatrzymuje się
            dwie ulice dalej, a przed domem prawie zawsze jest miejsce
            parkingowe — poza sobotnim porankiem, kiedy obok stoi targ.
          </p>
          <h2>O co pytacie najczęściej</h2>
          <p>
            <strong>Czy można z dziećmi?</strong> Można, tylko dajcie znać
            w notatce, żebyśmy przygotowali miejsce.
          </p>
          <p>
            <strong>Czy przynosić prezenty?</strong> Naprawdę nie trzeba.
            Jeśli bardzo chcecie — pieluchy rozmiar 2 znikają najszybciej.
          </p>
          <p>
            <strong>Co, jeśli termin zniknie z kalendarza?</strong> Znaczy, że
            ktoś był szybszy. Kalendarz odświeża się sam, więc warto zajrzeć
            za kilka dni.
          </p>
        </section>
      </main>

      <footer className="footer">
        <p>Zrobione w domu, między jednym karmieniem a drugim.</p>
      </footer>
    </div>
  );
}
