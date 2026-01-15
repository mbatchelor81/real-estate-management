import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import type { SearchResult } from 'leaflet-geosearch/dist/providers/provider.js';

interface LocationResult {
  label: string;
  lat: number;
  lng: number;
}

interface ModalSearchProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: T | LocationResult) => void;
  title?: string;
  placeholder?: string;
  items?: T[];
  displayProperty?: keyof T;
  useGeosearch?: boolean;
  debounceMs?: number;
  minSearchLength?: number;
}

export function ModalSearch<T extends Record<string, unknown>>({
  isOpen,
  onClose,
  onSelect,
  title = 'Search',
  placeholder = 'Search...',
  items = [],
  displayProperty,
  useGeosearch = false,
  debounceMs = 1000,
  minSearchLength = 3,
}: ModalSearchProps<T>): React.ReactElement | null {
  const [searchText, setSearchText] = useState('');
  const [displayedItems, setDisplayedItems] = useState<(T | LocationResult)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplayedItems(items);
  }, [items]);

  useEffect((): (() => void) | undefined => {
    if (isOpen) {
      const timer = setTimeout((): void => {
        searchInputRef.current?.focus();
      }, 100);
      return (): void => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen]);

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect((): (() => void) => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return (): void => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  const searchWithGeosearch = useCallback(async (query: string): Promise<LocationResult[]> => {
    const provider = new OpenStreetMapProvider();
    const results: SearchResult[] = await provider.search({ query });

    if (results.length === 0) {
      return [];
    }

    return results.map((result) => ({
      label: result.label,
      lat: result.y,
      lng: result.x,
    }));
  }, []);

  const filterLocalItems = useCallback(
    (query: string): T[] => {
      const lowerQuery = query.toLowerCase();
      return items.filter((item) => {
        const value = displayProperty ? item[displayProperty] : item;
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        return stringValue.toLowerCase().includes(lowerQuery);
      });
    },
    [items, displayProperty]
  );

  const performSearch = useCallback(
    async (text: string): Promise<void> => {
      if (useGeosearch && text.length > minSearchLength) {
        const results = await searchWithGeosearch(text);
        setDisplayedItems(results);
      } else {
        const filtered = filterLocalItems(text);
        setDisplayedItems(filtered);
      }
      setIsLoading(false);
    },
    [useGeosearch, minSearchLength, searchWithGeosearch, filterLocalItems]
  );

  const handleSearch = useCallback(
    (text: string): void => {
      setSearchText(text);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (text.length === 0) {
        setDisplayedItems(items);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setDisplayedItems([]);

      debounceTimerRef.current = setTimeout((): void => {
        void performSearch(text);
      }, debounceMs);
    },
    [items, debounceMs, performSearch]
  );

  useEffect((): (() => void) => {
    return (): void => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleItemSelect = (item: T | LocationResult): void => {
    onSelect(item);
    onClose();
  };

  const getDisplayValue = (item: T | LocationResult): string => {
    if ('label' in item && typeof item.label === 'string') {
      return item.label;
    }
    if (displayProperty && displayProperty in item) {
      const value = item[displayProperty as keyof typeof item];
      return typeof value === 'string' ? value : JSON.stringify(value);
    }
    return JSON.stringify(item);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full flex-col bg-white md:mx-auto md:my-8 md:h-auto md:max-h-[80vh] md:max-w-lg md:rounded-lg md:shadow-xl">
        <div className="flex-shrink-0 bg-blue-600 px-4 py-3 md:rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none"
              aria-label="Close modal"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="mt-3">
            <input
              ref={searchInputRef}
              type="text"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-md border-0 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50">
          {isLoading && (
            <div className="px-4 py-3">
              <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-600" />
              </div>
            </div>
          )}

          {!isLoading && displayedItems.length === 0 && searchText.length > 0 && (
            <div className="px-4 py-8 text-center text-gray-500">No results found</div>
          )}

          {!isLoading && displayedItems.length > 0 && (
            <ul className="divide-y divide-gray-200">
              {displayedItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleItemSelect(item)}
                    className="w-full px-4 py-3 text-left text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    {getDisplayValue(item)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
