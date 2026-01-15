import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { mapService } from '@/services/mapService';
import { storageService } from '@/services/storageService';
import { MapPopup } from './MapPopup';
import type { Property, Coord } from '@/types';
import { PropertyType } from '@/types';

import 'leaflet/dist/leaflet.css';

interface MapLeafletProps {
  properties: Property[];
  visibleMarkerTypes: PropertyType[];
  showPropertyMarkers?: boolean;
  clickAddMarker?: boolean;
  onClickedAt?: (coord: Coord) => void;
}

interface MarkerGroups {
  [PropertyType.Residential]: L.LayerGroup | null;
  [PropertyType.Commercial]: L.LayerGroup | null;
  [PropertyType.Industrial]: L.LayerGroup | null;
  [PropertyType.Land]: L.LayerGroup | null;
}

const DEFAULT_CENTER: Coord = { lat: 8.947416086535465, lng: 125.5451552207221 };
const DEFAULT_ZOOM = 18;
const MIN_ZOOM = 16;
const FLY_TO_ZOOM = 19;

function getMarkerIcon(type: PropertyType | ''): L.Icon {
  let iconFile = 'default-marker.svg';

  switch (type) {
    case PropertyType.Residential:
      iconFile = 'marker-residential.svg';
      break;
    case PropertyType.Commercial:
      iconFile = 'marker-commercial.svg';
      break;
    case PropertyType.Industrial:
      iconFile = 'marker-industrial.svg';
      break;
    case PropertyType.Land:
      iconFile = 'marker-land.svg';
      break;
  }

  return L.icon({
    iconUrl: `/assets/images/map/${iconFile}`,
    shadowUrl: '/assets/images/map/marker-shadow.svg',
    iconSize: [40, 45],
    shadowSize: [40, 55],
    iconAnchor: [22, 50],
    shadowAnchor: [5, 40],
    popupAnchor: [-3, -46],
  });
}

