import { PropertyCard } from './PropertyCard';
import type { Property } from '@/types';
import { PropertiesDisplayOption } from '@/types';

interface PropertiesListProps {
  properties: Property[];
  displayOption?: PropertiesDisplayOption;
  singleCol?: boolean;
  limit?: number;
  disableInfiniteScroll?: boolean;
  enableOwnedBadge?: boolean;
  enablePopupOptions?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export function PropertiesList({
  properties,
  displayOption = PropertiesDisplayOption.CardView,
  singleCol = false,
  limit = 0,
  disableInfiniteScroll = false,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}: PropertiesListProps): React.ReactElement {
  const displayedProperties = limit > 0 ? properties.slice(0, limit) : properties;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>): void => {
    if (disableInfiniteScroll || !onLoadMore || !hasMore || isLoading) return;

    const target = e.target as HTMLDivElement;
    const scrollThreshold = 80;
    const isNearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < scrollThreshold;

    if (isNearBottom) {
      onLoadMore();
    }
  };

  if (displayOption === PropertiesDisplayOption.CardView) {
    return (
      <section
        className="flex items-center justify-center px-3 py-3 md:py-4"
        onScroll={handleScroll}
      >
        <ul
          className={`grid grid-cols-1 gap-4 ${
            !singleCol ? 'md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : ''
          }`}
        >
          {displayedProperties.map((property) => (
            <li key={property.property_id} className="col-span-1">
              <PropertyCard property={property} />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2 px-3 lg:gap-3" onScroll={handleScroll}>
      {displayedProperties.map((property) => (
        <div
          key={property.property_id}
          className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
              <img
                src={
                  property.images && property.images.length > 0
                    ? property.images[0]
                    : '/assets/images/no-image.jpeg'
                }
                alt={property.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h4 className="font-semibold text-gray-900 dark:text-white">{property.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{property.address}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
