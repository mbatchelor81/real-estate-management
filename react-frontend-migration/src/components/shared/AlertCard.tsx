interface AlertCardProps {
  color?: 'danger' | 'warning' | 'success';
  content?: string;
  children?: React.ReactNode;
}

const colorStyles: Record<AlertCardProps['color'] & string, string> = {
  danger: 'border-red-500 bg-red-500/30 text-red-700',
  warning: 'border-yellow-500 bg-yellow-500/30 text-yellow-700',
  success: 'border-green-500 bg-green-500/30 text-green-700',
};

function AlertIcon(): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function AlertCard({
  color = 'danger',
  content = 'Alert Something is wrong',
  children,
}: AlertCardProps): React.ReactElement {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-4 py-1.5 ${colorStyles[color]}`}
    >
      <div className="flex shrink-0 items-start">
        <AlertIcon />
      </div>
      <div className="flex items-center">{children ?? content}</div>
    </div>
  );
}
