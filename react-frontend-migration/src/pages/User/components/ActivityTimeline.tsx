import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchActivities } from '@/store/slices/activitiesSlice';
import { Button, LoadingSpinner } from '@/components/ui';

const ActivityType = {
  EnquiryNew: 'ENQUIRY_NEW',
  EnquiryDelete: 'ENQUIRY_DELETE',
  PropertyNew: 'PROPERTY_NEW',
  PropertyDelete: 'PROPERTY_DELETE',
  PropertyUpdate: 'PROPERTY_UPDATE',
  UserLogin: 'USER_LOGIN',
  UserLogout: 'USER_LOGOUT',
  UserRegister: 'USER_REGISTER',
  UserUpdate: 'USER_UPDATE',
} as const;

export function ActivityTimeline(): React.ReactElement {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const activities = useAppSelector((state) => state.activities.activities);
  const isLoading = useAppSelector((state) => state.activities.isLoading);

  useEffect(() => {
    if (activities.length === 0) {
      void dispatch(fetchActivities());
    }
  }, [dispatch, activities.length]);

  const viewProperty = (propertyId: string): void => {
    void navigate(`/properties/${propertyId}`);
  };

  const viewEnquiry = (enquiryId: string): void => {
    void navigate(`/enquiries/${enquiryId}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-[100px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <ul>
        <li className="flex h-[100px] items-center justify-center">
          <h1 className="flex items-center gap-2 text-gray-500">
            EMPTY
            <AlertCircle className="h-5 w-5" />
          </h1>
        </li>
      </ul>
    );
  }

  return (
    <div className="pl-8">
      <ol className="relative border-l border-blue-200 dark:border-blue-600">
        {activities.map((activity, index) => (
          <li key={`${activity.createdAt}-${String(index)}`} className="mb-10 ml-4">
            <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-blue-200 bg-gray-200 dark:border-gray-900 dark:bg-blue-600 md:-left-2.5 md:h-5 md:w-5" />

            <time className="text-sm font-normal leading-none text-gray-700 dark:text-gray-500 md:text-base">
              {activity.createdAt}
            </time>

            <p className="mt-1 text-base text-gray-700 md:text-lg">{activity.description}</p>

            {activity.property_id !== undefined && activity.action !== ActivityType.PropertyDelete && (
              <Button
                variant="primary"
                size="md"
                className="mt-2 h-[45px] rounded-md px-6 py-2 text-base"
                onClick={() => viewProperty(activity.property_id as string)}
              >
                View Property
              </Button>
            )}

            {activity.enquiry_id !== undefined && activity.action !== ActivityType.EnquiryDelete && (
              <Button
                variant="primary"
                size="md"
                className="mt-2 h-[45px] rounded-md px-6 py-2 text-base"
                onClick={() => viewEnquiry(activity.enquiry_id as string)}
              >
                View Enquiry
              </Button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
