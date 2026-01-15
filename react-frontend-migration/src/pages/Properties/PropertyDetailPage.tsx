import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Modal,
  LoadingSpinner,
} from '@/components/ui';
import {
  PropertyBadge,
  PropertyGallery,
  ContactForm,
  Footer,
} from '@/components/shared';
import { ActionPopup } from '@/components/shared/ActionPopup';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectAuthUser } from '@/store/slices/authSlice';
import {
  createPropertiesService,
  getCurrentProperty,
  getPropertiesLoading,
} from '@/services/propertiesService';
import { useRestriction } from '@/hooks';
import type { Property } from '@/types';
import { PropertyType, TransactionType, PaymentFrequency } from '@/types';

interface PropertyEditFormData {
  name: string;
  address: string;
  description: string;
  type: PropertyType;
  transactionType: TransactionType;
  price: number;
  paymentFrequency: PaymentFrequency;
  currency: string;
  features: string;
  lat: number;
  lng: number;
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

const BackIcon = (): React.ReactElement => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

const EllipsisIcon = (): React.ReactElement => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
    />
  </svg>
);

const MapIcon = (): React.ReactElement => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const BookmarkIcon = (): React.ReactElement => (
  <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
    />
  </svg>
);

export default function PropertyDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const currentProperty = useAppSelector(getCurrentProperty);
  const isLoading = useAppSelector(getPropertiesLoading);
  const { restricted, showAlert } = useRestriction();

  const [property, setProperty] = useState<Property | null>(null);
  const [ready, setReady] = useState(false);
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const actionButtonRef = useRef<HTMLButtonElement>(null);

  const propertiesService = useMemo(
    () =>
      createPropertiesService(dispatch, () => ({
        properties: {
          properties: [],
          ownedProperties: [],
          currentProperty: null,
          isLoading: false,
          error: null,
          hasMore: true,
          lastCreatedAt: null,
          lastPrice: null,
          lastName: null,
        },
        auth: {
          user,
          isAuthenticated: !!user,
          isLoading: false,
          error: null,
          isInitialized: true,
        },
        ui: {
          isDarkTheme: false,
          isRestrictedMode: false,
          sideMenuOpen: false,
          isLoading: false,
        },
        enquiries: {
          enquiries: [],
          currentEnquiry: null,
          isLoading: false,
          error: null,
          initialFetchDone: false,
        },
        activities: { activities: [], isLoading: false, error: null },
        notifications: {
          notifications: [],
          isLoading: false,
          error: null,
          initialFetchDone: false,
        },
      })),
    [dispatch, user]
  );

  const isOwner = useMemo((): boolean => {
    if (!user || !property) return false;
    return user.user_id === property.user_id;
  }, [user, property]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PropertyEditFormData>();

  const watchTransactionType = watch('transactionType');

  const fetchPropertyDetails = useCallback(async (): Promise<void> => {
    if (!id) return;
    try {
      const result = await propertiesService.fetchProperty(id);
      if (result) {
        setProperty(result);
        propertiesService.setCurrentPropertyState(result);
      }
    } catch (error) {
      console.error('Failed to fetch property:', error);
    } finally {
      setReady(true);
    }
  }, [id, propertiesService]);

  useEffect(() => {
    void fetchPropertyDetails();
  }, [fetchPropertyDetails]);

  useEffect(() => {
    if (currentProperty && currentProperty.property_id === id) {
      setProperty(currentProperty);
    }
  }, [currentProperty, id]);

  useEffect(() => {
    if (property && showEditModal) {
      reset({
        name: property.name,
        address: property.address,
        description: property.description ?? '',
        type: property.type,
        transactionType: property.transactionType,
        price: property.price,
        paymentFrequency: property.paymentFrequency ?? PaymentFrequency.Monthly,
        currency: property.currency ?? 'USD',
        features: property.features?.join(', ') ?? '',
        lat: property.position.lat,
        lng: property.position.lng,
      });
    }
  }, [property, showEditModal, reset]);

  const handleGoBack = (): void => {
    void navigate(-1);
  };

  const handleFindInMap = (): void => {
    if (!property) return;
    const { lat, lng } = property.position;
    void navigate(`/map?lat=${String(lat)}&lng=${String(lng)}`);
  };

  const handleAction = (action: 'message' | 'edit' | 'report' | 'delete'): void => {
    switch (action) {
      case 'delete':
        if (restricted) {
          void showAlert();
          return;
        }
        setShowDeleteConfirm(true);
        break;
      case 'edit':
        setShowEditModal(true);
        break;
      case 'report':
        toast.success('Success, we will take a look at this property.', {
          duration: 5000,
          icon: '⚠️',
        });
        break;
      default:
        break;
    }
  };

  const handleDeleteProperty = async (): Promise<void> => {
    if (!property) return;
    setIsSubmitting(true);
    try {
      const success = await propertiesService.removeProperty(property.property_id);
      if (success) {
        propertiesService.removePropertyFromState(property.property_id);
        toast.success('Property deleted successfully');
        void navigate('/properties');
      } else {
        toast.error('Failed to delete property');
      }
    } catch (error) {
      console.error('Failed to delete property:', error);
      toast.error('Failed to delete property');
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEditSubmit = async (data: PropertyEditFormData): Promise<void> => {
    if (!property) return;
    if (restricted) {
      setShowEditModal(false);
      void showAlert();
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
        price: data.price,
        paymentFrequency: data.paymentFrequency,
        currency: data.currency,
        features: featuresArray,
        position: { lat: data.lat, lng: data.lng },
      };

      const result = await propertiesService.updateProperty(updatedProperty);
      if (result) {
        setProperty(result);
        propertiesService.updatePropertyInStateAction(result);
        toast.success('Property updated successfully');
        setShowEditModal(false);
      } else {
        toast.error('Failed to update property');
      }
    } catch (error) {
      console.error('Failed to update property:', error);
      toast.error('Failed to update property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    setSelectedFiles(fileArray);

    const previewPromises = fileArray.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e): void => {
            resolve(e.target?.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    try {
      const previewResults = await Promise.all(previewPromises);
      setPreviews(previewResults);
    } catch (error) {
      console.error('Failed to generate previews:', error);
    }
  };

  const handleRemovePreview = (index: number): void => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadImages = async (): Promise<void> => {
    if (!property || selectedFiles.length === 0) {
      toast.error('Please select images to upload');
      return;
    }

    if (restricted) {
      void showAlert();
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await propertiesService.addPropertyImage(
        selectedFiles,
        property.property_id
      );
      if (response.success) {
        const updatedImages = [...(property.images ?? []), ...response.data];
        setProperty({ ...property, images: updatedImages });
        toast.success('Images uploaded successfully');
        setShowUploadModal(false);
        setSelectedFiles([]);
        setPreviews([]);
      } else {
        toast.error(response.message ?? 'Failed to upload images');
      }
    } catch (error) {
      console.error('Failed to upload images:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditImages = (): void => {
    setShowUploadModal(true);
  };

  const handleContactSubmit = (): void => {
    toast.success('Your enquiry has been sent to the property owner');
  };

  const formatPrice = (price: number, currency?: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency ?? 'USD',
    }).format(price);
  };

  if (!ready || isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-16">
        <LoadingSpinner size="lg" />
        <p className="mt-5 text-gray-600">
          Fetching Property Details, this won&apos;t take long...
        </p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-2 py-8 shadow-none">
          <CardHeader className="px-4 py-2">
            <h1 className="text-center text-[42px]">Error 404</h1>
          </CardHeader>
          <CardContent>
            <h5 className="text-center text-[24px]">
              <strong>Property</strong> not found. It may not exist or has been
              removed.
            </h5>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <BackIcon />
            </button>
            <h1 className="text-lg font-semibold">Property Detail</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto min-h-screen max-w-[1600px] px-4 pb-[100px] pt-0 xl:pt-10">
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <Card className="border border-slate-200 dark:border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white lg:text-2xl">
                      {property.name}
                    </h2>
                    <div className="mt-2">
                      <PropertyBadge type={property.type} />
                    </div>
                  </div>
                  <button
                    ref={actionButtonRef}
                    onClick={() => setShowActionPopup(true)}
                    className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <EllipsisIcon />
                  </button>
                </div>
              </CardContent>
            </Card>

            {property.images && property.images.length > 0 && (
              <PropertyGallery
                images={property.images}
                showEdit={isOwner}
                onEdit={handleEditImages}
              />
            )}

            <Card className="border border-slate-200 shadow-none dark:border-slate-800">
              <CardHeader className="px-4 py-2">
                <span className="text-sm text-gray-500">Transaction Type</span>
                <span className="text-[20px] font-semibold capitalize">
                  For {property.transactionType}
                </span>
              </CardHeader>
            </Card>

            <Card className="border border-slate-200 shadow-none dark:border-slate-800">
              <CardHeader className="px-4 py-2">Description</CardHeader>
              <CardContent className="text-[16px] lg:text-[18px]">
                {property.description ?? 'No description available.'}
              </CardContent>
            </Card>

            {property.features && property.features.length > 0 && (
              <Card className="border border-slate-200 shadow-none dark:border-slate-800">
                <CardHeader className="px-4 py-2">Features</CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature, index) => (
                      <span
                        key={`${feature}-${String(index)}`}
                        className="inline-flex items-center rounded bg-blue-500 px-2 py-1 text-sm text-white lg:px-3 lg:py-2"
                      >
                        <BookmarkIcon />
                        {feature}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border border-slate-200 shadow-none dark:border-slate-800">
              <CardHeader className="px-4 py-2">Address</CardHeader>
              <CardContent className="lg:text-[18px]">{property.address}</CardContent>
            </Card>

            {property.price > 0 && (
              <Card className="border border-slate-200 shadow-none dark:border-slate-800">
                <CardHeader className="px-4 py-2">Price</CardHeader>
                <CardContent>
                  <span className="text-[20px] font-medium lg:text-[24px]">
                    {formatPrice(property.price, property.currency)}
                  </span>
                  {property.transactionType === TransactionType.ForRent &&
                    property.paymentFrequency && (
                      <span className="ml-2 text-[18px] capitalize">
                        | {property.paymentFrequency}
                      </span>
                    )}
                </CardContent>
              </Card>
            )}

            {!isOwner && (
              <Card className="border border-slate-200 dark:border-slate-800">
                <CardHeader className="px-4 py-2">
                  <CardTitle>Enquire for more Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContactForm onSubmitSuccess={handleContactSubmit} />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-5">
            <Card className="border border-slate-200 shadow-none dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between bg-blue-600 px-4 py-2 md:py-3">
                <CardTitle className="text-white">Map View</CardTitle>
                <MapIcon />
              </CardHeader>
              <CardContent className="pb-4">
                <p className="px-3 py-4 text-[16px]">
                  Maps can be a useful tool for viewing properties location & filter
                  them by types. This also helps us to know distances so that we know
                  how far away one thing is from another.
                </p>
                <Button
                  onClick={handleFindInMap}
                  fullWidth
                  size="lg"
                  className="capitalize"
                >
                  <MapIcon />
                  <span className="mx-1">Find in Map</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      <ActionPopup
        isOpen={showActionPopup}
        onClose={() => setShowActionPopup(false)}
        onAction={handleAction}
        showMessage={false}
        showEdit={isOwner}
        showDelete={isOwner}
        anchorEl={actionButtonRef.current}
      />

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Are you sure?"
      >
        <p className="mb-4 text-gray-600">
          You are about to delete this property. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => void handleDeleteProperty()}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? 'Deleting...' : 'DELETE'}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Property"
        size="lg"
      >
        <form
          onSubmit={(e): void => {
            void handleSubmit(handleEditSubmit)(e);
          }}
          className="space-y-4"
        >
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

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.description
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              rows={3}
              {...register('description', {
                required: 'Description is required',
                minLength: {
                  value: 10,
                  message: 'Description must be at least 10 characters',
                },
              })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Property Type
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('type')}
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Transaction Type
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('transactionType')}
              >
                {TRANSACTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Price"
              type="number"
              {...register('price', { valueAsNumber: true })}
              error={errors.price?.message}
            />

            <Input
              label="Currency"
              {...register('currency', {
                maxLength: { value: 3, message: 'Max 3 characters' },
              })}
              error={errors.currency?.message}
            />

            {watchTransactionType === TransactionType.ForRent && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Payment Frequency
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('paymentFrequency')}
                >
                  {PAYMENT_FREQUENCIES.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <Input
            label="Features (comma-separated)"
            {...register('features')}
            placeholder="Pool, Garden, Garage"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Latitude"
              type="number"
              step="any"
              {...register('lat', {
                required: 'Latitude is required',
                valueAsNumber: true,
              })}
              error={errors.lat?.message}
            />

            <Input
              label="Longitude"
              type="number"
              step="any"
              {...register('lng', {
                required: 'Longitude is required',
                valueAsNumber: true,
              })}
              error={errors.lng?.message}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedFiles([]);
          setPreviews([]);
        }}
        title="Property Uploads"
        size="lg"
      >
        <div className="space-y-4">
          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {previews.map((preview, index) => (
                <div
                  key={`preview-${String(index)}`}
                  className="group relative cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-gray-500"
                  onClick={() => handleRemovePreview(index)}
                >
                  <img
                    src={preview}
                    alt={`Preview ${String(index + 1)}`}
                    className="h-32 w-full object-cover"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-700 opacity-0 transition-opacity group-hover:opacity-90">
                    <p className="font-semibold text-white">Click to remove!</p>
                    <small className="text-gray-300">{selectedFiles[index]?.name}</small>
                  </div>
                </div>
              ))}
            </div>
          )}

          {previews.length === 0 && (
            <div className="relative mx-auto h-40 w-full border-4 border-dashed">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e): void => {
                  void handleFileSelect(e);
                }}
                className="absolute inset-0 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
              />
              <p className="flex h-full items-center justify-center text-center text-gray-700 dark:text-gray-300">
                Drag your files here or click in this area.
              </p>
            </div>
          )}

          <Button
            onClick={() => void handleUploadImages()}
            fullWidth
            disabled={isSubmitting || selectedFiles.length === 0}
          >
            {isSubmitting ? 'Uploading...' : 'Upload Images'}
          </Button>

          {property.images && property.images.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-3 font-semibold">Current Images</h4>
              <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
                {property.images.map((image, index) => (
                  <div key={`current-${String(index)}`} className="overflow-hidden rounded-lg">
                    <img
                      src={image}
                      alt={`Property ${String(index + 1)}`}
                      className="h-20 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
