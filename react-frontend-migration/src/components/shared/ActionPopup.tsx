import { useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAppSelector } from '@/store';
import { selectAuthUser } from '@/store/slices/authSlice';

type ActionType = 'message' | 'edit' | 'report' | 'delete';

interface ActionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: ActionType) => void;
  showMessage?: boolean;
  showEdit?: boolean;
  showReport?: boolean;
  showDelete?: boolean;
  anchorEl?: HTMLElement | null;
}

interface ActionButtonConfig {
  type: ActionType;
  label: string;
  icon: React.ReactElement;
  colorClass: string;
  show: boolean;
}

const MessageIcon = (): React.ReactElement => (
  <svg
    className="mr-2 h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const EditIcon = (): React.ReactElement => (
  <svg
    className="mr-2 h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
);

const ReportIcon = (): React.ReactElement => (
  <svg
    className="mr-2 h-5 w-5"
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
);

const DeleteIcon = (): React.ReactElement => (
  <svg
    className="mr-2 h-5 w-5"
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
);

const CloseIcon = (): React.ReactElement => (
  <svg
    className="mr-2 h-5 w-5"
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
);

export function ActionPopup({
  isOpen,
  onClose,
  onAction,
  showMessage = true,
  showEdit = true,
  showReport = true,
  showDelete = true,
  anchorEl,
}: ActionPopupProps): React.ReactElement | null {
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);
  const popupRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    },
    [onClose, anchorEl]
  );

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClickOutside, handleEscape]);

  const handleAction = (action: ActionType): void => {
    if (!user) {
      void navigate('/user/signin');
      onClose();
      return;
    }
    onAction(action);
    onClose();
  };

  if (!isOpen) return null;

  const actionButtons: ActionButtonConfig[] = [
    {
      type: 'message',
      label: 'Message',
      icon: <MessageIcon />,
      colorClass: 'bg-green-600 text-white hover:bg-green-700',
      show: showMessage,
    },
    {
      type: 'edit',
      label: 'Edit',
      icon: <EditIcon />,
      colorClass: 'bg-blue-600 text-white hover:bg-blue-700',
      show: showEdit,
    },
    {
      type: 'report',
      label: 'Report',
      icon: <ReportIcon />,
      colorClass: 'bg-yellow-500 text-white hover:bg-yellow-600',
      show: showReport,
    },
    {
      type: 'delete',
      label: 'Delete',
      icon: <DeleteIcon />,
      colorClass: 'bg-red-600 text-white hover:bg-red-700',
      show: showDelete,
    },
  ];

  const getPopupPosition = (): React.CSSProperties => {
    if (!anchorEl) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const rect = anchorEl.getBoundingClientRect();
    return {
      position: 'fixed',
      top: rect.bottom + 8,
      left: rect.left,
    };
  };

  const popupContent = (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0" onClick={onClose} />
      <div
        ref={popupRef}
        className="z-50 min-w-48 rounded-lg bg-white shadow-xl dark:bg-gray-800"
        style={getPopupPosition()}
      >
        <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Select Action:
          </span>
        </div>
        <div className="flex flex-col gap-1 p-2">
          {actionButtons
            .filter((btn) => btn.show)
            .map((btn) => (
              <button
                key={btn.type}
                onClick={() => handleAction(btn.type)}
                className={`flex w-full items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${btn.colorClass}`}
              >
                {btn.icon}
                {btn.label}
              </button>
            ))}
          <button
            onClick={onClose}
            className="flex w-full items-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <CloseIcon />
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(popupContent, document.body);
}
