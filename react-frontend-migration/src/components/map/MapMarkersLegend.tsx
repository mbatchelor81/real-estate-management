import { useState } from 'react';
import { PropertyType } from '@/types';

interface MarkerItem {
  label: string;
  value: PropertyType;
  isChecked: boolean;
  icon: string;
}

interface ToggledMarkerEvent {
  type: PropertyType;
  isChecked: boolean;
}

interface MapMarkersLegendProps {
  onToggleMarker: (event: ToggledMarkerEvent) => void;
}

const INITIAL_MARKERS: MarkerItem[] = [
  {
    label: 'Residential',
    value: PropertyType.Residential,
    isChecked: true,
    icon: 'marker-residential.svg',
  },
  {
    label: 'Commercial',
    value: PropertyType.Commercial,
    isChecked: true,
    icon: 'marker-commercial.svg',
  },
  {
    label: 'Industrial',
    value: PropertyType.Industrial,
    isChecked: true,
    icon: 'marker-industrial.svg',
  },
  {
    label: 'Land',
    value: PropertyType.Land,
    isChecked: true,
    icon: 'marker-land.svg',
  },
];

export function MapMarkersLegend({
  onToggleMarker,
}: MapMarkersLegendProps): React.ReactElement {
  const [markers, setMarkers] = useState<MarkerItem[]>(INITIAL_MARKERS);

  const handleMarkerToggle = (index: number): void => {
    setMarkers((prevMarkers) => {
      const updatedMarkers = prevMarkers.map((marker, i) =>
        i === index ? { ...marker, isChecked: !marker.isChecked } : marker
      );
      const toggledMarker = updatedMarkers[index];
      onToggleMarker({
        type: toggledMarker.value,
        isChecked: toggledMarker.isChecked,
      });
      return updatedMarkers;
    });
  };

  return (
    <div className="absolute right-0 bottom-6 z-[400] bg-transparent p-1">
      <ul className="list-none m-0 p-0">
        {markers.map((marker, index) => (
          <li
            key={marker.value}
            className="flex items-center gap-1.5 px-1 py-0.5 bg-white/20 cursor-pointer hover:bg-white/30"
            onClick={() => handleMarkerToggle(index)}
          >
            <img
              src={`/assets/images/map/${marker.icon}`}
              alt={`${marker.label} marker`}
              className="h-[30px] w-[30px]"
            />
            <input
              type="checkbox"
              checked={marker.isChecked}
              onChange={() => handleMarkerToggle(index)}
              onClick={(e) => e.stopPropagation()}
              className="mr-1.5 accent-blue-600"
            />
            <span className="text-[13px] leading-[15px] text-gray-800 font-medium hidden md:inline">
              {marker.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
