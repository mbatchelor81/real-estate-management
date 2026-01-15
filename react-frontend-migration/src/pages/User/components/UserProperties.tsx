import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOwnedProperties } from '@/store/slices/propertiesSlice';
import { LoadingSpinner } from '@/components/ui';
import { PropertyBadge } from '@/components/shared';
import type { Property } from '@/types';
import { TransactionType } from '@/types';

interface PropertyListItemProps {
  property: Property;
}

function PropertyListItem({ property }: PropertyListItemProps): React.ReactElement {
  const navigate = useNavigate();

  const handleClick = (): void => {
    void navigate(`/properties/${property.property_id}`);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(price);
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const truncateText = (text: string | undefined, maxLength: number): string => {
    if (!text) return '';
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-none transition-colors hover:bg-gray-50 dark:border-slate-800 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      <div className="flex items-center gap-x-1">
        <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
          Owned
        </span>
        <PropertyBadge type={property.type} />
        <span className="text-gray-400">|</span>
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium text-white ${
            property.transactionType === TransactionType.ForSale ? 'bg-green-500' : 'bg-yellow-500'
          }`}
        >
          For {property.transactionType}
        </span>
        <span className="ml-auto text-sm text-gray-500">{formatDate(property.createdAt)}</span>
      </div>

      <div className="mt-2 flex items-center text-sm text-gray-900 dark:text-white lg:mt-3">
        <span className="text-base font-light lg:text-lg">{truncateText(property.name, 30)}</span>
        <span className="px-2 text-gray-400">|</span>
        <span className="hidden font-light md:block md:text-lg">
          {truncateText(property.description, 40)}
        </span>
        <span className="ml-auto font-light md:text-lg xl:text-xl">{formatPrice(property.price)}</span>
      </div>
    </div>
  );
}

export function UserProperties(): React.ReactElement {
  const dispatch = useAppDispatch();
  const ownedProperties = useAppSelector((state) => state.properties.ownedProperties);
  const isLoading = useAppSelector((state) => state.properties.isLoading);

  useEffect(() => {
    if (ownedProperties.length === 0) {
      void dispatch(fetchOwnedProperties());
    }
  }, [dispatch, ownedProperties.length]);

  if (isLoading) {
    return (
      <div className="flex h-[100px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (ownedProperties.length === 0) {
    return (
      <div className="flex h-[100px] items-center justify-center">
        <h1 className="flex items-center gap-2 text-gray-500">
          EMPTY
          <AlertCircle className="h-5 w-5" />
        </h1>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-2 px-3 lg:gap-3">
      {ownedProperties.map((property) => (
        <PropertyListItem key={property.property_id} property={property} />
      ))}
    </section>
  );
}
