import { useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IonInfiniteScroll, IonInfiniteScrollContent, IonRow } from '@ionic/react';
import type { IonInfiniteScrollCustomEvent } from '@ionic/core';
import { PropertyCard } from './PropertyCard';
import { PropertyListItem } from './PropertyListItem';
import { HorizontalSlide } from '@/components/shared';
import { useAppSelector, useAppDispatch } from '@/store';
import { getHasMore, getPropertiesLoading, createPropertiesService } from '@/services/propertiesService';
import type { Property } from '@/types';
import { PropertiesDisplayOption } from '@/types';
import type { RootState } from '@/store';

interface PropertiesListProps {
  displayOption?: PropertiesDisplayOption;
  singleCol?: boolean;
  horizontalSlide?: boolean;
  limit?: number;
  enableOwnedBadge?: boolean;
  enablePopupOptions?: boolean;
  properties: Property[];
  disableInfiniteScroll?: boolean;
  onDisableInfiniteScrollChange?: (disabled: boolean) => void;
}

function searchProperties(search: string, properties: Property[]): Property[] {
  const searchLower = search.toLowerCase();
  return properties.filter(
    (p) =>
      p.name.toLowerCase().includes(searchLower) ||
      (p.description ? p.description.toLowerCase().includes(searchLower) : false) ||
      (p.address ? p.address.toLowerCase().includes(searchLower) : false)
  );
}

function filterProperties(filter: string, properties: Property[]): Property[] {
  return properties.filter((p) => p.type === (filter as Property['type']));
}

function sortProperties(sort: string, properties: Property[]): Property[] {
  const sorted = [...properties];
  switch (sort) {
    case 'latest':
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );
    case 'oldest':
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
      );
    case 'title':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

const DEBOUNCE_DELAY = 1000;

export function PropertiesList({
  displayOption = PropertiesDisplayOption.CardView,
  singleCol = false,
  horizontalSlide = false,
  limit = 0,
  enableOwnedBadge = false,
  enablePopupOptions = false,
  properties,
  disableInfiniteScroll = false,
}: PropertiesListProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const hasMore = useAppSelector(getHasMore);
  const isLoading = useAppSelector(getPropertiesLoading);
  const infiniteScrollRef = useRef<HTMLIonInfiniteScrollElement>(null);
  const lastLoadTimeRef = useRef<number>(0);

  const sort = searchParams.get('sort') ?? 'latest';
  const search = searchParams.get('search') ?? '';
  const filter = searchParams.get('filter') ?? '';

  const propertiesList = useMemo((): Property[] => {
    if (properties.length === 0) {
      return [];
    }

    let result = limit > 0 ? properties.slice(0, limit) : [...properties];

    if (search) {
      result = searchProperties(search, result);
    }
    if (filter) {
      result = filterProperties(filter, result);
    }

    result = sortProperties(sort, result);
    return result;
  }, [properties, limit, search, filter, sort]);

  const loadMoreProperties = useCallback(async (): Promise<void> => {
    const now = Date.now();
    if (now - lastLoadTimeRef.current < DEBOUNCE_DELAY) {
      const scrollEl = infiniteScrollRef.current;
      if (scrollEl) {
        await scrollEl.complete();
      }
      return;
    }
    lastLoadTimeRef.current = now;

    const propertiesService = createPropertiesService(
      dispatch,
      () => ({} as RootState)
    );

    await propertiesService.fetchProperties(sort, filter || undefined, search || undefined);

    const scrollEl = infiniteScrollRef.current;
    if (scrollEl) {
      await scrollEl.complete();
    }
  }, [dispatch, sort, filter, search]);

  const handleInfiniteScroll = useCallback(
    async (event: IonInfiniteScrollCustomEvent<void>): Promise<void> => {
      await loadMoreProperties();
      await event.target.complete();
    },
    [loadMoreProperties]
  );

  const renderCardView = (): React.ReactElement => {
    if (horizontalSlide) {
      return (
        <HorizontalSlide className="gap-4 px-3 py-4">
          {propertiesList.map((item) => (
            <div key={item.property_id} className="flex-shrink-0">
              <PropertyCard property={item} />
            </div>
          ))}
        </HorizontalSlide>
      );
    }

    return (
      <section className="ion-content-scroll-host flex items-center justify-center px-3 py-4 md:py-3">
        <ul
          className={`grid grid-cols-1 gap-4 ${
            !singleCol ? 'md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : ''
          }`}
        >
          {propertiesList.map((item) => (
            <li key={item.property_id} className="col-span-1">
              <PropertyCard property={item} />
            </li>
          ))}
        </ul>
      </section>
    );
  };

  const renderListView = (): React.ReactElement => {
    return (
      <section className="flex flex-col gap-2 px-3 lg:gap-3">
        {propertiesList.map((item) => (
          <PropertyListItem
            key={item.property_id}
            property={item}
            enableOwnedBadge={enableOwnedBadge}
            enablePopupOptions={enablePopupOptions}
          />
        ))}
      </section>
    );
  };

  return (
    <>
      {displayOption === PropertiesDisplayOption.CardView && renderCardView()}
      {displayOption === PropertiesDisplayOption.ListView && renderListView()}

      <IonRow>
        <IonInfiniteScroll
          ref={infiniteScrollRef}
          threshold="80px"
          onIonInfinite={(event) => void handleInfiniteScroll(event)}
          disabled={disableInfiniteScroll || !hasMore || isLoading}
        >
          <IonInfiniteScrollContent
            className={!disableInfiniteScroll && hasMore ? 'py-12' : ''}
            loadingSpinner="bubbles"
            loadingText="Loading data..."
          />
        </IonInfiniteScroll>
      </IonRow>
    </>
  );
}
