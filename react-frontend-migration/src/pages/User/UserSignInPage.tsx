import { useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardTitle, Button, Input } from '@/components/ui';
import { useUserService } from '@/services/useUserService';
import { environment } from '@/config/environment';
import type { SignInCredentials, GoogleAuthPayload } from '@/types';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleInitConfig) => void;
          renderButton: (element: HTMLElement | null, config: GoogleButtonConfig) => void;
          prompt: (callback?: (notification: unknown) => void) => void;
        };
      };
    };
  }
}

interface GoogleInitConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select: boolean;
  cancel_on_tap_outside: boolean;
}

interface GoogleButtonConfig {
  theme: 'outline' | 'filled_blue' | 'filled_black';
  size: 'large' | 'medium' | 'small';
  width: string;
}

interface GoogleCredentialResponse {
  credential: string;
  clientId?: string;
}

export default function UserSignInPage(): React.ReactElement {
  const navigate = useNavigate();
  const { signIn, googleAuth, isLoading, error } = useUserService();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const showSocial = Boolean(environment.api.googleAuthClientId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInCredentials>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleGoogleResponse = useCallback(
    (response: GoogleCredentialResponse): void => {
      const payload: GoogleAuthPayload = {
        credential: response.credential,
        clientId: environment.api.googleAuthClientId,
      };

      void googleAuth(payload).then((user) => {
        if (user) {
          toast.success('Success, You are logged in');
          void navigate('/map', { replace: true });
        } else {
          toast.error('Google authentication failed');
        }
      });
    },
    [googleAuth, navigate]
  );

  useEffect(() => {
    if (!showSocial || !googleButtonRef.current) {
      return;
    }

    const initializeGoogleSignIn = (): void => {
      if (!window.google) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: environment.api.googleAuthClientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: '330',
      });

      window.google.accounts.id.prompt();
    };

    if (window.google) {
      initializeGoogleSignIn();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    }
  }, [showSocial, handleGoogleResponse]);

  const onSubmit = (data: SignInCredentials): void => {
    void signIn(data).then((user) => {
      if (user) {
        toast.success('Success, You are logged in');
        void navigate('/map', { replace: true });
      } else {
        toast.error(error ?? 'Wrong Email or Password');
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent>
          <div className="mb-4 flex justify-center">
            <img src="/assets/images/logo.png" alt="logo" className="h-16" />
          </div>
          <CardTitle>Sign In</CardTitle>
          <p className="mt-2 text-gray-600">Sign in to your account to manage properties.</p>
          <form
            className="mt-4 space-y-4"
            onSubmit={(e): void => {
              void handleSubmit(onSubmit)(e);
            }}
          >
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email is not valid',
                },
              })}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              {...register('password', {
                required: 'Password is required',
              })}
              error={errors.password?.message}
            />
            <Button type="submit" fullWidth isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          {showSocial && (
            <>
              <div className="my-4 text-center text-gray-500">OR</div>
              <div className="flex justify-center">
                <div ref={googleButtonRef} id="web-google-button" />
              </div>
            </>
          )}

          <p className="mt-4 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link to="/user/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
