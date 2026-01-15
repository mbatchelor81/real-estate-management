import { EnquiryBadge } from '@/components/shared/EnquiryBadge';
import type { Enquiry } from '@/types';

interface EnquiriesListItemProps {
  enquiry: Enquiry;
  currentUserId: string;
  onClick?: () => void;
  onActionClick?: (event: React.MouseEvent, enquiryId: string) => void;
}

export function EnquiriesListItem({
  enquiry,
  currentUserId,
  onClick,
  onActionClick,
}: EnquiriesListItemProps): React.ReactElement {
  const isSent = currentUserId === enquiry.users.from.user_id;

  const handleActionClick = (event: React.MouseEvent): void => {
    event.stopPropagation();
    onActionClick?.(event, enquiry.enquiry_id);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
    >
      <div className="mb-2 flex items-center justify-between md:mb-3">
        <div className="flex items-center gap-2 pl-2 pt-2 lg:pl-3 lg:pt-3">
          <span className="rounded border border-slate-200 bg-slate-100 px-2 py-1 text-sm font-light capitalize dark:border-slate-800 dark:bg-slate-800">
            {isSent ? 'sent' : 'received'}
          </span>

          {!isSent && !enquiry.read && (
            <span className="rounded bg-gray-500 px-2 py-1 text-sm font-light text-white">
              Unread
            </span>
          )}
        </div>

        <button
          onClick={handleActionClick}
          className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gray-300 p-2 xl:h-[40px] xl:w-[40px]"
          aria-label="More actions"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12 text-base font-medium lg:col-span-4">
          <span className="text-slate-900 dark:text-slate-100">
            {enquiry.title || 'None'}
          </span>
        </div>

        <div className="col-span-12 lg:col-span-2">
          <EnquiryBadge topic={enquiry.topic} />
        </div>

        <div className="col-span-12 text-slate-600 dark:text-slate-400 lg:col-span-4 lg:text-center">
          <span>{enquiry.users.from.user_id}</span>
        </div>

        <div className="col-span-12 text-slate-600 dark:text-slate-400 lg:col-span-2">
          <span>{formatDate(enquiry.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
