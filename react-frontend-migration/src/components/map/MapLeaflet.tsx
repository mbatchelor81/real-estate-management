import { useEffect, useRef, useCallback, useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Map, Marker as LeafletMarker, LayerGroup as LeafletLayerGroup } from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { useAppSelector } from '@/store';
import { getProperties } from '@/services';
import { storageService, getTileUrl } from '@/services';
import { PropertyType } from '@/types';
import type { Property, Coord } from '@/types';
import { MapPopup } from './MapPopup';
import 'leaflet/dist/leaflet.css';

import markerResidential from '@/assets/images/map/marker-residential.svg';
import markerCommercial from '@/assets/images/map/marker-commercial.svg';
import markerIndustrial from '@/assets/images/map/marker-industrial.svg';
import markerLand from '@/assets/images/map/marker-land.svg';
import markerDefault from '@/assets/images/map/default-marker.svg';
import markerShadow from '@/assets/images/map/marker-shadow.svg';

interface MapLeafletProps {
  clickAddMarker?: boolean;
  showPropertyMarkers?: boolean;
  visibleMarkerType?: PropertyType[];
  onClickedAt?: (coord: Coord) => void;
}

export interface MapLeafletRef {
  setMapCenter: (coord: Coord) => void;
  findMarker: (lat: number, lng: number) => void;
}

interface MarkerIconConfig {
  iconUrl: string;
  shadowUrl: string;
  iconSize: [number, number];
  shadowSize: [number, number];
  iconAnchor: [number, number];
  shadowAnchor: [number, number];
  popupAnchor: [number, number];
}

const DEFAULT_CENTER: Coord = { lat: 8.947416086535465, lng: 125.5451552207221 };
const DEFAULT_ZOOM = 18;
const MIN_ZOOM = 16;
const FLY_TO_ZOOM = 19;
const POPUP_DELAY_MS = 1000;
const INVALIDATE_SIZE_DELAY_MS = 1000;

const MARKER_ICON_CONFIG: MarkerIconConfig = {
  iconUrl: markerDefault,
  shadowUrl: markerShadow,
  iconSize: [40, 45],
  shadowSize: [40, 55],
  iconAnchor: [22, 50],
  shadowAnchor: [5, 40],
  popupAnchor: [-3, -46],
};

const MARKER_ICONS: Record<PropertyType | 'default', string> = {
  [PropertyType.Residential]: markerResidential,
  [PropertyType.Commercial]: markerCommercial,
  [PropertyType.Industrial]: markerIndustrial,
  [PropertyType.Land]: markerLand,
  default: markerDefault,
};

function createMarkerIcon(type?: PropertyType): L.Icon {
  const iconUrl = type ? MARKER_ICONS[type] : MARKER_ICONS.default;
  return L.icon({
    ...MARKER_ICON_CONFIG,
    iconUrl,
  });
}

interface MapControllerProps {
  center: Coord;
  pendingMarkerRef: React.RefObject<LeafletMarker[]>;
  markersRef: React.RefObject<LeafletMarker[]>;
  clickAddMarker: boolean;
  onClickedAt?: (coord: Coord) => void;
  onMapReady: (map: Map) => void;
}

function MapController({
  center,
  pendingMarkerRef,
  clickAddMarker,
  onClickedAt,
  onMapReady,
}: MapControllerProps): null {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);

    map.whenReady(() => {
      setTimeout(() => {
        map.invalidateSize();
      }, INVALIDATE_SIZE_DELAY_MS);
    });
  }, [map, onMapReady]);

  useEffect(() => {
    if (!clickAddMarker) return;

    const handleClick = (e: L.LeafletMouseEvent): void => {
      pendingMarkerRef.current.forEach((marker) => {
        map.removeLayer(marker);
      });
      pendingMarkerRef.current = [];

      const icon = createMarkerIcon();
      const marker = L.marker([e.latlng.lat, e.latlng.lng], { icon });
      marker.addTo(map);
      pendingMarkerRef.current.push(marker);

      onClickedAt?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    };

    map.on('click', handleClick);

    return (): void => {
      map.off('click', handleClick);
    };
  }, [map, clickAddMarker, onClickedAt, pendingMarkerRef]);

  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [map, center]);

  return null;
}

interface PropertyMarkersProps {
  properties: Property[];
  visibleMarkerType: PropertyType[];
  markersRef: React.RefObject<LeafletMarker[]>;
  layerGroupsRef: React.RefObject<Record<PropertyType, LeafletLayerGroup | null>>;
}

