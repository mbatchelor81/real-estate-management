import { EnquiryTopic } from '@/types';

type BadgeColor = 'secondary' | 'warning' | 'danger' | 'success';

interface EnquiryBadgeProps {
  topic: EnquiryTopic;
}

const topicColorMap: Record<EnquiryTopic, BadgeColor> = {
  [EnquiryTopic.Info]: 'secondary',
  [EnquiryTopic.Sales]: 'warning',
  [EnquiryTopic.Schedule]: 'danger',
  [EnquiryTopic.Payment]: 'success',
};

const topicLabelMap: Record<EnquiryTopic, string> = {
  [EnquiryTopic.Info]: 'Enquire Information',
  [EnquiryTopic.Sales]: 'About Sales',
  [EnquiryTopic.Schedule]: 'About Schedule',
  [EnquiryTopic.Payment]: 'About Payment',
};

const colorClasses: Record<BadgeColor, string> = {
  secondary: 'bg-gray-500 text-white',
  warning: 'bg-yellow-500 text-white',
  danger: 'bg-red-500 text-white',
  success: 'bg-green-500 text-white',
};

export function EnquiryBadge({ topic }: EnquiryBadgeProps): React.ReactElement {
  const color = topicColorMap[topic];
  const label = topicLabelMap[topic];

  return (
    <span
      className={`inline-block rounded px-2 py-1 text-sm font-medium ${colorClasses[color]}`}
    >
      {label}
    </span>
  );
}
