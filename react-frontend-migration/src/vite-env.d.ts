/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_GOOGLE_AUTH_CLIENT_ID: string;
  readonly VITE_MAP_TILES_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
