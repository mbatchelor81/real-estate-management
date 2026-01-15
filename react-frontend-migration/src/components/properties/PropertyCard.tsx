import { useNavigate } from 'react-router-dom';
import { PropertyBadge } from '@/components/shared';
import { Button } from '@/components/ui';
import { useAppSelector } from '@/store';
import { selectAuthUser } from '@/store/slices/authSlice';
import type { Property } from '@/types';
import { TransactionType } from '@/types';

interface PropertyCardProps {
  property: Property;
}

const DEFAULT_IMAGE = '/assets/images/no-image.jpeg';

function formatCurrency(price: number, currency = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function PropertyCard({ property }: PropertyCardProps): React.ReactElement {
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);

  const isOwned = user?.user_id === property.user_id;
  const isForRent = property.transactionType === TransactionType.ForRent;

  const handleSelectProperty = (): void => {
    void navigate(`/properties/${property.property_id}`);
  };

  const getTagClasses = (): string => {
    if (isOwned) {
      return 'bg-blue-600 bg-opacity-80';
    }
    if (isForRent) {
      return 'bg-amber-500 bg-opacity-80';
    }
    return 'bg-green-500 bg-opacity-80';
  };

  const getTagText = (): string => {
    if (isOwned) {
      return 'Owned';
    }
    return `For ${property.transactionType}`;
  };

  const imageUrl =
    property.images && property.images.length > 0 ? property.images[0] : DEFAULT_IMAGE;

  return (
    <div className="relative m-0 flex h-full w-full max-w-[360px] flex-col rounded-lg bg-white shadow-md outline outline-1 outline-slate-200 dark:bg-gray-800 dark:outline-slate-700">
      <div
        className={`absolute left-0 top-0 z-10 rounded-br-lg px-3 py-1 text-sm font-bold text-white sm:text-lg ${getTagClasses()}`}
      >
        <span className="capitalize">{getTagText()}</span>
      </div>

      <div
        className="group h-[230px] cursor-pointer overflow-hidden"
        onClick={handleSelectProperty}
      >
        <img
          className="h-full w-full object-cover transition-all duration-300 ease-in-out group-hover:scale-125"
          src={imageUrl}
          alt={property.name}
        />
      </div>

      <div className="px-3 py-2">
        <PropertyBadge type={property.type} />
        <h3 className="line-clamp-1 overflow-hidden text-ellipsis text-base font-semibold text-gray-900 dark:text-white sm:text-xl">
          {property.name}
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(property.createdAt)}
        </div>
      </div>

      <div className="flex flex-grow flex-col px-3 pb-3">
        <div className="mb-3 h-[60px] overflow-hidden">
          <p className="line-clamp-3 overflow-hidden text-ellipsis text-sm text-gray-600 dark:text-gray-300">
            {property.description}
          </p>
        </div>

        <div className="mt-auto text-base font-bold text-gray-700 dark:text-gray-200 sm:text-lg">
          {formatCurrency(property.price, property.currency)}
          {isForRent && property.paymentFrequency && (
            <span className="ml-1 text-sm capitalize">| {property.paymentFrequency}</span>
          )}
        </div>

        <Button
          variant="primary"
          fullWidth
          className="mt-3"
          onClick={handleSelectProperty}
        >
          View property
        </Button>
      </div>
    </div>
  );
}
