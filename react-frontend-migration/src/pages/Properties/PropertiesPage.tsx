import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonContent,
  IonProgressBar,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  useIonToast,
} from '@ionic/react';
import { addOutline, gridOutline, reorderFourOutline, addCircleOutline } from 'ionicons/icons';
import { PropertiesList } from '@/components/properties';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { store } from '@/store/store';
import type { RootState } from '@/store/store';
import { selectAuthUser } from '@/store/slices/authSlice';
import {
  getProperties,
  getPropertiesLoading,
  getHasMore,
  createPropertiesService,
} from '@/services/propertiesService';
import { PropertiesDisplayOption, PropertyType, TransactionType } from '@/types';

interface FilterOption {
  value: string;
  label: string;
}

interface SortOption {
  value: string;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: PropertyType.Residential, label: 'Residential type' },
  { value: PropertyType.Commercial, label: 'Commercial type' },
  { value: PropertyType.Industrial, label: 'Industrial type' },
  { value: PropertyType.Land, label: 'Land type' },
  { value: TransactionType.ForSale, label: 'For Sale' },
  { value: TransactionType.ForRent, label: 'For Rent' },
];

const SORT_OPTIONS: SortOption[] = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name', label: 'Title' },
  { value: 'price', label: 'Price' },
];

export default function PropertiesPage(): React.ReactElement {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const [presentToast] = useIonToast();
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectAuthUser);
  const properties = useAppSelector(getProperties);
  const isLoading = useAppSelector(getPropertiesLoading);
  const hasMore = useAppSelector(getHasMore);

  const getStoreState = useCallback((): RootState => store.getState(), []);

  const propertiesService = useMemo(
    () => createPropertiesService(dispatch, getStoreState),
    [dispatch, getStoreState]
  );

  const [displayOption, setDisplayOption] = useState<PropertiesDisplayOption>(
    PropertiesDisplayOption.CardView
  );
  const [disableInfiniteScroll, setDisableInfiniteScroll] = useState(false);

  const filterBy = useMemo(() => {
    const filterParam = searchParams.get('filter');
    return filterParam ? filterParam.split(',') : [];
  }, [searchParams]);

  const sortBy = useMemo(() => {
    return searchParams.get('sort') ?? 'latest';
  }, [searchParams]);

  const searchText = useMemo(() => {
    return searchParams.get('search') ?? '';
  }, [searchParams]);

  const loadProperties = useCallback(async (): Promise<void> => {
    const filterParam = searchParams.get('filter') ?? undefined;
    const sortParam = searchParams.get('sort') ?? 'latest';
    const searchParam = searchParams.get('search') ?? undefined;

    await propertiesService.fetchProperties(sortParam, filterParam, searchParam);
  }, [propertiesService, searchParams]);

  useEffect(() => {
    if (properties.length === 0) {
      void loadProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = useCallback(
    (event: CustomEvent<{ value?: string | null }>): void => {
      const value = event.detail.value ?? '';
      const newParams = new URLSearchParams(searchParams);

      if (value) {
        newParams.set('search', value);
      } else {
        newParams.delete('search');
      }

      setSearchParams(newParams);
      propertiesService.resetState({ skipOwned: true });
      setDisableInfiniteScroll(false);
      void loadProperties();
    },
    [searchParams, setSearchParams, propertiesService, loadProperties]
  );

  const handleFilterChange = useCallback(
    (event: CustomEvent<{ value?: string[] }>): void => {
      const value = event.detail.value;
      const newParams = new URLSearchParams(searchParams);

      if (value && value.length > 0) {
        newParams.set('filter', value.join(','));
      } else {
        newParams.delete('filter');
      }

      setSearchParams(newParams);
      propertiesService.resetState({ skipOwned: true });
      setDisableInfiniteScroll(false);
      void loadProperties();
    },
    [searchParams, setSearchParams, propertiesService, loadProperties]
  );

  const handleSortChange = useCallback(
    (event: CustomEvent<{ value?: string }>): void => {
      const value = event.detail.value;
      const newParams = new URLSearchParams(searchParams);

      if (value) {
        newParams.set('sort', value);
      } else {
        newParams.delete('sort');
      }

      setSearchParams(newParams);
      propertiesService.resetState({ skipOwned: true });
      setDisableInfiniteScroll(false);
      void loadProperties();
    },
    [searchParams, setSearchParams, propertiesService, loadProperties]
  );

  const handleLoadMore = useCallback(async (): Promise<void> => {
    await loadProperties();
  }, [loadProperties]);

  const handleNewProperty = useCallback((): void => {
    if (!user) {
      void navigate('/user/signin');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      void presentToast({
        message: 'Please sign in to continue',
        duration: 3000,
        color: 'danger',
      });
      return;
    }
    void navigate('/properties/new');
  }, [user, navigate, presentToast]);

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle className="px-3 text-[16px] md:text-[18px] xl:px-4">
            Properties Page
          </IonTitle>
          <IonButtons slot="end">
            <IonMenuButton />
          </IonButtons>
        </IonToolbar>

        <IonToolbar className="px-2 xl:px-3">
          <IonSearchbar
            inputMode="text"
            debounce={700}
            animated
            className="rounded-2xl border-2 border-slate-200 dark:border-slate-800"
            onIonChange={handleSearchChange}
            placeholder="Search Property"
            value={searchText}
          />

          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="6">
                <IonList>
                  <IonItem lines="none">
                    <IonSelect
                      multiple
                      value={filterBy}
                      okText="Confirm"
                      cancelText="Dismiss"
                      label="Filter:"
                      onIonChange={handleFilterChange}
                    >
                      {FILTER_OPTIONS.map((filter) => (
                        <IonSelectOption key={filter.value} value={filter.value}>
                          {filter.label}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </IonList>
              </IonCol>

              <IonCol size="12" sizeMd="6">
                <IonList>
                  <IonItem lines="none">
                    <IonSelect
                      value={sortBy}
                      okText="Confirm"
                      cancelText="Dismiss"
                      label="Sort by:"
                      onIonChange={handleSortChange}
                    >
                      {SORT_OPTIONS.map((sort) => (
                        <IonSelectOption key={sort.value} value={sort.value}>
                          {sort.label}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </IonList>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonHeader>

      <IonFab slot="fixed" vertical="bottom" horizontal="end" className="ion-margin-end show-on-mobile">
        <IonFabButton onClick={handleNewProperty} color="success">
          <IonIcon icon={addOutline as string} />
        </IonFabButton>
      </IonFab>

      <IonContent>
        <div className="properties-container pt-8 xl:pt-12">
          {isLoading && (
            <IonProgressBar style={{ margin: '4px 0 0 0' }} type="indeterminate" />
          )}

          <IonGrid>
            <IonRow className="ion-align-items-center mb-3 hidden md:flex lg:mb-5">
              <IonCol className="heading ion-padding-horizontal flex items-center gap-1">
                <span className="mr-3 text-[20px] lg:text-[24px] lg:font-medium">
                  List of Properties
                </span>

                <IonButton
                  className="display-option-btn ml-2"
                  onClick={() => setDisplayOption(PropertiesDisplayOption.CardView)}
                  disabled={displayOption === PropertiesDisplayOption.CardView}
                  size="small"
                >
                  <IonIcon icon={gridOutline as string} />
                </IonButton>

                <IonButton
                  className="display-option-btn"
                  onClick={() => setDisplayOption(PropertiesDisplayOption.ListView)}
                  disabled={displayOption === PropertiesDisplayOption.ListView}
                  size="small"
                >
                  <IonIcon icon={reorderFourOutline as string} />
                </IonButton>
              </IonCol>

              <IonCol className="ion-padding-horizontal">
                <IonButton
                  color="success"
                  className="ion-float-right"
                  onClick={handleNewProperty}
                >
                  New Property
                  <IonIcon icon={addCircleOutline as string} />
                </IonButton>
              </IonCol>
            </IonRow>

            <PropertiesList
              properties={properties}
              displayOption={displayOption}
              enableOwnedBadge
              disableInfiniteScroll={disableInfiniteScroll}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
            />
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
}
