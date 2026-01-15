import { useCallback, useRef } from 'react';
import { IonInfiniteScroll, IonInfiniteScrollContent, IonRow } from '@ionic/react';
import { PropertyCard } from './PropertyCard';
import { PropertyListItem } from './PropertyListItem';
import type { Property } from '@/types';
import { PropertiesDisplayOption } from '@/types';

interface PropertiesListProps {
  properties: Property[];
  displayOption?: PropertiesDisplayOption;
  singleCol?: boolean;
  limit?: number;
  enableOwnedBadge?: boolean;
  enablePopupOptions?: boolean;
  disableInfiniteScroll?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => Promise<void>;
  onPopupOpen?: (event: React.MouseEvent, property: Property) => void;
}

export function PropertiesList({
  properties,
  displayOption = PropertiesDisplayOption.CardView,
  singleCol = false,
  limit = 0,
  enableOwnedBadge = false,
  enablePopupOptions = false,
  disableInfiniteScroll = false,
  hasMore = true,
  onLoadMore,
  onPopupOpen,
}: PropertiesListProps): React.ReactElement {
  const infiniteScrollRef = useRef<HTMLIonInfiniteScrollElement>(null);

  const displayedProperties = limit > 0 ? properties.slice(0, limit) : properties;

  const handleInfiniteScroll = useCallback(
    async (event: CustomEvent<void>): Promise<void> => {
      if (onLoadMore) {
        await onLoadMore();
      }
      const target = event.target;
      if (target && 'complete' in target && typeof (target as { complete: () => Promise<void> }).complete === 'function') {
        void (target as { complete: () => Promise<void> }).complete();
      }
    },
    [onLoadMore]
  );

  const isDisabled = disableInfiniteScroll || !hasMore;

  return (
    <>
      {displayOption === PropertiesDisplayOption.CardView && (
        <section className="ion-content-scroll-host flex items-center justify-center px-3 py-4 md:py-3">
          <ul
            className={`grid grid-cols-1 gap-4 ${!singleCol ? 'md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : ''}`}
          >
            {displayedProperties.map((property) => (
              <li key={property.property_id} className="col-span-1">
                <PropertyCard property={property} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {displayOption === PropertiesDisplayOption.ListView && (
        <section className="flex flex-col gap-2 px-3 lg:gap-3">
          {displayedProperties.map((property) => (
            <PropertyListItem
              key={property.property_id}
              property={property}
              enableOwnedBadge={enableOwnedBadge}
              enablePopupOptions={enablePopupOptions}
              onPopupOpen={onPopupOpen}
            />
          ))}
        </section>
      )}

      <IonRow>
        <IonInfiniteScroll
          ref={infiniteScrollRef}
          threshold="80px"
          onIonInfinite={handleInfiniteScroll}
          disabled={isDisabled}
        >
          <IonInfiniteScrollContent
            className={!isDisabled ? 'py-12' : ''}
            loadingSpinner="bubbles"
            loadingText="Loading data..."
          />
        </IonInfiniteScroll>
      </IonRow>
    </>
  );
}
