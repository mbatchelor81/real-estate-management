import { useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import { useRestriction } from '@/hooks';
import { useAppDispatch } from '@/store/hooks';
import { createPropertiesService } from '@/services/propertiesService';
import { store } from '@/store/store';
import type { RootState } from '@/store/store';

const DEFAULT_IMAGE = '/assets/images/no-image.jpeg';

interface PropertyCurrentImagesProps {
  images: string[];
  propertyId: string;
  onDelete?: (remainingImages: string[]) => void;
}

export function PropertyCurrentImages({
  images,
  propertyId,
  onDelete,
}: PropertyCurrentImagesProps): React.ReactElement {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useAppDispatch();
  const { restricted, showAlert } = useRestriction();

  const getState = useCallback((): RootState => store.getState(), []);

  const propertiesService = useMemo(
    () => createPropertiesService(dispatch, getState),
    [dispatch, getState]
  );

  const getImageUrl = useCallback((image: string): string => {
    return image || DEFAULT_IMAGE;
  }, []);

  const isSelected = useCallback(
    (image: string): boolean => {
      return selectedImages.includes(image);
    },
    [selectedImages]
  );

  const toggleSelection = useCallback((image: string): void => {
    setSelectedImages((prev) => {
      if (prev.includes(image)) {
        return prev.filter((img) => img !== image);
      }
      return [...prev, image];
    });
  }, []);

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
      const response = await propertiesService.deletePropertyImage(
        selectedImages,
        propertyId
      );

      if (response.success && response.data.length > 0) {
        toast.success(response.message ?? 'Images deleted successfully', {
          duration: 3000,
        });
        const remainingImages = images.filter(
          (img) => !selectedImages.includes(img)
        );
        setSelectedImages([]);
        onDelete?.(remainingImages);
      } else if (!response.success) {
        toast.error(response.message ?? 'Failed to delete images', {
          duration: 3000,
        });
      }
    } catch {
      toast.error('An error occurred while deleting images', {
        duration: 3000,
      });
    }finally {
      setIsDeleting(false);
    }
  }, [
    restricted,
    showAlert,
    selectedImages,
    propertyId,
    propertiesService,
    images,
    onDelete,
  ]);

  if (images.length === 0) {
    return (
      <section className="current-images">
        <header className="mb-3 text-lg font-semibold text-gray-700">
          Current Images:
        </header>
        <p className="text-gray-500">No images uploaded yet.</p>
      </section>
    );
  }

  return (
    <section className="current-images">
      <header className="mb-3 text-lg font-semibold text-gray-700">
        Current Images:
      </header>

      <div className="mb-4 flex gap-4 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <div
            key={`${image}-${String(index)}`}
            className="relative flex-shrink-0 cursor-pointer"
            onClick={() => toggleSelection(image)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSelection(image);
              }
            }}
            aria-pressed={isSelected(image)}
            aria-label={`Select image ${String(index + 1)}`}
          >
            <div
              className="h-32 w-32 rounded-lg bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${getImageUrl(image)})` }}
            >
              <img
                src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                alt={`Property image ${String(index + 1)}`}
                className="h-full w-full"
              />
            </div>

            <input
              type="checkbox"
              className={`absolute right-2 top-2 h-5 w-5 cursor-pointer rounded border-2 ${
                isSelected(image)
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300 bg-white/80'
              }`}
              checked={isSelected(image)}
              onChange={() => toggleSelection(image)}
              aria-label={`Select image ${String(index + 1)}`}
            />

            {isSelected(image) && (
              <div className="absolute inset-0 rounded-lg bg-blue-500/30" />
            )}
          </div>
        ))}
      </div>

      <Button
        variant="danger"
        fullWidth
        disabled={selectedImages.length === 0}
        isLoading={isDeleting}
        onClick={() => void handleDeleteSelected()}
      >
        Delete Selected
        {selectedImages.length > 0 && ` (${String(selectedImages.length)})`}
      </Button>
    </section>
  );
}
