import { useEffect, useRef, useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import L from 'leaflet';
import type { Map, Marker, TileLayer } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapService } from '@/services/mapService';
import type { Coord } from '@/types';
import defaultMarkerIcon from '@/assets/images/map/default-marker.svg';
import markerShadow from '@/assets/images/map/marker-shadow.svg';

interface MapLeafletProps {
  clickAddMarker?: boolean;
  showPropertyMarkers?: boolean;
  onClickedAt?: (coord: Coord) => void;
  initialCenter?: Coord;
  isDark?: boolean;
  className?: string;
}

export interface MapLeafletRef {
  setMapCenter: (coord: Coord) => void;
}

const DEFAULT_CENTER: Coord = { lat: 8.947416086535465, lng: 125.5451552207221 };
const DEFAULT_ZOOM = 18;
const MIN_ZOOM = 16;

function createDefaultIcon(): L.Icon {
  return L.icon({
    iconUrl: defaultMarkerIcon,
    shadowUrl: markerShadow,
    iconSize: [40, 45],
    shadowSize: [40, 55],
    iconAnchor: [22, 50],
    shadowAnchor: [5, 40],
    popupAnchor: [-3, -46],
  });
}

export const MapLeaflet = forwardRef<MapLeafletRef, MapLeafletProps>(function MapLeaflet(
  {
    clickAddMarker = false,
    showPropertyMarkers: _showPropertyMarkers = true,
    onClickedAt,
    initialCenter,
    isDark = false,
    className = '',
  },
  ref
): React.ReactElement {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const tileLayerRef = useRef<TileLayer | null>(null);
  const pendingMarkerRef = useRef<Marker | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const handleMapClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (!clickAddMarker || !mapRef.current) return;

      if (pendingMarkerRef.current) {
        mapRef.current.removeLayer(pendingMarkerRef.current);
      }

      const icon = createDefaultIcon();
      const marker = L.marker([e.latlng.lat, e.latlng.lng], { icon });
      marker.addTo(mapRef.current);
      pendingMarkerRef.current = marker;

      if (onClickedAt) {
        onClickedAt({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
    [clickAddMarker, onClickedAt]
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const center = initialCenter ?? DEFAULT_CENTER;

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: DEFAULT_ZOOM,
      minZoom: MIN_ZOOM,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    map.whenReady(() => {
      setTimeout(() => {
        map.invalidateSize();
        setIsMapReady(true);
      }, 100);
    });

    const tileLayer = mapService.addTiles(map, isDark);
    tileLayerRef.current = tileLayer;
    mapRef.current = map;

    return (): void => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
    };
  }, [initialCenter, isDark]);

  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    if (clickAddMarker) {
      mapRef.current.on('click', handleMapClick);
    }

    return (): void => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
      }
    };
  }, [clickAddMarker, handleMapClick, isMapReady]);

  const setMapCenter = useCallback((coord: Coord): void => {
    if (mapRef.current) {
      mapRef.current.flyTo([coord.lat, coord.lng], 19);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    setMapCenter,
  }));

  return (
    <div
      ref={mapContainerRef}
      className={`h-full w-full ${className}`}
      style={{ minHeight: '300px' }}
    />
  );
});

export type { MapLeafletProps };
