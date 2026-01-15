interface FeaturesConfig {
  restrictedMode: boolean;
  restrictedHeading: string;
  restrictedMessage: string;
}

interface ApiConfig {
  server: string;
  mapKey: string;
  googleAuthClientId: string;
  webSocketUrl: string;
}

interface MapTilesConfig {
  default: string;
  dark: string;
}

interface MapConfig {
  tiles: MapTilesConfig;
}

interface Environment {
  production: boolean;
  api: ApiConfig;
  map: MapConfig;
  features: FeaturesConfig;
}

const getEnvString = (key: string, defaultValue: string): string => {
  const value = import.meta.env[key] as string | undefined;
  return value ?? defaultValue;
};

export const environment: Environment = {
  production: import.meta.env.PROD,
  api: {
    server: getEnvString('VITE_API_SERVER', 'http://localhost:8000/'),
    mapKey: getEnvString('VITE_MAP_KEY', ''),
    googleAuthClientId: getEnvString('VITE_GOOGLE_AUTH_CLIENT_ID', ''),
    webSocketUrl: getEnvString('VITE_WEBSOCKET_URL', 'ws://localhost:8000/websocket'),
  },
  map: {
    tiles: {
      default:
        'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=',
      dark: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=',
    },
  },
  features: {
    restrictedMode: import.meta.env.VITE_RESTRICTED_MODE === 'true',
    restrictedHeading: getEnvString('VITE_RESTRICTED_HEADING', 'Restricted'),
    restrictedMessage: getEnvString(
      'VITE_RESTRICTED_MESSAGE',
      'This feature is currently disabled in this mode.'
    ),
  },
};
