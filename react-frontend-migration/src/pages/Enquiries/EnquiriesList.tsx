import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { selectEnquiries, selectEnquiriesIsLoading } from '@/store/slices/enquiriesSlice';
import { selectAuthUser } from '@/store/slices/authSlice';
import { LoadingSpinner } from '@/components/ui';
import { EnquiriesListItem } from './EnquiriesListItem';
import type { Enquiry, EnquiryTopic } from '@/types';

interface EnquiriesListProps {
  className?: string;
}

function sortByDate(
  enquiries: Enquiry[],
  latest: boolean = true
): Enquiry[] {
  return [...enquiries].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return latest ? dateB - dateA : dateA - dateB;
  });
}

function sortByTitle(enquiries: Enquiry[]): Enquiry[] {
  return [...enquiries].sort((a, b) => {
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();
    return titleA.localeCompare(titleB);
  });
}

export function EnquiriesList({ className = '' }: EnquiriesListProps): React.ReactElement {
  const [searchParams] = useSearchParams();
  const enquiries = useAppSelector(selectEnquiries);
  const isLoading = useAppSelector(selectEnquiriesIsLoading);
  const user = useAppSelector(selectAuthUser);

  const searchText = searchParams.get('search') || '';
  const filterParam = searchParams.get('filter') || '';
  const sortBy = searchParams.get('sort') || 'latest';

  const filteredAndSortedEnquiries = useMemo(() => {
    let result = [...enquiries];

    if (searchText) {
      const textToFind = searchText.toLowerCase();
      result = result.filter((item) => {
        const title = item.title.toLowerCase();
        const propertyName = item.property.name.toLowerCase();
        return title.includes(textToFind) || propertyName.includes(textToFind);
      });
    }

    if (filterParam) {
      const filters = filterParam.split(',');
      const isSent = filters.includes('sent');
      const isReceived = filters.includes('received');
      const topicFilters = filters.filter(
        (f) => !['sent', 'received'].includes(f)
      ) as EnquiryTopic[];

      result = result.filter((item) => {
        const isUserSender = user?.user_id === item.users.from.user_id;

        if (isSent && !isUserSender) return false;
        if (isReceived && isUserSender) return false;
        if (topicFilters.length > 0 && !topicFilters.includes(item.topic)) return false;

        return true;
      });
    }

    switch (sortBy) {
      case 'title':
        result = sortByTitle(result);
        break;
      case 'oldest':
        result = sortByDate(result, false);
        break;
      case 'latest':
      default:
        result = sortByDate(result, true);
        break;
    }

    return result;
  }, [enquiries, searchText, filterParam, sortBy, user?.user_id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`px-3 md:px-5 ${className}`}>
      <div className="hidden lg:block mb-3">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <span className="text-lg font-bold">
                Message <small className="text-gray-500">({filteredAndSortedEnquiries.length})</small>
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-lg font-bold">Topic</span>
            </div>
            <div className="col-span-4 text-center">
              <span className="text-lg font-bold">Property</span>
            </div>
            <div className="col-span-2">
              <span className="text-lg font-bold">Date</span>
            </div>
          </div>
        </div>
      </div>

      {filteredAndSortedEnquiries.length > 0 ? (
        <div className="flex flex-col gap-2 lg:gap-3">
          {filteredAndSortedEnquiries.map((enquiry) => (
            <EnquiriesListItem key={enquiry.enquiry_id} enquiry={enquiry} />
          ))}
        </div>
      ) : (
        <div className="font-semibold py-8 text-center text-2xl text-gray-600 dark:text-gray-300">
          Currently empty.
        </div>
      )}
    </div>
  );
}
