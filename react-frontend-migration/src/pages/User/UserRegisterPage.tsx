import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardTitle, Button, Input } from '@/components/ui';
import { useUserService } from '@/services/useUserService';

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const HAS_NUMBER_REGEX = /\d/;
const HAS_UPPERCASE_REGEX = /[A-Z]/;
const HAS_LOWERCASE_REGEX = /[a-z]/;
const HAS_SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

function validatePassword(value: string): string | true {
  if (value.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!HAS_NUMBER_REGEX.test(value)) {
    return 'Password must contain at least one number';
  }
  if (!HAS_UPPERCASE_REGEX.test(value)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!HAS_LOWERCASE_REGEX.test(value)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!HAS_SPECIAL_CHAR_REGEX.test(value)) {
    return 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)';
  }
  return true;
}

export default function UserRegisterPage(): React.ReactElement {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error } = useUserService();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    mode: 'onBlur',
  });

  const password = watch('password');

  const onSubmit = (data: RegisterFormData): void => {
    void (async (): Promise<void> => {
      const result = await registerUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });

      if (result) {
        toast.success('Success, registration is complete.');
        void navigate('/user/account/profile', { replace: true });
      } else {
        toast.error(error ?? 'Registration failed. Please try again.');
      }
    })();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent>
          <CardTitle>Register</CardTitle>
          <p className="mt-2 text-gray-600">Create an account to list and manage properties.</p>
          <form
            className="mt-4 space-y-4"
            onSubmit={(e): void => {
              void handleSubmit(onSubmit)(e);
            }}
          >
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              error={errors.fullName?.message}
              {...register('fullName', {
                required: 'Full name is required',
                minLength: {
                  value: 4,
                  message: 'Full name must be at least 4 characters long',
                },
              })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: EMAIL_REGEX,
                  message: 'Email is not valid. ex: name@email.com',
                },
              })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                validate: validatePassword,
              })}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
            />
            <p className="text-sm text-gray-600">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-blue-600 hover:underline">
                User Agreement
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            <Button type="submit" fullWidth isLoading={isLoading}>
              Sign Up
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/user/signin" className="text-blue-600 hover:underline">
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
