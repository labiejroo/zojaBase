# Zoja — strona rodzinna (parent app)

Makieta strony rodzinnej, w której **osadzona jest apka rezerwacyjna**
(`../nextjs`) w `<iframe>`. Czysty React + Vite, bez Next.js.

Ta aplikacja istnieje po to, żeby po drugiej stronie `postMessage` był realny
odbiorca: przyjmuje wysokość treści z iframe i odsyła informację, którą część
ramki widzi w tej chwili użytkownik.

## Uruchomienie

Potrzebne są **dwa** terminale — apka rezerwacyjna i ta strona.

```bash
# terminal 1 — apka rezerwacyjna
cd ../nextjs
npm install
npm run dev            # http://localhost:3000

# terminal 2 — strona rodzinna
npm install
npm run dev            # http://localhost:5173
```

Otwórz **http://localhost:5173**. Kalendarz pojawi się w ramce w środku strony.

## Zmienne środowiskowe

Plik `.env` (wzór w `.env.example`):

| Zmienna | Znaczenie |
| --- | --- |
| `VITE_ZOJA_ORIGIN` | Origin apki rezerwacyjnej. Dokładny, bez ukośnika na końcu. |
| `VITE_SHOW_DIAGNOSTICS` | `true` pokazuje pod ramką wysokość i licznik wiadomości. |

Po obu stronach muszą zgadzać się dwa adresy:

* tutaj `VITE_ZOJA_ORIGIN` = adres apki (`http://localhost:3000`),
* w `../nextjs/.env.local` `NEXT_PUBLIC_PARENT_ORIGIN` = adres tej strony
  (`http://localhost:5173`).

Ta druga zmienna steruje też nagłówkiem
`Content-Security-Policy: frame-ancestors` w apce, więc przy niezgodności
przeglądarka po prostu odmówi wyświetlenia ramki.

## Jak to działa

```
iframe  ──  ZOJA_IFRAME_RESIZE { height }      ──▶  rodzic ustawia iframe.style.height
rodzic  ──  ZOJA_PARENT_VIEWPORT { offsetTop, viewportHeight }  ──▶  iframe pozycjonuje modal
```

Cała obsługa siedzi w [`src/hooks/useZojaFrame.ts`](src/hooks/useZojaFrame.ts),
kontrakt wiadomości w [`src/lib/zojaMessages.ts`](src/lib/zojaMessages.ts)
(lustrzane odbicie `../nextjs/lib/iframeMessages.ts`).

**Druga wiadomość rozwiązuje konkretny problem.** Iframe nie ma własnego
scrolla, więc bywa wysoki na 2000 px. Modal z `position: fixed` wyśrodkowałby
się w środku tych 2000 px — czyli daleko poza ekranem. Rodzic mówi apce, gdzie
jest widoczny wycinek, a apka kotwiczy modal właśnie tam.

## Bezpieczeństwo

* `event.origin` sprawdzany **przed** odczytaniem treści wiadomości.
* `event.source` porównywany z `contentWindow` naszej ramki — inny iframe na
  stronie nie podszyje się pod apkę.
* `postMessage` zawsze na konkretny origin, nigdy `"*"`.
* Wysokość walidowana i przycinana do 200–20000 px.

## Struktura

```
src/
  components/ZojaEmbed.tsx   iframe + komunikat, gdy apka nie odpowiada
  hooks/useZojaFrame.ts      odbiór wysokości, wysyłka widocznego wycinka
  lib/zojaMessages.ts        kontrakt wiadomości i walidacja
  App.tsx                    makieta strony rodzinnej
  index.css                  style (paleta wspólna z apką)
```

## Produkcyjnie

* Ustaw `VITE_ZOJA_ORIGIN` na adres Netlify apki.
* Rozważ `sandbox="allow-scripts allow-same-origin allow-forms"` na `<iframe>`.
* Nie dodawaj iframe własnego `scrolling` — wysokość ustawia rodzic.
