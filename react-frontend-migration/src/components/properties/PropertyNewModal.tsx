import { useState, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Modal, Button, Input } from '@/components/ui';
import { PropertyCoordinatesModal } from './PropertyCoordinatesModal';
import { useRestriction } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { createPropertiesService } from '@/services';
import {
  PropertyType,
  TransactionType,
  PaymentFrequency,
  type Coord,
  type Property,
} from '@/types';

interface PropertyNewModalProps {
  isOpen: boolean;
  onClose: () => void;
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

const DEFAULT_FORM_VALUES: PropertyFormData = {
  name: '',
  address: '',
  description: '',
  type: PropertyType.Residential,
  transactionType: TransactionType.ForSale,
  price: '',
  paymentFrequency: PaymentFrequency.Monthly,
  currency: 'PHP',
  features: '',
  lat: '0',
  lng: '0',
};

export function PropertyNewModal({
  isOpen,
  onClose,
  onSuccess,
}: PropertyNewModalProps): React.ReactElement | null {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const dispatch = useAppDispatch();
  const getState = useAppSelector((state): (() => RootState) => () => state);
  const propertiesService = useMemo(
    () => createPropertiesService(dispatch, getState),
    [dispatch, getState]
  );
  const { restricted, showAlert } = useRestriction();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors },
  } = useForm<PropertyFormData>({
    defaultValues: DEFAULT_FORM_VALUES,
    mode: 'onChange',
  });

  const transactionType = watch('transactionType');
  const lat = watch('lat');
  const lng = watch('lng');

  const validateStepOne = useCallback(async (): Promise<boolean> => {
    const result = await trigger(['name', 'address', 'description', 'type', 'transactionType']);
    return result;
  }, [trigger]);

  const validateStepTwo = useCallback(async (): Promise<boolean> => {
    const result = await trigger(['price', 'currency', 'lat', 'lng']);
    return result;
  }, [trigger]);

  const handleNext = useCallback(async () => {
    if (step === 1) {
      const isValid = await validateStepOne();
      if (isValid) {
        setStep(2);
      } else {
        toast.error('Please fill in all required fields correctly');
      }
    }
  }, [step, validateStepOne]);

  const handleBack = useCallback(() => {
    if (step === 2) {
      setStep(1);
    }
  }, [step]);

  const handleOpenMap = useCallback(() => {
    setIsMapModalOpen(true);
  }, []);

  const handleMapConfirm = useCallback(
    (coord: Coord) => {
      setValue('lat', coord.lat.toString(), { shouldValidate: true });
      setValue('lng', coord.lng.toString(), { shouldValidate: true });
      setIsMapModalOpen(false);
    },
    [setValue]
  );

  const handleClose = useCallback(() => {
    reset(DEFAULT_FORM_VALUES);
    setStep(1);
    setIsSubmitting(false);
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (data: PropertyFormData): Promise<void> => {
      if (step === 1) {
        await handleNext();
        return;
      }

      const isValid = await validateStepTwo();
      if (!isValid) {
        toast.error('Please fill in all required fields correctly');
        return;
      }

      if (restricted) {
        handleClose();
        await showAlert();
        return;
      }

      setIsSubmitting(true);

      try {
        const featuresArray = data.features
          .split(',')
          .map((f) => f.trim())
          .filter((f) => f !== '');

        const propertyData: Omit<Property, 'property_id'> = {
          name: data.name,
          address: data.address,
          description: data.description,
          type: data.type,
          transactionType: data.transactionType,
          price: parseFloat(data.price) || 0,
          paymentFrequency:
            data.transactionType === TransactionType.ForRent
              ? data.paymentFrequency
              : undefined,
          currency: data.currency,
          features: featuresArray.length > 0 ? featuresArray : undefined,
          position: {
            lat: parseFloat(data.lat) || 0,
            lng: parseFloat(data.lng) || 0,
          },
          user_id: '',
        };

        const result = await propertiesService.addProperty(propertyData);

        if (result) {
          toast.success('Property created successfully');
          propertiesService.addPropertyToState(result);
          onSuccess?.(result);
          handleClose();
        } else {
          toast.error('Failed to create property');
        }
      } catch (error) {
        console.error('Failed to create property:', error);
        toast.error('Failed to create property');
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      step,
      handleNext,
      validateStepTwo,
      restricted,
      showAlert,
      propertiesService,
      onSuccess,
      handleClose,
    ]
  );

  const currentCoord = useMemo((): Coord | undefined => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!isNaN(latNum) && !isNaN(lngNum) && (latNum !== 0 || lngNum !== 0)) {
      return { lat: latNum, lng: lngNum };
    }
    return undefined;
  }, [lat, lng]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Add New Property" size="lg">
        <form
          onSubmit={(e): void => {
            void handleSubmit(onSubmit)(e);
          }}
          className="space-y-4"
        >
          {step === 1 && (
            <div className="space-y-4">
              <Controller
                name="name"
                control={control}
                rules={{
                  required: 'Property name is required',
                  minLength: {
                    value: 4,
                    message: 'Name must be at least 4 characters',
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Name"
                    placeholder="Enter property name"
                    error={errors.name?.message}
                    helperText="Enter property name"
                  />
                )}
              />

              <Controller
                name="address"
                control={control}
                rules={{ required: 'Address is required' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Address"
                    placeholder="Enter property physical address"
                    error={errors.address?.message}
                    helperText="Enter property physical address"
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                rules={{
                  required: 'Description is required',
                  minLength: {
                    value: 10,
                    message: 'Description must be at least 10 characters',
                  },
                }}
                render={({ field }) => (
                  <div className="w-full">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      {...field}
                      className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                        errors.description
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                      rows={3}
                      placeholder="Enter property description..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                    {!errors.description && (
                      <p className="mt-1 text-sm text-gray-500">Enter property description</p>
                    )}
                  </div>
                )}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Property Type</label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2">
                      {PROPERTY_TYPES.map((type) => (
                        <label
                          key={type.value}
                          className={`flex cursor-pointer items-center rounded-md border p-3 transition-colors ${
                            field.value === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            {...field}
                            value={type.value}
                            checked={field.value === type.value}
                            className="mr-2"
                          />
                          <span className="text-sm capitalize">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
                <Controller
                  name="transactionType"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-4">
                      {TRANSACTION_TYPES.map((type) => (
                        <label
                          key={type.value}
                          className={`flex flex-1 cursor-pointer items-center justify-center rounded-md border p-3 transition-colors ${
                            field.value === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            {...field}
                            value={type.value}
                            checked={field.value === type.value}
                            className="mr-2"
                          />
                          <span className="text-sm">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {transactionType === TransactionType.ForRent && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Frequency
                  </label>
                  <Controller
                    name="paymentFrequency"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {PAYMENT_FREQUENCIES.map((freq) => (
                          <option key={freq.value} value={freq.value}>
                            {freq.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>
              )}

              <Controller
                name="price"
                control={control}
                rules={{
                  required: 'Price is required',
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message: 'Please enter a valid price',
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Price"
                    placeholder="Enter property price"
                    error={errors.price?.message}
                    helperText="Enter property price"
                  />
                )}
              />

              <Controller
                name="currency"
                control={control}
                rules={{
                  maxLength: {
                    value: 3,
                    message: 'Currency code must be 3 characters or less',
                  },
                  pattern: {
                    value: /^[a-zA-Z]*$/,
                    message: 'Currency must contain only letters',
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Currency"
                    placeholder="USD, PHP, SGD"
                    error={errors.currency?.message}
                    helperText="Enter property currency"
                  />
                )}
              />

              <Controller
                name="features"
                control={control}
                render={({ field }) => (
                  <div className="w-full">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Features</label>
                    <textarea
                      {...field}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="bedroom, kitchen, garage..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      For multiple features, separate with comma (,)
                    </p>
                  </div>
                )}
              />

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Set Marker Position</span>
                  <Button type="button" size="sm" onClick={handleOpenMap}>
                    Open Map
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="lat"
                    control={control}
                    rules={{
                      required: 'Latitude is required',
                      validate: (value) => {
                        const num = parseFloat(value);
                        if (isNaN(num)) return 'Invalid latitude';
                        if (num < -90 || num > 90) return 'Latitude must be between -90 and 90';
                        return true;
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        label="Latitude"
                        placeholder="Latitude"
                        error={errors.lat?.message}
                      />
                    )}
                  />

                  <Controller
                    name="lng"
                    control={control}
                    rules={{
                      required: 'Longitude is required',
                      validate: (value) => {
                        const num = parseFloat(value);
                        if (isNaN(num)) return 'Invalid longitude';
                        if (num < -180 || num > 180)
                          return 'Longitude must be between -180 and 180';
                        return true;
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        label="Longitude"
                        placeholder="Longitude"
                        error={errors.lng?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-sm text-gray-500">Step {step} / 2</div>
            <div className="flex gap-3">
              {step === 2 && (
                <Button type="button" variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {step === 2 ? 'Submit' : 'Next'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <PropertyCoordinatesModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onConfirm={handleMapConfirm}
        initialCoord={currentCoord}
      />
    </>
  );
}
