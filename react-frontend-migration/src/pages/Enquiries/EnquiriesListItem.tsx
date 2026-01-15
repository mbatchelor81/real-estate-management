import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui';
import { EnquiryBadge } from '@/components/shared';
import type { Enquiry } from '@/types';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectAuthUser } from '@/store/slices/authSlice';
import { removeEnquiry } from '@/store/slices/enquiriesSlice';
import { useRestriction } from '@/hooks';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface EnquiriesListItemProps {
  enquiry: Enquiry;
}

export function EnquiriesListItem({ enquiry }: EnquiriesListItemProps): React.ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const { restricted, showAlert } = useRestriction();
  const [showActions, setShowActions] = useState(false);

  const isSent = user?.user_id === enquiry.users.from.user_id;

  const handleClick = (): void => {
    void navigate(`/enquiries/${enquiry.enquiry_id}`);
  };

  const handleActionClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setShowActions(!showActions);
  };

  const handleDelete = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    setShowActions(false);

    if (restricted) {
      await showAlert();
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this Enquiry?');
    if (!confirmed) return;

    try {
      await dispatch(removeEnquiry(enquiry.enquiry_id)).unwrap();
      toast.success('Enquiry deleted successfully');
    } catch {
      toast.error('Failed to delete enquiry');
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      className="cursor-pointer"
    >
      <Card className="hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-none relative">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block rounded px-2 py-1 text-xs font-light capitalize border ${
              isSent
                ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800'
                : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            {isSent ? 'sent' : 'received'}
          </span>

          {!isSent && !enquiry.read && (
            <span className="inline-block rounded px-2 py-1 text-xs font-light bg-gray-500 text-white">
              Unread
            </span>
          )}
        </div>

        <div className="relative">
          <button
            onClick={handleActionClick}
            className="bg-gray-300 dark:bg-gray-600 rounded-full w-8 h-8 xl:w-10 xl:h-10 p-2 flex justify-center items-center hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 min-w-[120px]">
              <button
                onClick={(e) => void handleDelete(e)}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 items-center">
          <div className="lg:col-span-4 font-medium text-base">
            {enquiry.title || 'None'}
          </div>

          <div className="lg:col-span-2">
            <EnquiryBadge topic={enquiry.topic} />
          </div>

          <div className="lg:col-span-4 lg:text-center text-gray-600 dark:text-gray-400">
            {enquiry.property.name}
          </div>

          <div className="lg:col-span-2 text-gray-600 dark:text-gray-400">
            {formatDate(enquiry.createdAt)}
          </div>
        </div>
      </CardContent>
      </Card>
    </div>
  );
}
