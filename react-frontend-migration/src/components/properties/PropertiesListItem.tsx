import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui';
import { PropertyBadge } from '@/components/shared';
import type { Property } from '@/types';
import { TransactionType } from '@/types';

interface PropertiesListItemProps {
  property: Property;
  enableOwnedBadge?: boolean;
  isOwner?: boolean;
  onDelete?: (propertyId: string) => void;
}

function formatCurrency(amount: number, currency = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
  }).format(amount);
}

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function truncateText(text: string | undefined, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export function PropertiesListItem({
  property,
  enableOwnedBadge = true,
  isOwner = false,
  onDelete,
}: PropertiesListItemProps): React.ReactElement {
  const navigate = useNavigate();

  const handleClick = (): void => {
    void navigate(`/properties/${property.property_id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(property.property_id);
    }
  };

  const transactionBadgeClass =
    property.transactionType === TransactionType.ForSale
      ? 'bg-green-500 text-white'
      : 'bg-yellow-500 text-white';

  return (
    <Card
      className="cursor-pointer border border-slate-200 shadow-none transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
    >
      <CardContent className="p-4">
        <div
          onClick={handleClick}
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
          role="button"
          tabIndex={0}
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {enableOwnedBadge && isOwner && (
              <span className="inline-block rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                Owned
              </span>
            )}
            <PropertyBadge type={property.type} />
            <span className="text-slate-400">|</span>
            <span
              className={`inline-block rounded px-2 py-1 text-xs font-medium ${transactionBadgeClass}`}
            >
              For {property.transactionType}
            </span>
            <span className={`ml-auto ${isOwner ? 'mr-9' : ''}`}>
              {formatDate(property.createdAt)}
            </span>
            {isOwner && onDelete && (
              <button
                onClick={handleDeleteClick}
                className="absolute right-3 top-2 flex size-[30px] items-center justify-center rounded-full bg-gray-300 p-2 transition-colors duration-300 ease-in-out hover:bg-gray-400"
                aria-label="Property options"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center text-sm text-slate-900 dark:text-white lg:mt-3">
            <span className="text-base font-light lg:text-lg">
              {truncateText(property.name, 30)}
            </span>
            <span className="px-2">|</span>
            <span className="hidden font-light md:block md:text-lg">
              {truncateText(property.description, 40)}
            </span>
            <span className="ml-auto font-light md:text-lg xl:text-xl">
              {formatCurrency(property.price, property.currency)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
