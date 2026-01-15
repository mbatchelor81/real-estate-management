interface NotificationBadgeProps {
  notificationType: string;
}

type BadgeColor = 'success' | 'primary' | 'tertiary';

const USER_NOTIFICATION_TYPE = {
  Account: 'ACCOUNT',
  System: 'SYSTEM',
} as const;

const colorClasses: Record<BadgeColor, string> = {
  success: 'bg-green-500 text-white',
  primary: 'bg-blue-500 text-white',
  tertiary: 'bg-gray-500 text-white',
};

function getBadgeColor(notificationType: string): BadgeColor {
  switch (notificationType) {
    case USER_NOTIFICATION_TYPE.Account:
      return 'success';
    case USER_NOTIFICATION_TYPE.System:
      return 'primary';
    default:
      return 'tertiary';
  }
}

export function NotificationBadge({ notificationType }: NotificationBadgeProps): React.ReactElement {
  const color = getBadgeColor(notificationType);

  return (
    <span
      className={`inline-block py-1 px-2 text-xs md:text-sm rounded-md ${colorClasses[color]}`}
    >
      {notificationType}
    </span>
  );
}
