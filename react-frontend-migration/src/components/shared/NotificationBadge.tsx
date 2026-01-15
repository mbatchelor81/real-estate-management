import type { UserNotificationType } from '@/types/notification';
import { UserNotificationTypeValues } from '@/types/notification';

interface NotificationBadgeProps {
  notificationType?: UserNotificationType;
}

type BadgeVariant = 'success' | 'primary' | 'tertiary';

function getBadgeVariant(notificationType: UserNotificationType): BadgeVariant {
  switch (notificationType) {
    case UserNotificationTypeValues.Account:
      return 'success';
    case UserNotificationTypeValues.System:
      return 'primary';
    default:
      return 'tertiary';
  }
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-500 text-white',
  primary: 'bg-blue-500 text-white',
  tertiary: 'bg-gray-500 text-white',
};

export function NotificationBadge({
  notificationType = 'ACCOUNT',
}: NotificationBadgeProps): React.ReactElement {
  const variant = getBadgeVariant(notificationType);

  return (
    <span
      className={`inline-block rounded px-2 py-1 text-xs md:text-sm ${variantStyles[variant]}`}
    >
      {notificationType}
    </span>
  );
}
