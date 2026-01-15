import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardTitle, Button, Input } from '@/components/ui';
import { useUserService } from '@/services/useUserService';
import { useRestriction } from '@/hooks';
import type { ChangePasswordPayload } from '@/types';

interface ChangePasswordFormData {
  passwordCurrent: string;
  passwordNew: string;
  passwordConfirm: string;
}

const PASSWORD_MIN_LENGTH = 8;

function validatePassword(value: string): string | true {
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${String(PASSWORD_MIN_LENGTH)} characters`;
  }
  if (!/\d/.test(value)) {
    return 'Password must contain at least one number';
  }
  if (!/[A-Z]/.test(value)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(value)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    return 'Password must contain at least one special character';
  }
  return true;
}

export default function ChangePasswordPage(): React.ReactElement {
  const navigate = useNavigate();
  const { changePassword, signOut, isAuthenticated } = useUserService();
  const { restricted, showAlert } = useRestriction();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    defaultValues: {
      passwordCurrent: '',
      passwordNew: '',
      passwordConfirm: '',
    },
  });

  const passwordNew = watch('passwordNew');

  const onSubmit = async (data: ChangePasswordFormData): Promise<void> => {
    if (restricted) {
      await showAlert();
      return;
    }

    setIsSubmitting(true);

    const payload: ChangePasswordPayload = {
      passwordCurrent: data.passwordCurrent,
      passwordNew: data.passwordNew,
    };

    const success = await changePassword(payload);
    setIsSubmitting(false);

    if (success) {
      toast.success('Password changed successfully. Please sign in again.');
      reset();
      signOut();
      void navigate('/user/signin');
    } else {
      toast.error('Failed to change password. Please check your current password.');
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    void handleSubmit(onSubmit)(event);
  };

  if (!isAuthenticated) {
    void navigate('/user/signin');
    return <></>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border border-slate-200 dark:border-slate-800">
        <CardContent>
          <div className="mb-4 flex justify-center">
            <img src="/assets/images/logo.png" alt="logo" className="h-16" />
          </div>
          <CardTitle className="text-center">Change Password</CardTitle>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your new password must be different from your previous password
          </p>

          <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter your current password"
              error={errors.passwordCurrent?.message}
              {...register('passwordCurrent', {
                required: 'Current password is required',
              })}
            />

            <Input
              label="New Password"
              type="password"
              placeholder="Enter your new password"
              error={errors.passwordNew?.message}
              {...register('passwordNew', {
                required: 'New password is required',
                validate: validatePassword,
              })}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your new password"
              error={errors.passwordConfirm?.message}
              {...register('passwordConfirm', {
                required: 'Please confirm your new password',
                validate: (value) =>
                  value === passwordNew || 'Passwords do not match',
              })}
            />

            <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <p className="mb-2 font-medium">Password requirements:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>At least 8 characters long</li>
                <li>Contains at least one number</li>
                <li>Contains at least one uppercase letter</li>
                <li>Contains at least one lowercase letter</li>
                <li>Contains at least one special character</li>
              </ul>
            </div>

            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Changing Password...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
