import { useEffect, useState, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRestriction } from '@/hooks/useRestriction';
import { useAppDispatch } from '@/store/hooks';
import { store } from '@/store/store';
import { createPropertiesService } from '@/services/propertiesService';
import type { Property } from '@/types';
import { PropertyType, TransactionType, PaymentFrequency } from '@/types';

interface PropertyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  onSuccess?: (property: Property) => void;
}

interface PropertyFormData {
  name: string;
  address: string;
  description: string;
  type: PropertyType;
  transactionType: TransactionType;
  price: string;
  paymentFrequency: PaymentFrequency;
  currency: string;
  features: string;
  lat: string;
  lng: string;
}

const PROPERTY_TYPES = [
  { label: 'Residential', value: PropertyType.Residential },
  { label: 'Commercial', value: PropertyType.Commercial },
  { label: 'Industrial', value: PropertyType.Industrial },
  { label: 'Land', value: PropertyType.Land },
];

const TRANSACTION_TYPES = [
  { label: 'For Sale', value: TransactionType.ForSale },
  { label: 'For Rent', value: TransactionType.ForRent },
];

const PAYMENT_FREQUENCIES = [
  { label: 'Yearly', value: PaymentFrequency.Yearly },
  { label: 'Quarterly', value: PaymentFrequency.Quarterly },
  { label: 'Monthly', value: PaymentFrequency.Monthly },
  { label: 'Bi-Weekly', value: PaymentFrequency.BiWeekly },
  { label: 'Weekly', value: PaymentFrequency.Weekly },
  { label: 'Daily', value: PaymentFrequency.Daily },
];

export function PropertyEditModal({
  isOpen,
  onClose,
  property,
  onSuccess,
}: PropertyEditModalProps): React.ReactElement | null {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const { restricted, showAlert } = useRestriction();

  const propertiesService = useMemo(
    () => createPropertiesService(dispatch, () => store.getState()),
    [dispatch]
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<PropertyFormData>({
    mode: 'onChange',
    defaultValues: {
      name: property.name,
      address: property.address,
      description: property.description ?? '',
      type: property.type,
      transactionType: property.transactionType,
      price: String(property.price),
      paymentFrequency: property.paymentFrequency ?? PaymentFrequency.Monthly,
      currency: property.currency ?? '',
      features: property.features?.join(', ') ?? '',
      lat: String(property.position.lat),
      lng: String(property.position.lng),
    },
  });

  const transactionType = watch('transactionType');

  useEffect(() => {
    if (isOpen) {
      reset({
        name: property.name,
        address: property.address,
        description: property.description ?? '',
        type: property.type,
        transactionType: property.transactionType,
        price: String(property.price),
        paymentFrequency: property.paymentFrequency ?? PaymentFrequency.Monthly,
        currency: property.currency ?? '',
        features: property.features?.join(', ') ?? '',
        lat: String(property.position.lat),
        lng: String(property.position.lng),
      });
    }
  }, [isOpen, property, reset]);

  const onSubmit: SubmitHandler<PropertyFormData> = async (data) => {
    if (restricted) {
      onClose();
      await showAlert();
      return;
    }

    setIsSubmitting(true);

    try {
      const featuresArray = data.features
        .split(',')
        .map((f) => f.trim())
        .filter((f) => f !== '');

      const updatedProperty: Property = {
        ...property,
        name: data.name,
        address: data.address,
        description: data.description,
        type: data.type,
        transactionType: data.transactionType,
        price: parseFloat(data.price) || 0,
        paymentFrequency: data.paymentFrequency,
        currency: data.currency,
        features: featuresArray,
        position: {
          lat: parseFloat(data.lat) || 0,
          lng: parseFloat(data.lng) || 0,
        },
      };

      const result = await propertiesService.updateProperty(updatedProperty);

      if (result) {
        toast.success('Property updated successfully');
        onSuccess?.(result);
        onClose();
      } else {
        toast.error('Failed to update property');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update property';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenMap = (): void => {
    toast('Map picker coming soon', { icon: 'info' });
  };

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    void handleSubmit(onSubmit)(e);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Property Details" size="lg">
      <form onSubmit={handleFormSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-2">
        <Input
          label="Name"
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 4, message: 'Name must be at least 4 characters' },
          })}
          error={errors.name?.message}
        />

        <Input
          label="Address"
          {...register('address', { required: 'Address is required' })}
          error={errors.address?.message}
        />

        <div className="w-full">
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            {...register('description', {
              required: 'Description is required',
              minLength: { value: 10, message: 'Description must be at least 10 characters' },
            })}
            className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
              errors.description
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            rows={3}
            placeholder="Property description..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="border-t pt-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">Property Type</label>
          <div className="space-y-2">
            {PROPERTY_TYPES.map((type) => (
              <label key={type.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={type.value}
                  {...register('type')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">Transaction Type</label>
          <div className="space-y-2">
            {TRANSACTION_TYPES.map((type) => (
              <label key={type.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={type.value}
                  {...register('transactionType')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {transactionType === TransactionType.ForRent && (
          <div className="border-t pt-4">
            <label
              htmlFor="paymentFrequency"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Payment Frequency
            </label>
            <select
              id="paymentFrequency"
              {...register('paymentFrequency')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PAYMENT_FREQUENCIES.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="border-t pt-4">
          <Input
            label="Price"
            type="number"
            {...register('price')}
            error={errors.price?.message}
          />
        </div>

        <Input
          label="Currency"
          {...register('currency', { maxLength: { value: 3, message: 'Max 3 characters' } })}
          error={errors.currency?.message}
          placeholder="USD"
        />

        <div className="border-t pt-4">
          <div className="w-full">
            <label htmlFor="features" className="mb-1 block text-sm font-medium text-gray-700">
              Features
            </label>
            <textarea
              id="features"
              {...register('features')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="bedroom, kitchen, ..."
            />
            <p className="mt-1 text-xs text-gray-500">
              For multiple features, separate with comma (,)
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Set Marker Position</span>
            <Button type="button" variant="outline" size="sm" onClick={handleOpenMap}>
              Open Map
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              {...register('lat', { required: 'Latitude is required' })}
              error={errors.lat?.message}
              placeholder="Latitude"
            />
            <Input
              label="Longitude"
              {...register('lng', { required: 'Longitude is required' })}
              error={errors.lng?.message}
              placeholder="Longitude"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            isLoading={isSubmitting}
            disabled={!isValid || isSubmitting}
          >
            Update
          </Button>
        </div>
      </form>
    </Modal>
  );
}
