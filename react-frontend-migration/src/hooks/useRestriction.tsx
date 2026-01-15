import toast from 'react-hot-toast';
import { environment } from '@/config';

interface ShowToastOptions {
  duration?: number;
  message?: string;
  heading?: string;
}

interface ShowAlertOptions {
  message?: string;
  heading?: string;
}

interface UseRestrictionReturn {
  restricted: boolean;
  showToast: (options?: ShowToastOptions) => void;
  showAlert: (options?: ShowAlertOptions) => Promise<void>;
}

export function useRestriction(): UseRestrictionReturn {
  const restricted = environment.features.restrictedMode;

  const showToast = (options?: ShowToastOptions): void => {
    const heading = options?.heading ?? environment.features.restrictedHeading;
    const message = options?.message ?? environment.features.restrictedMessage;
    const duration = options?.duration ?? 8000;

    toast.error(`${heading}: ${message}`, {
      duration,
      icon: '⚠️',
    });
  };

  const showAlert = async (options?: ShowAlertOptions): Promise<void> => {
    const heading = options?.heading ?? environment.features.restrictedHeading;
    const message = options?.message ?? environment.features.restrictedMessage;

    return new Promise<void>((resolve) => {
      toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <div className="font-semibold text-red-600">{heading}</div>
            <div className="text-sm text-gray-700">{message}</div>
            <button
              className="mt-2 rounded bg-gray-200 px-3 py-1 text-sm font-medium hover:bg-gray-300"
              onClick={() => {
                toast.dismiss(t.id);
                resolve();
              }}
            >
              I understand
            </button>
          </div>
        ),
        {
          duration: Infinity,
          position: 'top-center',
        }
      );
    });
  };

  return {
    restricted,
    showToast,
    showAlert,
  };
}
