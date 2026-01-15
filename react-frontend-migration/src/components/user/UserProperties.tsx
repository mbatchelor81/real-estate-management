import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { PropertiesList } from '@/components/properties';
import { createPropertiesService, getOwnedProperties, getPropertiesLoading } from '@/services/propertiesService';
import { PropertiesDisplayOption } from '@/types';
import type { RootState } from '@/store/store';

export function UserProperties(): React.ReactElement {
  const dispatch = useAppDispatch();
  const ownedProperties = useAppSelector(getOwnedProperties);
  const isLoading = useAppSelector(getPropertiesLoading);
  const currentUserId = useAppSelector((state: RootState) => state.auth.user?.user_id);

  useEffect(() => {
    if (ownedProperties.length === 0) {
      const propertiesService = createPropertiesService(dispatch, () => ({}) as RootState);
      void propertiesService.fetchOwnedProperties();
    }
  }, [dispatch, ownedProperties.length]);

  if (isLoading && ownedProperties.length === 0) {
    return (
      <div className="flex h-[100px] items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500">
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading properties...
        </div>
      </div>
    );
  }

  return (
    <PropertiesList
      properties={ownedProperties}
      displayOption={PropertiesDisplayOption.ListView}
      disableInfiniteScroll={true}
      enableOwnedBadge={false}
      currentUserId={currentUserId}
    />
  );
}
