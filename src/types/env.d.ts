interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  /** "true" → use bundled static demo data instead of a live MockAPI backend. */
  readonly VITE_STATIC_DEMO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
