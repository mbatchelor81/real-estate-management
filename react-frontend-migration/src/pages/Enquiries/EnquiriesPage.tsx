import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectAuthUser } from '@/store/slices/authSlice';
import {
  fetchEnquiries,
  selectEnquiriesInitialFetchDone,
} from '@/store/slices/enquiriesSlice';
import { NeedSignIn } from '@/components/shared';
import { Input } from '@/components/ui';
import { EnquiriesList } from './EnquiriesList';
import { EnquiryTopic } from '@/types';

interface FilterOption {
  value: string;
  label: string;
}

interface SortOption {
  value: string;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: EnquiryTopic.Info, label: 'Information' },
  { value: EnquiryTopic.Sales, label: 'Sales' },
  { value: EnquiryTopic.Schedule, label: 'Schedule' },
  { value: EnquiryTopic.Payment, label: 'Payment' },
  { value: 'sent', label: 'Sent' },
  { value: 'received', label: 'Received' },
];

const SORT_OPTIONS: SortOption[] = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title', label: 'Title' },
];

export default function EnquiriesPage(): React.ReactElement {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAppSelector(selectAuthUser);
  const initialFetchDone = useAppSelector(selectEnquiriesInitialFetchDone);

  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [selectedFilters, setSelectedFilters] = useState<string[]>(
    searchParams.get('filter')?.split(',').filter(Boolean) || []
  );
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'latest');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    if (user && !initialFetchDone) {
      void dispatch(fetchEnquiries());
    }
  }, [dispatch, user, initialFetchDone]);

  const updateSearchParams = useCallback(
    (key: string, value: string | null) => {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);
    },
    []
  );

  const handleSearchSubmit = useCallback(() => {
    updateSearchParams('search', searchValue || null);
  }, [searchValue, updateSearchParams]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearchSubmit();
      }
    },
    [handleSearchSubmit]
  );

  const handleFilterToggle = useCallback(
    (filterValue: string) => {
      const newFilters = selectedFilters.includes(filterValue)
        ? selectedFilters.filter((f) => f !== filterValue)
        : [...selectedFilters, filterValue];

      setSelectedFilters(newFilters);
      updateSearchParams('filter', newFilters.length > 0 ? newFilters.join(',') : null);
    },
    [selectedFilters, updateSearchParams]
  );

  const handleSortChange = useCallback(
    (sortValue: string) => {
      setSelectedSort(sortValue);
      updateSearchParams('sort', sortValue);
      setShowSortDropdown(false);
    },
    [updateSearchParams]
  );

  if (!user) {
    return <NeedSignIn />;
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-lg md:text-xl font-semibold">Enquiries Page</h1>
        </div>

        <div className="px-4 pb-4">
          <div className="mb-4">
            <Input
              type="search"
              placeholder="Search Enquiry"
              value={searchValue}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              onBlur={handleSearchSubmit}
              className="w-full border-2 border-slate-200 dark:border-slate-700 rounded-2xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <button
                onClick={() => {
                  setShowFilterDropdown(!showFilterDropdown);
                  setShowSortDropdown(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-left"
              >
                <span className="text-sm">
                  Filter:{' '}
                  {selectedFilters.length > 0
                    ? `${String(selectedFilters.length)} selected`
                    : 'None'}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showFilterDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                  {FILTER_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFilters.includes(option.value)}
                        onChange={() => handleFilterToggle(option.value)}
                        className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                  <div className="border-t border-slate-200 dark:border-slate-700 p-2">
                    <button
                      onClick={() => setShowFilterDropdown(false)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown);
                  setShowFilterDropdown(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-left"
              >
                <span className="text-sm">
                  Sort by: {SORT_OPTIONS.find((o) => o.value === selectedSort)?.label || 'Latest'}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showSortDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 ${
                        selectedSort === option.value ? 'bg-slate-100 dark:bg-slate-700' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto pt-8 xl:pt-12 pb-8">
        {!initialFetchDone ? (
          <div className="h-1 bg-blue-600 animate-pulse mx-4" />
        ) : (
          <EnquiriesList />
        )}
      </main>
    </div>
  );
}
