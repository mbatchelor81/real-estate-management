import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchProperties, resetProperties } from '@/store/slices/propertiesSlice';
import { PropertyCard, HorizontalSlide } from '@/components/shared';
import { Button } from '@/components/ui';
import { MapLeaflet, MapMarkersLegend } from './components';
import { PropertyType } from '@/types';

const ALL_PROPERTY_TYPES: PropertyType[] = [
  PropertyType.Residential,
  PropertyType.Commercial,
  PropertyType.Industrial,
  PropertyType.Land,
];

const SIDEBAR_PROPERTY_LIMIT = 4;
const MOBILE_PROPERTY_LIMIT = 6;

export default function MapPage(): React.ReactElement {
  const dispatch = useAppDispatch();
  const properties = useAppSelector((state) => state.properties.properties);
  const isLoading = useAppSelector((state) => state.properties.isLoading);

  const [visibleTypes, setVisibleTypes] = useState<PropertyType[]>(ALL_PROPERTY_TYPES);

  useEffect(() => {
    if (properties.length === 0) {
      dispatch(resetProperties());
      void dispatch(fetchProperties({ limit: 20 }));
    }
  }, [dispatch, properties.length]);

  const handleToggleMarker = useCallback(
    (event: { type: PropertyType; isChecked: boolean }): void => {
      if (!event.isChecked) {
        setVisibleTypes((prev) => prev.filter((t) => t !== event.type));
      } else {
        setVisibleTypes((prev) => [...prev, event.type]);
      }
    },
    []
  );

  const sidebarProperties = properties.slice(0, SIDEBAR_PROPERTY_LIMIT);
  const mobileProperties = properties.slice(0, MOBILE_PROPERTY_LIMIT);

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white md:text-xl">
          Map Page
        </h1>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="relative z-10 flex h-[70vh] min-h-[500px] flex-1 lg:h-auto">
          <section className="relative h-full w-full">
            <MapLeaflet
              properties={properties}
              visibleMarkerTypes={visibleTypes}
              showPropertyMarkers={true}
            />
            <MapMarkersLegend onToggleMarker={handleToggleMarker} />
          </section>

          <div className="hidden w-full max-w-[380px] overflow-y-auto p-1 lg:block xl:p-2">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {sidebarProperties.map((property) => (
                    <PropertyCard key={property.property_id} property={property} />
                  ))}
                </div>

                <div className="pt-2">
                  <div className="mx-2 flex h-[200px] items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700">
                    <Link to="/properties">
                      <Button variant="outline">View All</Button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-16 w-full py-3 pr-3 lg:hidden">
          <HorizontalSlide>
            {mobileProperties.map((property) => (
              <div key={property.property_id} className="min-w-[320px] px-2">
                <PropertyCard property={property} />
              </div>
            ))}

            <div className="flex h-full min-w-[300px] items-center justify-center rounded-md border border-blue-500">
              <Link to="/properties">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
          </HorizontalSlide>
        </div>
      </div>
    </div>
  );
}
