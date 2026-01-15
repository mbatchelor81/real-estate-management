import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectEnquiries } from '@/store/slices/enquiriesSlice';
import { EnquiryBadge } from '@/components/shared';
import type { Enquiry } from '@/types';

interface EnquiriesRelatedListProps {
  propertyId: string;
  enquiryId?: string;
}

export function EnquiriesRelatedList({
  propertyId,
  enquiryId,
}: EnquiriesRelatedListProps): React.ReactElement {
  const navigate = useNavigate();
  const enquiries = useAppSelector(selectEnquiries);

  const relatedEnquiries = useMemo<Enquiry[]>(() => {
    if (!propertyId) return [];
    return enquiries.filter(
      (enq) =>
        enq.property.property_id === propertyId &&
        (!enquiryId || enq.enquiry_id !== enquiryId)
    );
  }, [enquiries, propertyId, enquiryId]);

  const handleView = (enquiry: Enquiry): void => {
    void navigate(`/enquiries/${enquiry.enquiry_id}`, { replace: true });
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="h-full">
      <div className="hidden lg:block bg-primary text-white rounded-lg mb-4">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Related Enquiries:</span>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          </div>
        </div>
      </div>

      {relatedEnquiries.length === 0 && (
        <div className="bg-slate-50 dark:bg-transparent h-full border border-slate-200 dark:border-slate-800 rounded-lg">
          <div className="flex justify-center items-center p-6">
            <h1 className="text-center bg-white dark:bg-slate-800 text-lg font-light p-6 border border-slate-200 dark:border-slate-800 rounded">
              Looks like there are no enquiries at the moment. Check back soon!
            </h1>
          </div>
        </div>
      )}

      {relatedEnquiries.length > 0 && (
        <div className="bg-slate-50 dark:bg-transparent flex flex-col gap-2 pt-3 px-3 border border-slate-200 dark:border-slate-700 h-full rounded-lg">
          {relatedEnquiries.map((enquiry) => (
            <div
              key={enquiry.enquiry_id}
              onClick={() => handleView(enquiry)}
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="px-3 flex flex-row items-center justify-between py-1">
                <p className="text-sm truncate">{enquiry.title}</p>
                <EnquiryBadge topic={enquiry.topic} />
              </div>

              <div className="px-3 py-1">
                <div className="flex flex-row items-center justify-between">
                  <p className="text-sm">
                    From:{' '}
                    <a
                      href={`mailto:${enquiry.users.from.user_id}`}
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {enquiry.users.from.user_id}
                    </a>
                  </p>
                  <span className="text-sm min-w-[100px] text-right">
                    {formatDate(enquiry.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="text-slate-700 dark:text-slate-300 bg-white dark:bg-transparent text-center border border-slate-200 dark:border-slate-800 p-3 rounded-lg mb-3">
            That&apos;s all for now—no more enquiries to load.
          </div>
        </div>
      )}
    </div>
  );
}
