import { useNavigate } from 'react-router-dom';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
} from '@ionic/react';
import { PropertyBadge } from '@/components/shared';
import { useAppSelector } from '@/store';
import { selectAuthUser } from '@/store/slices/authSlice';
import type { Property } from '@/types';
import { TransactionType } from '@/types';

interface PropertyCardProps {
  property: Property;
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

export function PropertyCard({ property }: PropertyCardProps): React.ReactElement {
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);

  const isOwner = user?.user_id === property.user_id;
  const isForRent = property.transactionType === TransactionType.ForRent;

  const handleSelectProperty = (): void => {
    void navigate(`/properties/${property.property_id}`);
  };

  const getBadgeClass = (): string => {
    if (isOwner) return 'bg-blue-500';
    if (isForRent) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getBadgeText = (): string => {
    if (isOwner) return 'Owned';
    return `For ${property.transactionType}`;
  };

  return (
    <IonCard className="relative m-0 flex h-full w-full max-w-[360px] flex-col shadow-none outline outline-slate-200 dark:outline-slate-800">
      <div
        className={`tag absolute z-10 rounded-br-lg bg-opacity-80 px-3 py-1 font-bold sm:px-3 sm:text-[18px] ${getBadgeClass()}`}
      >
        <span className="capitalize text-white">{getBadgeText()}</span>
      </div>

      <div
        className="group h-[230px] cursor-pointer overflow-hidden"
        onClick={handleSelectProperty}
      >
        {!property.images || property.images.length === 0 ? (
          <img
            className="h-full w-full object-cover"
            src="/assets/images/no-image.jpeg"
            alt="No image available"
          />
        ) : (
          <img
            className="h-full w-full object-cover transition-all duration-300 ease-in-out group-hover:scale-125"
            src={property.images[0]}
            alt={property.name}
          />
        )}
      </div>

      <IonCardHeader className="px-3 py-2">
        <PropertyBadge type={property.type} />
        <IonCardTitle className="line-clamp-1 text-ellipsis text-[16px] sm:text-[20px]">
          {property.name}
        </IonCardTitle>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(property.createdAt)}
        </div>
      </IonCardHeader>

      <IonCardContent className="flex flex-grow flex-col px-3">
        <div className="mb-3 line-clamp-3 h-[100px] overflow-hidden text-ellipsis">
          <p className="line-clamp-3 h-[60px] overflow-hidden text-ellipsis">
            {property.description}
          </p>
        </div>

        <div className="price mt-auto font-bold sm:text-[18px]">
          {formatCurrency(property.price, property.currency)}
          {isForRent && property.paymentFrequency && (
            <span className="ml-1 text-[16px] capitalize">
              | {property.paymentFrequency}
            </span>
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
