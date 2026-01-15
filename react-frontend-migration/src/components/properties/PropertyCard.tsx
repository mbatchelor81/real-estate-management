import { useNavigate } from 'react-router-dom';
import { IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonButton } from '@ionic/react';
import { PropertyBadge } from '@/components/shared';
import type { Property } from '@/types';
import { TransactionType } from '@/types';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';

interface PropertyCardProps {
  property: Property;
}

const NO_IMAGE_PLACEHOLDER = '/assets/images/no-image.jpeg';

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

export function PropertyCard({ property }: PropertyCardProps): React.ReactElement {
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);

  const isOwned = user?.user_id === property.user_id;
  const isForRent = property.transactionType === TransactionType.ForRent;

  const handleSelectProperty = (): void => {
    void navigate(`/properties/${property.property_id}`);
  };

  const tagColorClass = isOwned
    ? 'bg-blue-500'
    : isForRent
      ? 'bg-amber-500'
      : 'bg-green-500';

  const imageUrl =
    property.images && property.images.length > 0
      ? property.images[0]
      : NO_IMAGE_PLACEHOLDER;

  return (
    <IonCard className="relative m-0 flex h-full w-full max-w-[360px] flex-col shadow-none outline outline-slate-200 dark:outline-slate-800">
      <div
        className={`tag absolute z-10 rounded-br-lg bg-opacity-80 px-3 py-1 font-bold sm:px-3 sm:text-[18px] text-white ${tagColorClass}`}
      >
        {isOwned ? (
          <span>Owned</span>
        ) : (
          <span className="capitalize">For {property.transactionType}</span>
        )}
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

      <IonCardHeader className="px-3 py-2">
        <PropertyBadge type={property.type} />
        <IonCardTitle className="line-clamp-1 text-ellipsis text-[16px] sm:text-[20px]">
          {property.name}
        </IonCardTitle>
        <div className="text-sm text-gray-500">{formatDate(property.createdAt)}</div>
      </IonCardHeader>

      <IonCardContent className="flex flex-grow flex-col px-3">
        <div className="mb-3 h-[100px] overflow-hidden text-ellipsis line-clamp-3">
          <p className="h-[60px] overflow-hidden text-ellipsis line-clamp-3">
            {property.description}
          </p>
        </div>

        <div className="price mt-auto font-bold sm:text-[18px]">
          {formatCurrency(property.price, property.currency)}
          {isForRent && property.paymentFrequency && (
            <span className="text-[16px] capitalize"> | {property.paymentFrequency}</span>
          )}
        </div>

        <IonButton
          onClick={handleSelectProperty}
          expand="block"
          className="ion-margin-top"
          color="primary"
        >
          View property
        </IonButton>
      </IonCardContent>
    </IonCard>
  );
}
