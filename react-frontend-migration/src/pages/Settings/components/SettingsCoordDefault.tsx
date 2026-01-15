import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { storageService } from '@/services';
import { Card, CardContent, Button, Input } from '@/components/ui';
import type { Coord } from '@/types';

const DEFAULT_COORD: Coord = { lat: 8.947416086535465, lng: 125.5451552207221 };

export function SettingsCoordDefault(): React.ReactElement {
  const [coord, setCoord] = useState<Coord>(DEFAULT_COORD);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCoord = async (): Promise<void> => {
      const savedCoord = await storageService.getCoord();
      if (savedCoord) {
        setCoord(savedCoord);
      }
      setIsLoading(false);
    };
    void loadCoord();
  }, []);

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setCoord((prev) => ({ ...prev, lat: value }));
    }
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setCoord((prev) => ({ ...prev, lng: value }));
    }
  };

  const handleSetCoord = (): void => {
    void storageService.setCoord(coord);
    toast.success('Your settings have been saved.');
  };

  const handleResetCoord = (): void => {
    setCoord(DEFAULT_COORD);
    void storageService.setCoord(DEFAULT_COORD);
    toast.success('Your settings have been reset.');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Change Default Coordinates
          </h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              window.open(`/map?lat=${String(coord.lat)}&lng=${String(coord.lng)}`, '_blank');
            }}
            className="flex items-center gap-2 lg:ml-4"
          >
            <span>Open Map</span>
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Latitude"
            type="number"
            step="any"
            value={coord.lat}
            onChange={handleLatChange}
          />
          <Input
            label="Longitude"
            type="number"
            step="any"
            value={coord.lng}
            onChange={handleLngChange}
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <Button variant="primary" onClick={handleSetCoord}>
            Set Coordinates
          </Button>
          <Button variant="outline" onClick={handleResetCoord}>
            Reset Coordinates
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
