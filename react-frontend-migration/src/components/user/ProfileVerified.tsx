import type { User } from '@/types';

interface ProfileVerifiedProps {
  user: User;
}

function CheckmarkCircleIcon(): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="h-8 w-8 fill-primary"
    >
      <path d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm108.25 138.29-134.4 160a16 16 0 0 1-12 5.71h-.27a16 16 0 0 1-11.89-5.3l-57.6-64a16 16 0 1 1 23.78-21.4l45.29 50.32 122.59-145.91a16 16 0 0 1 24.5 20.58z" />
    </svg>
  );
}

function CloseCircleIcon(): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="h-8 w-8 fill-gray-400"
    >
      <path d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm75.31 260.69a16 16 0 1 1-22.62 22.62L256 278.63l-52.69 52.68a16 16 0 0 1-22.62-22.62L233.37 256l-52.68-52.69a16 16 0 0 1 22.62-22.62L256 233.37l52.69-52.68a16 16 0 0 1 22.62 22.62L278.63 256z" />
    </svg>
  );
}

export function ProfileVerified({ user }: ProfileVerifiedProps): React.ReactElement {
  const isVerified = user.verified ?? false;

  return (
    <ul className="flex items-center justify-center gap-3 py-3">
      <li className="flex items-center gap-1">
        {isVerified ? <CheckmarkCircleIcon /> : <CloseCircleIcon />}
        <span className="font-bold text-dark dark:text-white md:text-[18px]">
          {isVerified ? 'Account Verified' : 'Account Not Verified'}
        </span>
      </li>
    </ul>
  );
}