function PropertyMarkers({
  properties,
  visibleMarkerType,
  markersRef,
  layerGroupsRef,
}: PropertyMarkersProps): React.ReactElement {
  const map = useMap();

  const groupedProperties = useMemo(() => {
    const groups: Record<PropertyType, Property[]> = {
      [PropertyType.Residential]: [],
      [PropertyType.Commercial]: [],
      [PropertyType.Industrial]: [],
      [PropertyType.Land]: [],
    };

    properties.forEach((property) => {
      groups[property.type].push(property);
    });

    return groups;
  }, [properties]);

  useEffect(() => {
    markersRef.current = [];

    Object.values(PropertyType).forEach((type) => {
      const existingLayer = layerGroupsRef.current[type];
      if (existingLayer) {
        map.removeLayer(existingLayer);
      }
    });

    const newLayerGroups: Record<PropertyType, LeafletLayerGroup | null> = {
      [PropertyType.Residential]: null,
      [PropertyType.Commercial]: null,
      [PropertyType.Industrial]: null,
      [PropertyType.Land]: null,
    };

    Object.values(PropertyType).forEach((type) => {
      const propertiesOfType = groupedProperties[type];
      const markers: LeafletMarker[] = [];

      propertiesOfType.forEach((property) => {
        const icon = createMarkerIcon(property.type);
        const marker = L.marker([property.position.lat, property.position.lng], { icon });

        const popupContent = ReactDOMServer.renderToString(
          <MapPopup property={property} />
        );
        marker.bindPopup(popupContent);

        marker.on('click', () => {
          map.flyTo([property.position.lat, property.position.lng], FLY_TO_ZOOM);
        });

        markers.push(marker);
        markersRef.current.push(marker);
      });

      const layerGroup = L.layerGroup(markers);
      newLayerGroups[type] = layerGroup;

      if (visibleMarkerType.includes(type)) {
        layerGroup.addTo(map);
      }
    });

    layerGroupsRef.current = newLayerGroups;
  }, [map, groupedProperties, visibleMarkerType, markersRef, layerGroupsRef]);

  useEffect(() => {
    Object.values(PropertyType).forEach((type) => {
      const layerGroup = layerGroupsRef.current[type];
      if (!layerGroup) return;

      if (visibleMarkerType.includes(type)) {
        if (!map.hasLayer(layerGroup)) {
          layerGroup.addTo(map);
        }
      } else {
        if (map.hasLayer(layerGroup)) {
          map.removeLayer(layerGroup);
        }
      }
    });
  }, [map, visibleMarkerType, layerGroupsRef]);

  return <></>;
}

interface QueryParamSyncProps {
  markersRef: React.RefObject<LeafletMarker[]>;
}

function QueryParamSync({ markersRef }: QueryParamSyncProps): null {
  const map = useMap();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (lat && lng) {
      const targetLat = Number(lat);
      const targetLng = Number(lng);

      if (!isNaN(targetLat) && !isNaN(targetLng)) {
        const foundMarker = markersRef.current.find((marker) => {
          const latLng = marker.getLatLng();
          return latLng.lat === targetLat && latLng.lng === targetLng;
        });

        if (foundMarker) {
          map.flyTo(foundMarker.getLatLng(), FLY_TO_ZOOM);
          setTimeout(() => {
            foundMarker.openPopup();
          }, POPUP_DELAY_MS);
        } else {
          map.flyTo([targetLat, targetLng], FLY_TO_ZOOM);
        }
      }
    }
  }, [map, searchParams, markersRef]);

  return null;
}

export const MapLeaflet = forwardRef<MapLeafletRef, MapLeafletProps>(
  function MapLeaflet(
    {
      clickAddMarker = false,
      showPropertyMarkers = true,
      visibleMarkerType = [],
      onClickedAt,
    },
    ref
  ): React.ReactElement {
    const properties = useAppSelector(getProperties);
    const mapRef = useRef<Map | null>(null);
    const pendingMarkerRef = useRef<LeafletMarker[]>([]);
    const markersRef = useRef<LeafletMarker[]>([]);
    const layerGroupsRef = useRef<Record<PropertyType, LeafletLayerGroup | null>>({
      [PropertyType.Residential]: null,
      [PropertyType.Commercial]: null,
      [PropertyType.Industrial]: null,
      [PropertyType.Land]: null,
    });

    const [center, setCenter] = useState<Coord>(DEFAULT_CENTER);
    const [isDark, setIsDark] = useState<boolean>(false);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    useEffect(() => {
      const initializeMap = async (): Promise<void> => {
        const storedCoord = await storageService.getCoord();
        if (storedCoord) {
          setCenter(storedCoord);
        }

        const darkTheme = await storageService.getDarkTheme();
        setIsDark(darkTheme ?? false);

        setIsInitialized(true);
      };

      void initializeMap();
    }, []);

    const handleMapReady = useCallback((map: Map): void => {
      mapRef.current = map;
    }, []);

    const tileUrl = useMemo(() => getTileUrl(isDark), [isDark]);

    const effectiveVisibleMarkerType = useMemo(() => {
      if (visibleMarkerType.length === 0) {
        return Object.values(PropertyType);
      }
      return visibleMarkerType;
    }, [visibleMarkerType]);

    const setMapCenter = useCallback((coord: Coord): void => {
      mapRef.current?.flyTo([coord.lat, coord.lng], FLY_TO_ZOOM);
    }, []);

    const findMarker = useCallback((lat: number, lng: number): void => {
      const foundMarker = markersRef.current.find((marker) => {
        const latLng = marker.getLatLng();
        return latLng.lat === lat && latLng.lng === lng;
      });

      if (foundMarker && mapRef.current) {
        mapRef.current.flyTo(foundMarker.getLatLng(), FLY_TO_ZOOM);
        setTimeout(() => {
          foundMarker.openPopup();
        }, POPUP_DELAY_MS);
      }
    }, []);

    useImperativeHandle(ref, () => ({
      setMapCenter,
      findMarker,
    }), [setMapCenter, findMarker]);

    if (!isInitialized) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
        </div>
      );
    }

    return (
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        zoomControl={false}
        className="h-full w-full"
        id="mapId"
      >
        <TileLayer
          url={tileUrl}
          maxZoom={20}
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        />

        <ZoomControl position="bottomleft" />

        <MapController
          center={center}
          pendingMarkerRef={pendingMarkerRef}
          markersRef={markersRef}
          clickAddMarker={clickAddMarker}
          onClickedAt={onClickedAt}
          onMapReady={handleMapReady}
        />

        {showPropertyMarkers && (
          <PropertyMarkers
            properties={properties}
            visibleMarkerType={effectiveVisibleMarkerType}
            markersRef={markersRef}
            layerGroupsRef={layerGroupsRef}
          />
        )}

        <QueryParamSync markersRef={markersRef} />
      </MapContainer>
    );
  }
);

export type { MapLeafletProps };
