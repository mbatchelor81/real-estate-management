import { Link } from 'react-router-dom';
import { PropertyBadge } from '@/components/shared';
import type { Property } from '@/types';

interface MapPopupProps {
  property: Property;
}

export function MapPopup({ property }: MapPopupProps): React.ReactElement {
  return (
    <div className="min-w-[200px] p-2">
      <div className="mb-2 text-base font-semibold text-gray-900">{property.name}</div>
      <div className="mb-2">
        <PropertyBadge type={property.type} />
      </div>
      <div className="mb-3 text-sm text-gray-600">{property.address}</div>
      <Link
        to={`/properties/${property.property_id}`}
        className="block w-full rounded-md bg-blue-500 px-3 py-1.5 text-center text-sm font-medium text-white transition-colors hover:bg-blue-600"
      >
        View More
      </Link>
    </div>
  );
}
