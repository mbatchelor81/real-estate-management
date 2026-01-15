import { useState, useCallback, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

interface PropertyGalleryProps {
  images: string[];
  showEdit?: boolean;
  onEdit?: () => void;
}

const DEFAULT_IMAGE = '/assets/images/no-image.jpeg';

export function PropertyGallery({
  images,
  showEdit = false,
  onEdit,
}: PropertyGalleryProps): React.ReactElement {
  const initialImage = useMemo(
    () => images[0] || DEFAULT_IMAGE,
    [images]
  );
  const [imagePresented, setImagePresented] = useState<string>(initialImage);

  const handleImageSelect = useCallback((image: string): void => {
    setImagePresented(image || DEFAULT_IMAGE);
  }, []);

  const handleEditClick = useCallback((): void => {
    if (onEdit) {
      onEdit();
    }
  }, [onEdit]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {showEdit && (
        <div className="text-right">
          <button
            type="button"
            onClick={handleEditClick}
            className="m-2 mr-4 inline-flex items-center gap-1 rounded px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800"
          >
            <span>Edit</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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
          </button>
        </div>
      )}

      <div className="p-0 lg:p-3">
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
          />
        </div>

        {images.length > 1 && (
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={20}
            slidesPerView="auto"
            className="property-gallery-swiper"
          >
            {images.map((image, index) => (
              <SwiperSlide
                key={`${image}-${String(index)}`}
                className="!w-[300px] cursor-pointer"
              >
                <div
                  className="relative h-[200px] w-full"
                  onClick={() => handleImageSelect(image || DEFAULT_IMAGE)}
                >
                  <div
                    className="h-full w-full rounded-lg bg-cover bg-center"
                    style={{ backgroundImage: `url(${image})` }}
                  />
                  <div
                    className={`absolute inset-0 rounded-lg transition-colors ${
                      imagePresented === image
                        ? 'bg-blue-500/20'
                        : 'bg-gray-800/60 hover:bg-gray-800/40'
                    }`}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
}
