import { useState, useCallback } from 'react';
import { IonButton } from '@ionic/react';
import toast from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, FreeMode } from 'swiper/modules';
import { useRestriction } from '@/hooks';
import { createPropertiesService } from '@/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';

interface PropertyCurrentImagesProps {
  images: string[];
  propertyId: string;
  onDelete: (deletedImages: string[]) => void;
}

const NO_IMAGE_PLACEHOLDER = '/assets/images/no-image.jpeg';

export function PropertyCurrentImages({
  images,
  propertyId,
  onDelete,
}: PropertyCurrentImagesProps): React.ReactElement | null {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useAppDispatch();
  const getState = useAppSelector((state) => (): typeof state => state);
  const propertiesService = createPropertiesService(dispatch, getState);
  const { restricted, showAlert } = useRestriction();

  const getImageUrl = useCallback((image: string): string => {
    return image || NO_IMAGE_PLACEHOLDER;
  }, []);

  const toggleSelected = useCallback((image: string): void => {
    setSelectedImages((prev) => {
      if (prev.includes(image)) {
        return prev.filter((img) => img !== image);
      }
      return [...prev, image];
    });
  }, []);

  const isSelected = useCallback(
    (image: string): boolean => {
      return selectedImages.includes(image);
    },
    [selectedImages]
  );

  const handleDeleteSelected = useCallback(async (): Promise<void> => {
    if (restricted) {
      await showAlert();
      return;
    }

    if (selectedImages.length === 0) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await propertiesService.deletePropertyImage(selectedImages, propertyId);
      if (response.success && response.data.length > 0) {
        toast.success(response.message ?? 'Images deleted successfully');
        onDelete(response.data);
        setSelectedImages([]);
      } else {
        toast.error(response.message ?? 'Failed to delete images');
      }
    } catch {
      toast.error('An error occurred while deleting images');
    } finally {
      setIsDeleting(false);
    }
  }, [restricted, showAlert, selectedImages, propertiesService, propertyId, onDelete]);

  if (images.length === 0) {
    return null;
  }

  return (
    <section className="mt-6">
      <header className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-200">
        Current Images:
      </header>

      <Swiper
        modules={[Pagination, FreeMode]}
        pagination={{ clickable: true }}
        spaceBetween={15}
        slidesPerView="auto"
        freeMode={true}
        className="mb-4"
      >
        {images.map((image, index) => (
          <SwiperSlide key={`${image}-${String(index)}`} style={{ width: 'auto' }}>
            <div
              className="relative h-32 w-32 cursor-pointer overflow-hidden rounded-lg"
              onClick={() => toggleSelected(image)}
            >
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${getImageUrl(image)})` }}
              />
              <input
                type="checkbox"
                className={`absolute right-2 top-2 h-5 w-5 cursor-pointer rounded ${
                  isSelected(image) ? 'accent-primary' : 'opacity-70'
                }`}
                checked={isSelected(image)}
                onChange={() => toggleSelected(image)}
              />
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  isSelected(image)
                    ? 'bg-black/40 opacity-100'
                    : 'bg-black/0 opacity-0 hover:bg-black/20 hover:opacity-100'
                }`}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <IonButton
        color="danger"
        expand="block"
        disabled={selectedImages.length === 0 || isDeleting}
        onClick={handleDeleteSelected}
      >
        {isDeleting ? 'Deleting...' : `Delete Selected (${String(selectedImages.length)})`}
      </IonButton>
    </section>
  );
}
