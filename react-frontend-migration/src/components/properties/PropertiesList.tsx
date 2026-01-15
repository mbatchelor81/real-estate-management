import { PropertiesListItem } from './PropertiesListItem';
import type { Property } from '@/types';
import { PropertiesDisplayOption } from '@/types';

interface PropertiesListProps {
  properties: Property[];
  displayOption?: PropertiesDisplayOption;
  enableOwnedBadge?: boolean;
  disableInfiniteScroll?: boolean;
  currentUserId?: string;
  onDelete?: (propertyId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export function PropertiesList({
  properties,
  displayOption = PropertiesDisplayOption.CardView,
  enableOwnedBadge = false,
  disableInfiniteScroll = false,
  currentUserId,
  onDelete,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}: PropertiesListProps): React.ReactElement {
  const isListView = displayOption === PropertiesDisplayOption.ListView;

  if (properties.length === 0) {
    return (
      <div className="flex h-[100px] items-center justify-center">
        <h1 className="flex items-center gap-2 text-slate-500">
          EMPTY
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </h1>
      </div>
    );
  }

  return (
    <div>
      {isListView ? (
        <section className="flex flex-col gap-2 px-3 lg:gap-3">
          {properties.map((property) => (
            <PropertiesListItem
              key={property.property_id}
              property={property}
              enableOwnedBadge={enableOwnedBadge}
              isOwner={currentUserId === property.user_id}
              onDelete={onDelete}
            />
          ))}
        </section>
      ) : (
        <section className="flex items-center justify-center px-3 py-4 md:py-3">
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {properties.map((property) => (
              <li key={property.property_id} className="col-span-1">
                <PropertiesListItem
                  property={property}
                  enableOwnedBadge={enableOwnedBadge}
                  isOwner={currentUserId === property.user_id}
                  onDelete={onDelete}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {!disableInfiniteScroll && hasMore && (
        <div className="flex justify-center py-8">
          {isLoading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <svg
                className="h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading data...
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}
