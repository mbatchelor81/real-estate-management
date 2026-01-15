import { useNavigate } from 'react-router-dom';
import { IonCard, IonCardContent, IonBadge, IonIcon, IonText } from '@ionic/react';
import { ellipsisVerticalOutline } from 'ionicons/icons';
import { PropertyBadge } from '@/components/shared';
import type { Property } from '@/types';
import { TransactionType } from '@/types';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';

interface PropertyListItemProps {
  property: Property;
  enableOwnedBadge?: boolean;
  enablePopupOptions?: boolean;
  onPopupOpen?: (event: React.MouseEvent, property: Property) => void;
}

function formatCurrency(amount: number, currency = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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

export function PropertyListItem({
  property,
  enableOwnedBadge = false,
  enablePopupOptions = false,
  onPopupOpen,
}: PropertyListItemProps): React.ReactElement {
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);

  const isOwner = user?.user_id === property.user_id;
  const isForSale = property.transactionType === TransactionType.ForSale;

  const handleSelectProperty = (): void => {
    void navigate(`/properties/${property.property_id}`);
  };

  const handlePopupClick = (event: React.MouseEvent): void => {
    event.stopPropagation();
    onPopupOpen?.(event, property);
  };

  return (
    <IonCard
      onClick={handleSelectProperty}
      className="cursor-pointer border border-slate-200 shadow-none dark:border-slate-800"
    >
      <IonCardContent>
        <div className="flex gap-x-1">
          {enableOwnedBadge && isOwner && (
            <IonBadge className="h-5 bg-blue-500 p-1">Owned</IonBadge>
          )}
          <PropertyBadge type={property.type} />
          <span className="mx-1">|</span>
          <IonBadge
            className={`h-5 p-1 ${isForSale ? 'bg-green-500' : 'bg-amber-500'}`}
          >
            For {property.transactionType}
          </IonBadge>

          <span className={`ml-auto mr-0 text-sm text-gray-500 ${isOwner ? 'mr-9' : ''}`}>
            {formatDate(property.createdAt)}
          </span>

          {enablePopupOptions && isOwner && (
            <button
              onClick={handlePopupClick}
              className="absolute right-3 top-2 flex size-[30px] items-center justify-center rounded-full bg-gray-300 p-2 transition-colors duration-300 ease-in-out hover:bg-gray-400"
              id="popup-trigger-button"
              type="button"
            >
              <IonIcon color="dark" icon={ellipsisVerticalOutline as string} />
            </button>
          )}
        </div>

        <div className="flex items-center text-[14px] text-gray-900 dark:text-white lg:mt-2">
          <IonText className="text-[16px] font-light lg:text-[18px]">
            {truncateText(property.name, 30)}
          </IonText>
          <span className="px-2">|</span>
          <IonText className="hidden font-light md:block md:text-[18px]">
            {truncateText(property.description, 40)}
          </IonText>

          <span className="ml-auto mr-0 font-light md:text-[18px] xl:text-[20px]">
            {formatCurrency(property.price, property.currency)}
          </span>
        </div>
      </IonCardContent>
    </IonCard>
  );
}
