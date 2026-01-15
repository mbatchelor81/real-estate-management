import { useState, useCallback } from 'react';
import { ModalSearch } from '@/components/shared';
import phpCities, { type CityData } from '@/data/phpCities';
import type { Coord } from '@/types';

interface MapSearchFieldProps {
  onSelectedLocation: (coord: Coord) => void;
}

interface LocationResult {
  label: string;
  lat: number;
  lng: number;
}

function isLocationResult(item: CityData | LocationResult): item is LocationResult {
  return 'label' in item && typeof item.label === 'string';
}

export function MapSearchField({ onSelectedLocation }: MapSearchFieldProps): React.ReactElement {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFocus = useCallback((): void => {
    setIsModalOpen(true);
  }, []);

  const handleClose = useCallback((): void => {
    setIsModalOpen(false);
  }, []);

  const handleSelect = useCallback(
    (item: CityData | LocationResult): void => {
      let lat: number;
      let lng: number;

      if (isLocationResult(item)) {
        lat = item.lat;
        lng = item.lng;
      } else {
        lat = Number(item.lat);
        lng = Number(item.lng);
      }

      onSelectedLocation({ lat, lng });
    },
    [onSelectedLocation]
  );

  return (
    <>
      <div className="flex items-center rounded-lg bg-white shadow-md">
        <div className="flex h-10 w-10 items-center justify-center text-gray-500">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search Cities.."
          onFocus={handleFocus}
          readOnly
          className="h-10 flex-1 cursor-pointer border-0 bg-transparent pr-4 text-gray-700 placeholder-gray-400 outline-none focus:ring-0"
        />
      </div>

      <ModalSearch<CityData>
        isOpen={isModalOpen}
        onClose={handleClose}
        onSelect={handleSelect}
        title="Search Location"
        placeholder="Search Cities..."
        items={phpCities}
        displayProperty="city"
        useGeosearch={true}
        debounceMs={1000}
        minSearchLength={3}
      />
    </>
  );
}
