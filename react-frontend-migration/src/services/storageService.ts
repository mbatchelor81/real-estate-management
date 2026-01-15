import localforage from 'localforage';
import type { Coord, UserSignedIn } from '@/types';

const STORAGE_KEYS = {
  USER: 'user',
  DARK_THEME: 'isDark',
  COORD: 'coord',
} as const;

let isInitialized = false;

export function init(): void {
  if (isInitialized) {
    return;
  }

  localforage.config({
    name: 'real-estate-management',
    storeName: 'app_storage',
    description: 'Local storage for Real Estate Management app',
  });

  isInitialized = true;
}

export async function set<T>(key: string, value: T): Promise<T> {
  init();
  return localforage.setItem<T>(key, value);
}

export async function get<T>(key: string): Promise<T | null> {
  init();
  return localforage.getItem<T>(key);
}

export async function setDarkTheme(value: boolean): Promise<boolean> {
  init();
  return localforage.setItem<boolean>(STORAGE_KEYS.DARK_THEME, value);
}

export async function getDarkTheme(): Promise<boolean | null> {
  init();
  return localforage.getItem<boolean>(STORAGE_KEYS.DARK_THEME);
}

export async function setCoord(coord: Coord): Promise<Coord> {
  init();
  return localforage.setItem<Coord>(STORAGE_KEYS.COORD, coord);
}

export async function getCoord(): Promise<Coord | null> {
  init();
  return localforage.getItem<Coord>(STORAGE_KEYS.COORD);
}

export async function setUser(user: UserSignedIn): Promise<UserSignedIn> {
  init();
  return localforage.setItem<UserSignedIn>(STORAGE_KEYS.USER, user);
}

export async function getUser(): Promise<UserSignedIn | null> {
  init();
  return localforage.getItem<UserSignedIn>(STORAGE_KEYS.USER);
}

export async function removeUser(): Promise<void> {
  init();
  await localforage.removeItem(STORAGE_KEYS.USER);
}

export const storageService = {
  init,
  set,
  get,
  setDarkTheme,
  getDarkTheme,
  setCoord,
  getCoord,
  setUser,
  getUser,
  removeUser,
};

export default storageService;
