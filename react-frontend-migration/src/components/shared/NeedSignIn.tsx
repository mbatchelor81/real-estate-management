import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';

interface NeedSignInProps {
  isModal?: boolean;
  onClose?: () => void;
}

export function NeedSignIn({
  isModal = false,
  onClose,
}: NeedSignInProps): React.ReactElement {
  const navigate = useNavigate();

  const handleSignIn = (): void => {
    if (isModal && onClose) {
      onClose();
    }
    void navigate('/user/signin');
  };

  const handleClose = (): void => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {isModal && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Content Restricted</h2>
          <button
            onClick={handleClose}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="flex flex-col justify-center items-center flex-1 p-4">
        <div className="text-center px-3 py-4">
          <img
            src="/assets/images/security.svg"
            alt="Security illustration"
            className="max-w-[400px] xl:max-w-[500px] mx-auto"
          />

          <h4 className="sm:text-[20px] font-bold mt-4">
            YOU NEED TO SIGN IN TO CONTINUE
          </h4>

          <Button
            onClick={handleSignIn}
            className="w-full max-w-[300px] mt-2 sm:mt-4 md:text-[20px]"
            size="lg"
          >
            SIGN IN
          </Button>
        </div>
      </div>
    </div>
  );
}
