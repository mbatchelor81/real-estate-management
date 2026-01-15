import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectActivities, selectActivitiesLoading } from '@/store/slices/activitiesSlice';
import type { Activity } from '@/types';
import { ActivityType } from '@/types';

interface ActivityTimelineProps {
  activities?: Activity[];
}

export function ActivityTimeline({ activities: propActivities }: ActivityTimelineProps): React.ReactElement {
  const navigate = useNavigate();
  const storeActivities = useAppSelector(selectActivities);
  const isLoading = useAppSelector(selectActivitiesLoading);

  const activities = propActivities ?? storeActivities;

  const viewProperty = (activity: Activity): void => {
    if (activity.property_id) {
      void navigate(`/properties/${activity.property_id}`);
    }
  };

  const viewEnquiry = (activity: Activity): void => {
    if (activity.enquiry_id) {
      void navigate(`/enquiries/${activity.enquiry_id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <span className="text-gray-500">Loading activities...</span>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <ul>
        <li className="flex h-24 items-center justify-center">
          <h1 className="text-gray-500">No activities yet</h1>
        </li>
      </ul>
    );
  }

  return (
    <div className="pl-8">
      <ol className="relative border-l border-primary/30 dark:border-primary">
        {activities.map((activity, index) => (
          <li key={`${activity.createdAt}-${String(index)}`} className="mb-10 ml-4">
            <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-primary/30 bg-gray-200 dark:border-gray-900 dark:bg-primary md:-left-2.5 md:h-5 md:w-5" />

            <time className="text-sm font-normal leading-none text-gray-700 dark:text-gray-500 md:text-base">
              {activity.createdAt}
            </time>

            <p className="mt-1 text-base text-gray-700 md:text-lg">
              {activity.description}
            </p>

            {activity.property_id && activity.action !== (ActivityType.PropertyDelete as string) && (
              <button
                type="button"
                onClick={() => viewProperty(activity)}
                className="mt-2 inline-flex h-11 items-center rounded-md bg-blue-600 px-6 py-2 text-base text-white hover:bg-blue-700"
              >
                View Property
              </button>
            )}

            {activity.enquiry_id && activity.action !== (ActivityType.EnquiryDelete as string) && (
              <button
                type="button"
                onClick={() => viewEnquiry(activity)}
                className="mt-2 inline-flex h-11 items-center rounded-md bg-blue-600 px-6 py-2 text-base text-white hover:bg-blue-700"
              >
                View Enquiry
              </button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
