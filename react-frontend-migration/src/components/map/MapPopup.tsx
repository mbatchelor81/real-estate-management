import { PropertyBadge } from '@/components/shared';
import type { Property } from '@/types';

interface MapPopupProps {
  property: Property;
}

export function MapPopup({ property }: MapPopupProps): React.ReactElement {
  return (
    <div className="min-w-48 p-2">
      <div className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
        {property.name}
      </div>
      <div className="mb-2">
        <PropertyBadge type={property.type} />
      </div>
      {property.address && (
        <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          {property.address}
        </div>
      )}
      <a
        href={`/properties/${property.property_id}`}
        className="block w-full rounded bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        View More
      </a>
    </div>
  );
}
