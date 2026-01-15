import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EnquiriesListItem } from './EnquiriesListItem';
import { Card, CardContent } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectEnquiries,
  selectEnquiriesIsLoading,
  selectEnquiriesInitialFetchDone,
  fetchEnquiries,
} from '@/store/slices/enquiriesSlice';
import { selectAuthUser } from '@/store/slices/authSlice';
import type { Enquiry } from '@/types';

type SortOption = 'latest' | 'oldest' | 'title';

interface EnquiriesListProps {
  onEnquiryClick?: (enquiry: Enquiry) => void;
}

function sortEnquiriesByDate(
  enquiries: Enquiry[],
  latest: boolean
): Enquiry[] {
  return [...enquiries].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return latest ? dateB - dateA : dateA - dateB;
  });
}

function sortEnquiriesByTitle(enquiries: Enquiry[]): Enquiry[] {
  return [...enquiries].sort((a, b) =>
    a.title.toLowerCase().localeCompare(b.title.toLowerCase())
  );
}

function sortEnquiries(enquiries: Enquiry[], sortBy: SortOption): Enquiry[] {
  switch (sortBy) {
    case 'title':
      return sortEnquiriesByTitle(enquiries);
    case 'oldest':
      return sortEnquiriesByDate(enquiries, false);
    case 'latest':
    default:
      return sortEnquiriesByDate(enquiries, true);
  }
}

function filterEnquiries(
  enquiries: Enquiry[],
  filter: string,
  userId: string
): Enquiry[] {
  if (!filter) return enquiries;

  const filters = filter.split(',');
  const isSent = filters.includes('sent');
  const isReceived = filters.includes('received');
  const topicFilters = filters.filter((f) => !['sent', 'received'].includes(f));

  return enquiries.filter((enquiry) => {
    if (isSent && userId !== enquiry.users.from.user_id) return false;
    if (isReceived && userId === enquiry.users.from.user_id) return false;
    if (topicFilters.length > 0 && !topicFilters.includes(enquiry.topic))
      return false;
    return true;
  });
}

function searchEnquiries(enquiries: Enquiry[], searchText: string): Enquiry[] {
  if (!searchText) return enquiries;

  const textToFind = searchText.toLowerCase();
  return enquiries.filter((enquiry) => {
    const title = enquiry.title.toLowerCase();
    const email = enquiry.email.toLowerCase();
    return title.includes(textToFind) || email.includes(textToFind);
  });
}

export function EnquiriesList({
  onEnquiryClick,
}: EnquiriesListProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const enquiries = useAppSelector(selectEnquiries);
  const isLoading = useAppSelector(selectEnquiriesIsLoading);
  const initialFetchDone = useAppSelector(selectEnquiriesInitialFetchDone);
  const user = useAppSelector(selectAuthUser);

  const search = searchParams.get('search') ?? '';
  const sortParam = searchParams.get('sort');
  const sort: SortOption = sortParam === 'oldest' || sortParam === 'title' ? sortParam : 'latest';
  const filter = searchParams.get('filter') ?? '';

  useEffect(() => {
    if (!initialFetchDone) {
      void dispatch(fetchEnquiries());
    }
  }, [dispatch, initialFetchDone]);

  const userId = user?.user_id ?? '';

  const filteredEnquiries = useMemo((): Enquiry[] => {
    let result = enquiries;

    if (search) {
      result = searchEnquiries(result, search);
    }

    if (filter && userId) {
      result = filterEnquiries(result, filter, userId);
    }

    result = sortEnquiries(result, sort);

    return result;
  }, [enquiries, search, filter, sort, userId]);

  const handleScroll = useCallback((): void => {
    const container = scrollContainerRef.current;
    if (!container || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 80;

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      void dispatch(fetchEnquiries());
    }
  }, [dispatch, isLoading]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return (): void => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  if (!initialFetchDone && isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="px-3 md:px-5">
      <Card className="mb-3 hidden lg:block">
        <CardContent>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <span className="text-lg font-bold">
                Message <small>({filteredEnquiries.length})</small>
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-lg font-bold">Topic</span>
            </div>
            <div className="col-span-4 text-center">
              <span className="text-lg font-bold">Email Address</span>
            </div>
            <div className="col-span-2">
              <span className="text-lg font-bold">Date</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredEnquiries.length > 0 ? (
        <div
          ref={scrollContainerRef}
          className="flex max-h-[calc(100vh-300px)] flex-col gap-2 overflow-y-auto lg:gap-3"
        >
          {filteredEnquiries.map((enquiry) => (
            <EnquiriesListItem
              key={enquiry.enquiry_id}
              enquiry={enquiry}
              onClick={onEnquiryClick}
            />
          ))}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner />
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 text-center text-2xl font-semibold dark:text-gray-300">
          Currently empty.
        </div>
      )}
    </div>
  );
}
