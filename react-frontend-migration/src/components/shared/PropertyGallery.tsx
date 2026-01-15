import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui';

interface PropertyGalleryProps {
  images: string[] | undefined;
  showEdit?: boolean;
  onEdit?: () => void;
}

const DEFAULT_IMAGE = '/assets/images/no-image.jpeg';

const EditIcon = (): React.ReactElement => (
  <svg
    className="ml-1 h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

export function PropertyGallery({
  images,
  showEdit = false,
  onEdit,
}: PropertyGalleryProps): React.ReactElement {
  const initialImage = useMemo((): string => {
    if (images && images.length > 0) {
      return images[0];
    }
    return DEFAULT_IMAGE;
  }, [images]);

  const [imagePresented, setImagePresented] = useState<string>(initialImage);

  const setSelected = (image: string): void => {
    setImagePresented(image || DEFAULT_IMAGE);
  };

  const hasMultipleImages = images && images.length > 1;

  return (
    <Card className="border border-slate-200 p-0 dark:border-slate-800">
      {showEdit && (
        <div className="flex justify-end p-2">
          <button
            onClick={onEdit}
            className="flex items-center rounded px-3 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
          >
            Edit
            <EditIcon />
          </button>
        </div>
      )}

      <CardContent className="p-0 lg:p-3">
        <div className="relative mb-3 flex h-[350px] justify-center sm:h-[550px]">
          <div
            className="absolute inset-0 z-0 scale-100 bg-cover bg-center opacity-70 blur-sm"
            style={{
              backgroundImage: `url(${imagePresented || 'https://placehold.co/1200x300'})`,
            }}
          />
          <img
            src={imagePresented}
            alt="Property"
            className="z-10 h-full w-auto object-cover"
            onError={(e): void => {
              const target = e.target as HTMLImageElement;
              target.src = DEFAULT_IMAGE;
            }}
          />
        </div>

        {hasMultipleImages && (
          <div className="flex gap-4 overflow-x-auto px-3 pb-3">
            {images.map((image, index) => (
              <div
                key={`${image}-${String(index)}`}
                className={`relative h-20 w-28 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg transition-all ${
                  imagePresented === image
                    ? 'ring-2 ring-blue-500 ring-offset-2'
                    : 'opacity-70 hover:opacity-100'
                }`}
                onClick={() => setSelected(image)}
              >
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${image})` }}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
