import { PropertyType } from '@/types';

interface PropertyBadgeProps {
  type: PropertyType;
}

const badgeColors: Record<PropertyType, string> = {
  [PropertyType.Residential]: 'bg-red-500 text-white',
  [PropertyType.Commercial]: 'bg-purple-500 text-white',
  [PropertyType.Industrial]: 'bg-amber-500 text-white',
  [PropertyType.Land]: 'bg-green-500 text-white',
};

const badgeLabels: Record<PropertyType, string> = {
  [PropertyType.Residential]: 'Residential Real Estate',
  [PropertyType.Commercial]: 'Commercial Real Estate',
  [PropertyType.Industrial]: 'Industrial Real Estate',
  [PropertyType.Land]: 'Land Real Estate',
};

export function PropertyBadge({ type }: PropertyBadgeProps): React.ReactElement {
  return (
    <span
      className={`inline-block rounded px-2 py-1 text-xs font-medium ${badgeColors[type]}`}
    >
      {badgeLabels[type]}
    </span>
  );
}
