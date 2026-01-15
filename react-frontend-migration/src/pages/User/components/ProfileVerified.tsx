import { CheckCircle, XCircle } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

export function ProfileVerified(): React.ReactElement {
  const user = useAppSelector((state) => state.auth.user);
  const isVerified = user?.verified ?? false;

  return (
    <ul className="flex items-center justify-center gap-3 py-3">
      <li className="flex items-center gap-1">
        {isVerified ? (
          <CheckCircle className="h-6 w-6 text-blue-600" />
        ) : (
          <XCircle className="h-6 w-6 text-gray-400" />
        )}
        <span className="font-bold text-gray-900 dark:text-white md:text-lg">
          {isVerified ? 'Account Verified' : 'Account Not Verified'}
        </span>
      </li>
    </ul>
  );
}
