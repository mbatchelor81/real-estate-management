import L from 'leaflet';
import type { Map, Marker, Icon, TileLayer, LatLngExpression } from 'leaflet';
import { environment } from '@/config';
import type { Coord } from '@/types';

interface MarkerOptions {
  icon?: Icon | null;
  popup?: HTMLElement | string | null;
}

interface TileLayerConfig {
  maxZoom: number;
  attribution: string;
}

const DEFAULT_TILE_CONFIG: TileLayerConfig = {
  maxZoom: 20,
  attribution: `
    &copy; <a href="https://stadiamaps.com/">Stadia Maps</a>,
    &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a>
    &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors
  `,
};

const DEFAULT_FLY_TO_ZOOM = 19;

export function getTileUrl(isDark: boolean): string {
  return isDark ? environment.map.tiles.dark : environment.map.tiles.default;
}

export function addTiles(map: Map, isDark = false): TileLayer {
  const tileUrl = getTileUrl(isDark);
  const tiles = L.tileLayer(tileUrl, DEFAULT_TILE_CONFIG);
  tiles.addTo(map);
  return tiles;
}

export function addMarker(
  map: Map,
  coord: Coord,
  options: MarkerOptions = { icon: null, popup: null }
): Marker {
  const markerOptions: L.MarkerOptions = {};

  if (options.icon) {
    markerOptions.icon = options.icon;
  }

  const position: LatLngExpression = [coord.lat, coord.lng];
  const marker = L.marker(position, markerOptions);

  if (options.popup) {
    marker.bindPopup(options.popup);
  }

  marker.on('click', () => {
    map.flyTo(position, DEFAULT_FLY_TO_ZOOM);
  });

  return marker;
}

export function createCustomIcon(
  iconUrl: string,
  iconSize: [number, number] = [25, 41],
  iconAnchor: [number, number] = [12, 41],
  popupAnchor: [number, number] = [1, -34]
): Icon {
  return L.icon({
    iconUrl,
    iconSize,
    iconAnchor,
    popupAnchor,
  });
}

export function removeTileLayer(map: Map, tileLayer: TileLayer): void {
  tileLayer.removeFrom(map);
}

export function switchThemeTiles(
  map: Map,
  currentTileLayer: TileLayer,
  isDark: boolean
): TileLayer {
  removeTileLayer(map, currentTileLayer);
  return addTiles(map, isDark);
}

export const mapService = {
  getTileUrl,
  addTiles,
  addMarker,
  createCustomIcon,
  removeTileLayer,
  switchThemeTiles,
};

export default mapService;
