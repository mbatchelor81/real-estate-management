import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui';
import { EnquiryBadge } from '@/components/shared';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import type { Enquiry } from '@/types';

interface EnquiriesListItemProps {
  enquiry: Enquiry;
  onClick?: (enquiry: Enquiry) => void;
}

export function EnquiriesListItem({
  enquiry,
  onClick,
}: EnquiriesListItemProps): React.ReactElement {
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);
  const isSent = user?.user_id === enquiry.users.from.user_id;

  const handleClick = useCallback((): void => {
    if (onClick) {
      onClick(enquiry);
    } else {
      void navigate(`/enquiries/${enquiry.enquiry_id}`);
    }
  }, [enquiry, onClick, navigate]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e): void => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      className="cursor-pointer"
    >
      <Card className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-4 pt-4 lg:px-5 lg:pt-5">
        <div className="flex items-center gap-2">
          <span className="rounded border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-light capitalize dark:border-slate-700 dark:bg-slate-800">
            {isSent ? 'sent' : 'received'}
          </span>
          {!isSent && !enquiry.read && (
            <span className="rounded bg-gray-500 px-2 py-1 text-xs font-light text-white">
              Unread
            </span>
          )}
        </div>
        <button
          onClick={(e): void => {
            e.stopPropagation();
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 p-2 xl:h-10 xl:w-10"
          aria-label="More options"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
            />
          </svg>
        </button>
      </div>

      <CardContent className="pt-3">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-12 lg:items-center">
          <div className="text-base font-medium lg:col-span-4">
            {enquiry.title || 'None'}
          </div>

          <div className="lg:col-span-2">
            <EnquiryBadge topic={enquiry.topic} />
          </div>

          <div className="text-gray-600 dark:text-gray-400 lg:col-span-4 lg:text-center">
            {enquiry.email}
          </div>

          <div className="text-gray-600 dark:text-gray-400 lg:col-span-2">
            {formatDate(enquiry.createdAt)}
          </div>
        </div>
      </CardContent>
      </Card>
    </div>
  );
}
