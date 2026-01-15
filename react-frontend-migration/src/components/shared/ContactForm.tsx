import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardContent, CardTitle, Button, Input } from '@/components/ui';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

interface ContactFormProps {
  onSubmitSuccess?: (data: ContactFormData) => void;
}

export function ContactForm({ onSubmitSuccess }: ContactFormProps): React.ReactElement {
  const [sent, setSent] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    mode: 'onSubmit',
  });

  const onSubmit = (data: ContactFormData): void => {
    setSent(true);
    setShowToast(true);
    reset();
    onSubmitSuccess?.(data);

    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <>
      {showToast && (
        <div className="fixed top-4 right-4 z-50 rounded-md bg-green-500 px-4 py-3 text-white shadow-lg">
          Your message has been sent.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="px-3 pt-4 text-[20px] capitalize lg:px-6 lg:text-[24px]">
            Contact Form
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e): void => {
              void handleSubmit(onSubmit)(e);
            }}
          >
            <div className="space-y-4">
              <div>
                <Input
                  label="Email:"
                  type="text"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email is invalid.',
                    },
                  })}
                  error={errors.email?.message}
                />
              </div>

              <div>
                <Input
                  label="Name:"
                  type="text"
                  {...register('name', {
                    required: 'Name must be filled correctly.',
                  })}
                  error={errors.name?.message}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Message:</label>
                <textarea
                  className={`
                    w-full rounded-md border px-3 py-2 text-sm
                    transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0
                    ${
                      errors.message
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }
                    disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50
                  `}
                  placeholder="Must be at least 10 characters long"
                  rows={4}
                  {...register('message', {
                    required: 'Make sure the message is filled correctly.',
                    minLength: {
                      value: 10,
                      message: 'Make sure the message is filled correctly.',
                    },
                  })}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" fullWidth disabled={sent} className="mt-4">
              {sent ? 'Message Sent' : 'Send message'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
