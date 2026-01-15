import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IonCard,
  IonCardContent,
  IonBadge,
  IonText,
  IonIcon,
  useIonToast,
} from '@ionic/react';
import { ellipsisVerticalOutline } from 'ionicons/icons';
import { PropertyBadge, ActionPopup } from '@/components/shared';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectAuthUser } from '@/store/slices/authSlice';
import { createPropertiesService } from '@/services/propertiesService';
import type { Property } from '@/types';
import { TransactionType } from '@/types';
import type { RootState } from '@/store';

interface PropertyListItemProps {
  property: Property;
  enableOwnedBadge?: boolean;
  enablePopupOptions?: boolean;
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
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function PropertyListItem({
  property,
  enableOwnedBadge = true,
  enablePopupOptions = false,
}: PropertyListItemProps): React.ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [present] = useIonToast();
  const user = useAppSelector(selectAuthUser);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupAnchor, setPopupAnchor] = useState<HTMLButtonElement | null>(null);
  const popupAnchorRef = useRef<HTMLButtonElement>(null);

  const isOwner = user?.user_id === property.user_id;
  const isForSale = property.transactionType === TransactionType.ForSale;

  const handleSelectProperty = (): void => {
    void navigate(`/properties/${property.property_id}`);
  };

  const handleOpenPopup = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setPopupAnchor(popupAnchorRef.current);
    setIsPopupOpen(true);
  };

  const handleClosePopup = (): void => {
    setIsPopupOpen(false);
  };

  const handlePopupAction = useCallback(
    async (action: string): Promise<void> => {
      if (action === 'delete') {
        const propertiesService = createPropertiesService(
          dispatch,
          () => ({} as RootState)
        );
        const success = await propertiesService.removeProperty(property.property_id);
        if (success) {
          propertiesService.removePropertyFromState(property.property_id);
          void present({
            message: 'Property deleted successfully',
            color: 'success',
            duration: 4000,
          });
          void navigate('/properties');
        }
      }
      if (action === 'report') {
        void present({
          message: 'Success, we will take a look at this property.',
          color: 'success',
          duration: 5000,
        });
      }
    },
    [dispatch, navigate, present, property.property_id]
  );

  return (
    <>
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
              className={`h-5 p-1 ${isForSale ? 'bg-green-500' : 'bg-yellow-500'}`}
            >
              For {property.transactionType}
            </IonBadge>

            <span className={`ml-auto mr-0 ${isOwner ? 'mr-9' : ''}`}>
              {formatDate(property.createdAt)}
            </span>

            {enablePopupOptions && isOwner && (
              <button
                ref={popupAnchorRef}
                onClick={handleOpenPopup}
                className="absolute right-3 top-2 flex size-[30px] items-center justify-center rounded-full bg-gray-300 p-2 transition-colors duration-300 ease-in-out hover:bg-gray-400"
                id="popup-trigger-button"
              >
                <IonIcon color="dark" icon={ellipsisVerticalOutline} />
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

      {enablePopupOptions && isOwner && (
        <ActionPopup
          isOpen={isPopupOpen}
          onClose={handleClosePopup}
          onAction={(action: string) => void handlePopupAction(action)}
          showMessage={false}
          showEdit={false}
          showReport={false}
          showDelete={true}
          anchorEl={popupAnchor}
        />
      )}
    </>
  );
}
