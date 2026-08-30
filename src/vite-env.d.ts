/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin apki rezerwacyjnej. Dokładny, bez ukośnika na końcu. */
  readonly VITE_ZOJA_ORIGIN?: string;
  /** "true" włącza panel z podglądem wiadomości pod ramką. */
  readonly VITE_SHOW_DIAGNOSTICS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
