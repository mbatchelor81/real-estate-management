import { useState } from 'react';
import { PropertyType } from '@/types';

interface MarkerConfig {
  label: string;
  value: PropertyType;
  isChecked: boolean;
  icon: string;
}

interface MapMarkersLegendProps {
  onToggleMarker: (event: { type: PropertyType; isChecked: boolean }) => void;
}

const INITIAL_MARKERS: MarkerConfig[] = [
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

export function MapMarkersLegend({ onToggleMarker }: MapMarkersLegendProps): React.ReactElement {
  const [markers, setMarkers] = useState<MarkerConfig[]>(INITIAL_MARKERS);

  const handleMarkerClick = (index: number): void => {
    const updatedMarkers = [...markers];
    updatedMarkers[index] = {
      ...updatedMarkers[index],
      isChecked: !updatedMarkers[index].isChecked,
    };
    setMarkers(updatedMarkers);
    onToggleMarker({
      type: updatedMarkers[index].value,
      isChecked: updatedMarkers[index].isChecked,
    });
  };

  return (
    <div className="absolute bottom-4 right-4 z-[1000] rounded-lg bg-white p-2 shadow-lg dark:bg-slate-800">
      <ul className="space-y-1">
        {markers.map((marker, index) => (
          <li
            key={marker.value}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-slate-700"
            onClick={() => handleMarkerClick(index)}
          >
            <img
              src={`/assets/images/map/${marker.icon}`}
              alt={marker.label}
              className="h-6 w-6"
            />
            <input
              type="checkbox"
              checked={marker.isChecked}
              onChange={() => handleMarkerClick(index)}
              className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{marker.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
