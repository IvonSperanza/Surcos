/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_DATOS_URL: string;
  readonly VITE_URL_PUBLICA?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
