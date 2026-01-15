import { Link } from 'react-router-dom';
import { PropertyBadge } from '@/components/shared';
import { Button } from '@/components/ui';
import type { Property } from '@/types';

interface MapPopupProps {
  property: Property | null;
}

export function MapPopup({ property }: MapPopupProps): React.ReactElement {
  if (!property) {
    return (
      <div className="min-w-[200px] max-w-[300px]">
        <strong>No Property Data</strong>
      </div>
    );
  }

  return (
    <div className="min-w-[200px] max-w-[300px]">
      <div className="text-[17px] font-bold">{property.name}</div>
      <div className="mt-1">
        <PropertyBadge type={property.type} />
      </div>
      <div className="p-2 text-xs font-medium text-gray-700">
        {property.address}
      </div>
      <Link to={`/properties/${property.property_id}`}>
        <Button variant="primary" size="sm" fullWidth>
          View More
        </Button>
      </Link>
    </div>
  );
}
