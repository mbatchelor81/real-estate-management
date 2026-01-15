import { useState, useCallback, useRef, useEffect } from 'react';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonFooter,
} from '@ionic/react';
import toast from 'react-hot-toast';
import { useRestriction } from '@/hooks';
import { createPropertiesService } from '@/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { PropertyCurrentImages } from './PropertyCurrentImages';
import type { Property } from '@/types';

interface PropertyUploadsModalProps {
  property: Property;
  onDismiss: (data?: { deleted?: string[] }) => void;
}

interface FilePreview {
  file: File;
  preview: string;
}

export function PropertyUploadsModal({
  property,
  onDismiss,
}: PropertyUploadsModalProps): React.ReactElement {
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>(property.images ?? []);
  const uploadBtnRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const getState = useAppSelector((state) => (): typeof state => state);
  const propertiesService = createPropertiesService(dispatch, getState);
  const { restricted, showAlert } = useRestriction();

  const handleDismiss = useCallback((): void => {
    onDismiss();
  }, [onDismiss]);

  const getPreviewImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>): void => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = (): void => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleSelectFiles = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
      const files = event.target.files;
      if (!files || files.length === 0) {
        return;
      }

      const newFilePreviews: FilePreview[] = [];
      for (const file of Array.from(files)) {
        try {
          const preview = await getPreviewImage(file);
          newFilePreviews.push({ file, preview });
        } catch {
          console.error('Failed to create preview for file:', file.name);
        }
      }

      setFilePreviews((prev) => [...prev, ...newFilePreviews]);
    },
    [getPreviewImage]
  );

  useEffect(() => {
    if (filePreviews.length > 0) {
      const element = uploadBtnRef.current;
      if (element) {
        const timer = setTimeout((): void => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 500);
        return (): void => {
          clearTimeout(timer);
        };
      }
    }
    return undefined;
  }, [filePreviews.length]);

  const handleRemoveFile = useCallback((index: number): void => {
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(async (): Promise<void> => {
    if (restricted) {
      await showAlert();
      return;
    }

    if (filePreviews.length === 0) {
      toast.error('Please select images to upload.');
      return;
    }

    setIsUploading(true);
    try {
      const files = filePreviews.map((fp) => fp.file);
      const response = await propertiesService.addPropertyImage(files, property.property_id);

      if (!response.success) {
        toast.error(response.message ?? 'Something went wrong, please try again later.');
        onDismiss();
        return;
      }

      setCurrentImages(response.data);
      toast.success(response.message ?? 'Images uploaded successfully');
      setFilePreviews([]);
    } catch {
      toast.error('An error occurred while uploading images');
    } finally {
      setIsUploading(false);
    }
  }, [restricted, showAlert, filePreviews, propertiesService, property.property_id, onDismiss]);

  const handleImagesDeleted = useCallback(
    (deletedImages: string[]): void => {
      setCurrentImages((prev) => prev.filter((img) => !deletedImages.includes(img)));
      onDismiss({ deleted: deletedImages });
    },
    [onDismiss]
  );

  return (
    <>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle className="px-3">Property Uploads</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleDismiss}>
              <IonIcon icon="close-outline" style={{ fontSize: '28px' }} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="flex h-full flex-col pb-8">
          {filePreviews.length > 0 && (
            <section className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filePreviews.map((filePreview, index) => (
                <div
                  key={`${filePreview.file.name}-${String(index)}`}
                  className="relative cursor-pointer overflow-hidden rounded-lg border-[3px] border-dashed border-gray-500 p-2"
                  onClick={() => handleRemoveFile(index)}
                >
                  <img
                    src={filePreview.preview}
                    className="h-32 w-full object-cover"
                    alt={`Preview ${String(index + 1)}`}
                  />
                  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-700 opacity-0 transition-opacity duration-700 ease-in-out hover:opacity-90">
                    <p className="font-semibold text-white">Click to remove!</p>
                    <small className="max-w-full truncate px-2 text-white">
                      {filePreview.file.name}
                    </small>
                  </div>
                </div>
              ))}
            </section>
          )}

          <section className="mb-4 flex flex-col">
            {filePreviews.length === 0 && (
              <div className="relative mx-auto mb-4 h-44 w-full border-4 border-dashed">
                <input
                  type="file"
                  name="imageUpload"
                  id="imageUpload"
                  multiple
                  accept="image/*"
                  onChange={(e) => void handleSelectFiles(e)}
                  className="absolute inset-0 m-0 cursor-pointer p-0 opacity-0 outline-none"
                />
                <p className="flex h-full items-center justify-center text-center text-gray-700 dark:text-gray-200">
                  Drag your files here or click in this area.
                </p>
              </div>
            )}
            <div ref={uploadBtnRef}>
              <IonButton
                color="primary"
                expand="block"
                id="uploadBtn"
                onClick={() => void handleUpload()}
                disabled={isUploading || filePreviews.length === 0}
              >
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </IonButton>
            </div>
          </section>

          {currentImages.length > 0 && (
            <PropertyCurrentImages
              images={currentImages}
              propertyId={property.property_id}
              onDelete={handleImagesDeleted}
            />
          )}
        </div>
      </IonContent>

      <IonFooter translucent>
        <IonToolbar />
      </IonFooter>
    </>
  );
}
