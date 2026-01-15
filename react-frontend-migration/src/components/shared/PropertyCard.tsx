import { Link } from 'react-router-dom';
import { PropertyBadge } from './PropertyBadge';
import { useAppSelector } from '@/store';
import type { Property } from '@/types';
import { TransactionType } from '@/types';

interface PropertyCardProps {
  property: Property;
}

const NO_IMAGE_URL = '/assets/images/no-image.jpeg';

function formatCurrency(value: number, currency = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
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
  const user = useAppSelector((state) => state.auth.user);
  const isOwned = user?.user_id === property.user_id;
  const isForRent = property.transactionType === TransactionType.ForRent;

  const tagColorClass = isOwned
    ? 'bg-blue-500'
    : isForRent
      ? 'bg-amber-500'
      : 'bg-green-500';

  const imageUrl =
    property.images && property.images.length > 0 ? property.images[0] : NO_IMAGE_URL;

  return (
    <div className="relative m-0 flex h-full w-full max-w-[360px] flex-col rounded-lg border border-slate-200 bg-white shadow-none dark:border-slate-700 dark:bg-slate-800">
      <div
        className={`absolute left-0 top-0 z-10 rounded-br-lg px-3 py-1 text-sm font-bold text-white opacity-90 sm:text-base ${tagColorClass}`}
      >
        {isOwned ? (
          <span>Owned</span>
        ) : (
          <span className="capitalize">For {property.transactionType}</span>
        )}
      </div>

      <Link
        to={`/properties/${property.property_id}`}
        className="group h-[230px] cursor-pointer overflow-hidden"
      >
        <img
          className="h-full w-full object-cover transition-all duration-300 ease-in-out group-hover:scale-125"
          src={imageUrl}
          alt={property.name}
        />
      </Link>

      <div className="px-3 py-2">
        <PropertyBadge type={property.type} />
        <h3 className="mt-1 line-clamp-1 overflow-hidden text-ellipsis text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
          {property.name}
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(property.createdAt)}
        </div>
      </div>

      <div className="flex flex-grow flex-col px-3 pb-3">
        <div className="mb-3 h-[60px] overflow-hidden text-ellipsis">
          <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
            {property.description}
          </p>
        </div>

        <div className="mt-auto text-base font-bold text-gray-900 dark:text-white sm:text-lg">
          {formatCurrency(property.price, property.currency)}
          {isForRent && property.paymentFrequency && (
            <span className="ml-1 text-sm font-normal capitalize text-gray-600 dark:text-gray-400">
              | {property.paymentFrequency}
            </span>
          )}
        </div>

        <Link
          to={`/properties/${property.property_id}`}
          className="mt-3 block w-full rounded-md bg-blue-500 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-blue-600"
        >
          View property
        </Link>
      </div>
    </div>
  );
}
