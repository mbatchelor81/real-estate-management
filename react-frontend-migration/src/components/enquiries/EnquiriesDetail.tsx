import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchEnquiry,
  removeEnquiry,
  readEnquiry,
  selectCurrentEnquiry,
  selectEnquiriesIsLoading,
} from '@/store/slices/enquiriesSlice';
import { selectAuthUser } from '@/store/slices/authSlice';
import { useRestriction } from '@/hooks';
import { Card, CardHeader, CardContent, CardTitle, LoadingSpinner } from '@/components/ui';
import { EnquiryBadge, Footer } from '@/components/shared';
import { EnquiriesRelatedList } from './EnquiriesRelatedList';
import { EnquiriesReplyModal } from './EnquiriesReplyModal';
import toast from 'react-hot-toast';

export function EnquiriesDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const enquiry = useAppSelector(selectCurrentEnquiry);
  const isLoading = useAppSelector(selectEnquiriesIsLoading);
  const user = useAppSelector(selectAuthUser);
  const { restricted, showAlert } = useRestriction();

  const [ready, setReady] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  const sentByMe = useMemo((): boolean => {
    if (!user || !enquiry) return false;
    return user.user_id === enquiry.users.from.user_id;
  }, [user, enquiry]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const loadEnquiryDetails = useCallback(async (): Promise<void> => {
    if (!id) return;
    try {
      await dispatch(fetchEnquiry(id)).unwrap();
    } catch {
      // Error handled by Redux state
    } finally {
      setReady(true);
    }
  }, [dispatch, id]);

  useEffect(() => {
    void loadEnquiryDetails();
  }, [loadEnquiryDetails]);

  useEffect(() => {
    if (enquiry && !enquiry.read && enquiry.users.to.user_id === user?.user_id) {
      void dispatch(readEnquiry(enquiry.enquiry_id));
    }
  }, [dispatch, enquiry, user?.user_id]);

  const handleGoBack = (): void => {
    void navigate(-1);
  };

  const handleGoToProperty = (propertyId: string): void => {
    void navigate(`/properties/${propertyId}`);
  };

  const handleGoToEnquiry = (enquiryId: string): void => {
    void navigate(`/enquiries/${enquiryId}`);
  };

  const handleReport = (): void => {
    const confirmed = window.confirm('Are you sure you want to Report this Message?');
    if (confirmed) {
      toast.success('Enquiry will be placed for investigation.');
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!enquiry) return;

    if (restricted) {
      await showAlert();
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this Enquiry?');
    if (confirmed) {
      try {
        await dispatch(removeEnquiry(enquiry.enquiry_id)).unwrap();
        toast.success('Enquiry deleted successfully.');
        void navigate('/enquiries');
      } catch {
        toast.error('Failed to delete enquiry.');
      }
    }
  };

  const handleOpenReplyModal = (): void => {
    setIsReplyModalOpen(true);
  };

  const handleCloseReplyModal = (): void => {
    setIsReplyModalOpen(false);
  };

  if (isLoading && !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
        <span className="ml-2">Fetching enquiry details...</span>
      </div>
    );
  }

  if (!enquiry && ready) {
    return (
      <>
        <div className="container mx-auto p-4">
          <Card className="border-2 py-8 shadow-none">
            <CardHeader>
              <h1 className="text-center text-4xl">Error 404</h1>
            </CardHeader>
            <CardContent>
              <h5 className="text-center text-2xl">
                <strong>Enquiry</strong> not found. It may not exist or has been deleted.
              </h5>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  if (!enquiry) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <header className="border-b bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="rounded-full p-2 hover:bg-gray-100"
              aria-label="Go back"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <h1 className="text-lg font-semibold">Enquiry Detail</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-screen-2xl px-4 py-6 xl:py-12">
        <div className="grid h-full gap-8 xl:grid-cols-12">
          <div className="flex flex-col gap-4 xl:col-span-7">
            <h1 className="mb-3 border-b border-slate-200 px-3 pb-4 text-xl dark:border-slate-700">
              {sentByMe ? (
                'Enquiry Sent By You'
              ) : (
                <>
                  Enquiry Message From{' '}
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {enquiry.email}
                  </a>
                </>
              )}
            </h1>

            <Card className="border border-slate-200 shadow-none dark:border-slate-800">
              <CardHeader className="px-3 py-4 lg:px-5">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-gray-900 dark:text-gray-100">
                    {enquiry.property.name}
                  </span>
                  <button
                    onClick={() => handleGoToProperty(enquiry.property.property_id)}
                    className="ml-3 rounded border border-blue-600 px-3 py-1 text-sm font-normal text-blue-600 hover:bg-blue-50"
                  >
                    View Property
                  </button>
                </CardTitle>
                <div className="mt-3 flex items-center gap-3">
                  <EnquiryBadge topic={enquiry.topic} />
                </div>
              </CardHeader>
            </Card>

            <Card className="mt-2 border border-slate-200 shadow-none dark:border-slate-800">
              <CardHeader className="border-b border-slate-200 px-3 py-4 dark:border-slate-800 lg:px-5">
                {enquiry.replyTo && (
                  <div className="mb-2">
                    <button
                      onClick={() => handleGoToEnquiry(enquiry.replyTo?.enquiry_id ?? '')}
                      className="flex items-center gap-1 bg-transparent p-0 text-base"
                    >
                      <svg
                        className="h-4 w-4 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                        />
                      </svg>
                      <span className="text-blue-600 hover:underline">
                        [Response to] - {enquiry.replyTo.title}
                      </span>
                    </button>
                  </div>
                )}
                <CardTitle className="mt-2">{enquiry.title}</CardTitle>
                <p className="mt-2 text-sm font-light text-gray-500">
                  {formatDate(enquiry.createdAt)}
                </p>
              </CardHeader>
              <CardContent>
                <div className="min-h-fit rounded-2xl px-4 pb-2 pt-8 text-gray-900 dark:text-gray-100">
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: enquiry.content }}
                  />
                </div>
                <p className="px-4">
                  -{' '}
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {enquiry.email}
                  </a>
                  {sentByMe && <span> (You)</span>}
                </p>
              </CardContent>
            </Card>

            <div className="mt-3 flex items-center pl-2">
              {!sentByMe && (
                <>
                  <button
                    onClick={handleOpenReplyModal}
                    className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Reply
                  </button>

                  <button
                    onClick={handleReport}
                    className="ml-auto mr-3 flex items-center gap-2 rounded bg-gray-100 px-4 py-2 text-red-600 hover:bg-gray-200"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                      />
                    </svg>
                    Report
                  </button>
                </>
              )}

              <button
                onClick={() => void handleDelete()}
                className={`flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 ${
                  sentByMe ? '' : ''
                }`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            </div>
          </div>

          <div className="h-full xl:col-span-5">
            <section className="flex h-full flex-col border-t border-slate-300 pt-8 dark:border-slate-700 xl:mt-0 xl:border-t-0 xl:pt-0">
              <div className="grow pb-24 xl:px-5">
                <EnquiriesRelatedList
                  propertyId={enquiry.property.property_id}
                  enquiryId={enquiry.enquiry_id}
                />
              </div>
            </section>
          </div>
        </div>
      </main>

      <EnquiriesReplyModal
        isOpen={isReplyModalOpen}
        onClose={handleCloseReplyModal}
        title="Reply Enquiry"
        property={enquiry.property}
        replyTo={{
          enquiry_id: enquiry.enquiry_id,
          title: enquiry.title,
          topic: enquiry.topic,
        }}
        userTo={enquiry.users.from.user_id}
      />

      <Footer />
    </>
  );
}
