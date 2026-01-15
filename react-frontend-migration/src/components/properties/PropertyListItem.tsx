import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Property, TransactionType } from '@/types';
import { PropertyBadge } from '@/components/shared/PropertyBadge';
import { ActionPopup } from '@/components/shared/ActionPopup';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectAuthUser } from '@/store/slices/authSlice';
import { deleteProperty } from '@/store/slices/propertiesSlice';

interface PropertyListItemProps {
  property: Property;
  enableOwnedBadge?: boolean;
}

function formatCurrency(amount: number, currency: string = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString));
}

function truncateText(text: string | undefined, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

const EllipsisIcon = (): React.ReactElement => (
  <svg
    className="h-4 w-4"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

export function PropertyListItem({
  property,
  enableOwnedBadge = true,
}: PropertyListItemProps): React.ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const isOwner = user?.user_id === property.user_id;

  const handleSelectProperty = (): void => {
    void navigate(`/properties/${property.property_id}`);
  };

  const handleOpenPopup = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setIsPopupOpen(true);
  };

  const handleClosePopup = (): void => {
    setIsPopupOpen(false);
  };

  const handleAction = (action: string): void => {
    if (action === 'delete') {
      void (async (): Promise<void> => {
        try {
          await dispatch(deleteProperty(property.property_id)).unwrap();
          toast.success('Property deleted successfully');
          void navigate('/properties');
        } catch {
          toast.error('Failed to delete property');
        }
      })();
    }
    if (action === 'report') {
      toast.success('Success, we will take a look at this property.');
    }
  };

  const transactionBadgeClass =
    property.transactionType === TransactionType.ForSale
      ? 'bg-green-500 text-white'
      : 'bg-yellow-500 text-white';

  return (
    <div
      onClick={handleSelectProperty}
      className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-none transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
    >
      <div className="flex items-center gap-x-1">
        {enableOwnedBadge && isOwner && (
          <span className="inline-block h-5 rounded bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
            Owned
          </span>
        )}
        <PropertyBadge type={property.type} />
        <span className="text-slate-400">|</span>
        <span
          className={`inline-block h-5 rounded px-2 py-0.5 text-xs font-medium ${transactionBadgeClass}`}
        >
          For {property.transactionType}
        </span>

        <span
          className={`ml-auto text-sm text-slate-500 dark:text-slate-400 ${isOwner ? 'mr-9' : ''}`}
        >
          {formatDate(property.createdAt)}
        </span>

        {isOwner && (
          <button
            onClick={handleOpenPopup}
            className="absolute right-3 top-2 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gray-300 p-2 transition-colors duration-300 ease-in-out hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
          >
            <EllipsisIcon />
          </button>
        )}
      </div>

      <div className="mt-2 flex items-center text-sm text-slate-900 dark:text-white lg:mt-2">
        <span className="text-base font-light lg:text-lg">
          {truncateText(property.name, 30)}
        </span>
        <span className="px-2 text-slate-400">|</span>
        <span className="hidden font-light md:block md:text-lg">
          {truncateText(property.description, 40)}
        </span>

        <span className="ml-auto font-light md:text-lg xl:text-xl">
          {formatCurrency(property.price, property.currency)}
        </span>
      </div>

      <ActionPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onAction={handleAction}
        showMessage={false}
        showEdit={false}
        showReport={false}
        showDelete={true}
        anchorEl={anchorEl}
      />
    </div>
  );
}
