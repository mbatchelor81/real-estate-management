import { useState, useCallback } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import type { Coord } from '@/types';

interface PropertyCoordinatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (coord: Coord) => void;
  title?: string;
  initialCoord?: Coord;
}

export function PropertyCoordinatesModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Set Property Marker',
  initialCoord,
}: PropertyCoordinatesModalProps): React.ReactElement | null {
  const [coord, setCoord] = useState<Coord | null>(initialCoord ?? null);
  const [latInput, setLatInput] = useState(initialCoord ? String(initialCoord.lat) : '');
  const [lngInput, setLngInput] = useState(initialCoord ? String(initialCoord.lng) : '');
  const [error, setError] = useState<string | null>(null);

  const handleLatChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLatInput(value);
    setError(null);

    const lat = parseFloat(value);
    if (!isNaN(lat) && lat >= -90 && lat <= 90) {
      setCoord((prev) => ({
        lat,
        lng: prev?.lng ?? 0,
      }));
    }
  }, []);

  const handleLngChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLngInput(value);
    setError(null);

    const lng = parseFloat(value);
    if (!isNaN(lng) && lng >= -180 && lng <= 180) {
      setCoord((prev) => ({
        lat: prev?.lat ?? 0,
        lng,
      }));
    }
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setCoord({ lat, lng });
    setLatInput(lat.toFixed(6));
    setLngInput(lng.toFixed(6));
    setError(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!coord) {
      setError('Please set coordinates before confirming');
      return;
    }

    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90');
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180');
      return;
    }

    onConfirm({ lat, lng });
  }, [coord, latInput, lngInput, onConfirm]);

  const handleClose = useCallback(() => {
    setCoord(initialCoord ?? null);
    setLatInput(initialCoord ? String(initialCoord.lat) : '');
    setLngInput(initialCoord ? String(initialCoord.lng) : '');
    setError(null);
    onClose();
  }, [initialCoord, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="lg">
      <div className="space-y-4">
        <div
          className="relative h-64 w-full cursor-crosshair rounded-lg bg-gray-100"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const lat = 90 - (y / rect.height) * 180;
            const lng = (x / rect.width) * 360 - 180;
            handleMapClick(
              Math.round(lat * 1000000) / 1000000,
              Math.round(lng * 1000000) / 1000000
            );
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-sm">Click to set marker position</p>
              <p className="mt-1 text-xs text-gray-400">
                (Map integration pending - click anywhere to set coordinates)
              </p>
            </div>
          </div>
          {coord && (
            <div
              className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform"
              style={{
                left: `${String(((coord.lng + 180) / 360) * 100)}%`,
                top: `${String(((90 - coord.lat) / 180) * 100)}%`,
              }}
            >
              <div className="h-4 w-4 rounded-full border-2 border-white bg-red-500 shadow-lg" />
            </div>
          )}
        </div>

        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-sm text-blue-700">
            Click/Tap on the map to place the marker, or enter coordinates manually below.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Latitude"
            type="number"
            step="any"
            value={latInput}
            onChange={handleLatChange}
            placeholder="e.g., 14.5995"
            helperText="Range: -90 to 90"
          />
          <Input
            label="Longitude"
            type="number"
            step="any"
            value={lngInput}
            onChange={handleLngChange}
            placeholder="e.g., 120.9842"
            helperText="Range: -180 to 180"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!coord}
          >
            Confirm Location
          </Button>
        </div>
      </div>
    </Modal>
  );
}
