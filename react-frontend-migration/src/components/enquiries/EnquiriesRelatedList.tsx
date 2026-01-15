import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectEnquiries } from '@/store/slices/enquiriesSlice';
import { EnquiryBadge } from '@/components/shared';
import { Card, CardHeader, CardContent } from '@/components/ui';
import type { Enquiry } from '@/types';

interface EnquiriesRelatedListProps {
  propertyId: string;
  enquiryId: string;
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
      <Card className="mb-4 hidden lg:block">
        <CardContent className="flex items-center justify-between">
          <span className="text-lg font-bold">Related Enquiries:</span>
          <svg
            className="h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
        </CardContent>
      </Card>

      {relatedEnquiries.length === 0 ? (
        <Card className="h-full border border-slate-200 bg-gray-50 shadow-none dark:border-slate-800 dark:bg-transparent">
          <CardContent className="flex items-center justify-center">
            <h1 className="border border-slate-200 bg-white p-6 text-center text-lg font-light dark:border-slate-800 dark:bg-gray-900">
              Looks like there are no enquiries at the moment. Check back soon!
            </h1>
          </CardContent>
        </Card>
      ) : (
        <div className="flex h-full flex-col gap-2 border border-slate-200 bg-slate-50 px-3 pt-3 dark:border-slate-700 dark:bg-transparent">
          {relatedEnquiries.map((enquiry) => (
            <div
              key={enquiry.enquiry_id}
              onClick={() => handleView(enquiry)}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleView(enquiry);
                }
              }}
            >
              <Card className="border border-slate-200 p-2 shadow-none hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between px-3 py-1">
                  <p className="line-clamp-1 text-ellipsis text-sm">
                    {enquiry.title}
                  </p>
                  <EnquiryBadge topic={enquiry.topic} />
                </CardHeader>
                <CardContent className="py-1">
                  <div className="flex flex-row items-center justify-between">
                    <p className="text-sm">
                      From:{' '}
                      <a
                        href={`mailto:${enquiry.email}`}
                        className="text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {enquiry.email}
                      </a>
                    </p>
                    <span className="min-w-[100px] text-right text-sm">
                      {formatDate(enquiry.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          <div className="border border-slate-200 bg-white p-3 text-center text-slate-700 dark:border-slate-800 dark:bg-transparent dark:text-slate-300">
            That&apos;s all for now—no more enquiries to load.
          </div>
        </div>
      )}
    </div>
  );
}
