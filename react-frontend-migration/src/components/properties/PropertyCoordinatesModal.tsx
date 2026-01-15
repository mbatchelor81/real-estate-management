import { useState, useCallback } from 'react';
import { Modal } from '@/components/ui';
import { MapLeaflet } from '@/components/map';
import { Button } from '@/components/ui';
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
}: PropertyCoordinatesModalProps): React.ReactElement {
  const [selectedCoord, setSelectedCoord] = useState<Coord | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleCoordSelected = useCallback((coord: Coord) => {
    setSelectedCoord(coord);
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedCoord) {
      onConfirm(selectedCoord);
      setSelectedCoord(null);
    }
  }, [selectedCoord, onConfirm]);

  const handleClose = useCallback(() => {
    setSelectedCoord(null);
    onClose();
  }, [onClose]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="xl">
      <div className="relative flex flex-col" style={{ height: '60vh' }}>
        <div className="relative flex-1">
          <MapLeaflet
            clickAddMarker={true}
            showPropertyMarkers={false}
            onClickedAt={handleCoordSelected}
            initialCenter={initialCoord}
            className="rounded-lg"
          />

          <div className="absolute right-4 top-4 z-[1000]">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 focus:outline-none"
              aria-label="Help"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>

            {showHelp && (
              <div className="absolute right-0 top-12 w-64 rounded-lg bg-gray-800 p-3 text-sm text-white shadow-lg">
                <div className="flex items-start justify-between">
                  <span>Click/Tap at the map to place the marker.</span>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedCoord && (
          <div className="mt-4 flex justify-center">
            <Button variant="primary" onClick={handleConfirm}>
              Confirm
            </Button>
          </div>
        )}

        {selectedCoord && (
          <div className="mt-2 text-center text-sm text-gray-600">
            Selected: {selectedCoord.lat.toFixed(6)}, {selectedCoord.lng.toFixed(6)}
          </div>
        )}
      </div>
    </Modal>
  );
}

export type { PropertyCoordinatesModalProps };