export function MapLeaflet({
  properties,
  visibleMarkerTypes,
  showPropertyMarkers: _showPropertyMarkers = true,
  clickAddMarker = false,
  onClickedAt,
}: MapLeafletProps): React.ReactElement {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const pendingMarkersRef = useRef<L.Marker[]>([]);
  const markerGroupsRef = useRef<MarkerGroups>({
    [PropertyType.Residential]: null,
    [PropertyType.Commercial]: null,
    [PropertyType.Industrial]: null,
    [PropertyType.Land]: null,
  });
  const isInitializedRef = useRef(false);

  const [searchParams] = useSearchParams();

  const findMarker = useCallback((lat: number, lng: number): void => {
    const foundMarker = markersRef.current.find((marker) => {
      const latLng = marker.getLatLng();
      return latLng.lat === lat && latLng.lng === lng;
    });

    if (foundMarker && mapRef.current) {
      mapRef.current.flyTo(foundMarker.getLatLng(), FLY_TO_ZOOM);
      setTimeout(() => {
        foundMarker.openPopup();
      }, 1000);
    }
  }, []);

  const setMapCenter = useCallback((coord: Coord): void => {
    if (mapRef.current) {
      mapRef.current.flyTo([coord.lat, coord.lng], FLY_TO_ZOOM);
    }
  }, []);

  const pinMarker = useCallback((coord: Coord): void => {
    if (!mapRef.current) return;

    const icon = getMarkerIcon('');
    const marker = mapService.addMarker(mapRef.current, coord, { icon, popup: null });
    marker.addTo(mapRef.current);
    pendingMarkersRef.current.push(marker);
  }, []);

  const addPropertyMarker = useCallback((property: Property): L.Marker | null => {
    if (!mapRef.current) return null;

    const popupContent = renderToString(<MapPopup property={property} />);
    const icon = getMarkerIcon(property.type);

    const marker = mapService.addMarker(mapRef.current, property.position, {
      icon,
      popup: popupContent,
    });

    markersRef.current.push(marker);
    return marker;
  }, []);

  const setMapMarkers = useCallback((): void => {
    if (!mapRef.current) return;
    if (properties.length === 0) return;

    markersRef.current = [];

    const grouped = properties.reduce<Record<PropertyType, Property[]>>(
      (acc, property) => {
        acc[property.type] = [...acc[property.type], property];
        return acc;
      },
      {
        [PropertyType.Residential]: [],
        [PropertyType.Commercial]: [],
        [PropertyType.Industrial]: [],
        [PropertyType.Land]: [],
      }
    );

    const residentialMarkers = grouped[PropertyType.Residential]
      .map((p) => addPropertyMarker(p))
      .filter((m): m is L.Marker => m !== null);

    const commercialMarkers = grouped[PropertyType.Commercial]
      .map((p) => addPropertyMarker(p))
      .filter((m): m is L.Marker => m !== null);

    const industrialMarkers = grouped[PropertyType.Industrial]
      .map((p) => addPropertyMarker(p))
      .filter((m): m is L.Marker => m !== null);

    const landMarkers = grouped[PropertyType.Land]
      .map((p) => addPropertyMarker(p))
      .filter((m): m is L.Marker => m !== null);

    markerGroupsRef.current = {
      [PropertyType.Residential]: L.layerGroup(residentialMarkers),
      [PropertyType.Commercial]: L.layerGroup(commercialMarkers),
      [PropertyType.Industrial]: L.layerGroup(industrialMarkers),
      [PropertyType.Land]: L.layerGroup(landMarkers),
    };

    const map = mapRef.current;
    const groups = markerGroupsRef.current;
    const residentialGroup = groups[PropertyType.Residential];
    const commercialGroup = groups[PropertyType.Commercial];
    const industrialGroup = groups[PropertyType.Industrial];
    const landGroup = groups[PropertyType.Land];

    if (residentialGroup) residentialGroup.addTo(map);
    if (commercialGroup) commercialGroup.addTo(map);
    if (industrialGroup) industrialGroup.addTo(map);
    if (landGroup) landGroup.addTo(map);
  }, [properties, addPropertyMarker]);

  useEffect(() => {
    if (!mapContainerRef.current || isInitializedRef.current) return;

    const initMap = async (): Promise<void> => {
      if (!mapContainerRef.current) return;

      let center = DEFAULT_CENTER;
      const savedCoord = await storageService.getCoord();
      if (savedCoord) {
        center = savedCoord;
      }

      mapRef.current = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: DEFAULT_ZOOM,
        minZoom: MIN_ZOOM,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomleft' }).addTo(mapRef.current);

      mapRef.current.whenReady(() => {
        setTimeout(() => {
          mapRef.current?.invalidateSize();
        }, 1000);
      });

      const isDark = (await storageService.getDarkTheme()) ?? false;
      mapService.addTiles(mapRef.current, isDark);

      if (clickAddMarker) {
        mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
          pendingMarkersRef.current.forEach((marker) => {
            mapRef.current?.removeLayer(marker);
          });
          pendingMarkersRef.current = [];

          pinMarker(e.latlng);
          onClickedAt?.(e.latlng);
        });
      }

      isInitializedRef.current = true;
    };

    void initMap();

    return (): void => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        isInitializedRef.current = false;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !isInitializedRef.current) return;

    setMapMarkers();
  }, [properties, setMapMarkers]);

  useEffect(() => {
    if (!mapRef.current || !isInitializedRef.current) return;

    const map = mapRef.current;
    const groups = markerGroupsRef.current;
    const propertyTypes: PropertyType[] = [
      PropertyType.Residential,
      PropertyType.Commercial,
      PropertyType.Industrial,
      PropertyType.Land,
    ];

    propertyTypes.forEach((propertyType) => {
      const group = groups[propertyType];
      if (!group) return;

      const isVisible = visibleMarkerTypes.includes(propertyType);

      if (isVisible && !map.hasLayer(group)) {
        map.addLayer(group);
      } else if (!isVisible && map.hasLayer(group)) {
        map.removeLayer(group);
      }
    });
  }, [visibleMarkerTypes]);

  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (lat && lng && mapRef.current && isInitializedRef.current) {
      findMarker(Number(lat), Number(lng));
    }
  }, [searchParams, findMarker]);

  const exposedMethods = useMemo(
    () => ({
      setMapCenter,
      findMarker,
    }),
    [setMapCenter, findMarker]
  );

  useEffect(() => {
    (window as unknown as { mapLeafletMethods?: typeof exposedMethods }).mapLeafletMethods =
      exposedMethods;
  }, [exposedMethods]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} id="mapId" className="h-full w-full" />
    </div>
  );
}
