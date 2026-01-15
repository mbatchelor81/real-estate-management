import { useForm } from 'react-hook-form';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button, Input } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createEnquiry, fetchEnquiries, selectEnquiriesInitialFetchDone } from '@/store/slices/enquiriesSlice';
import { selectAuthUser } from '@/store/slices/authSlice';
import type { CreateEnquiryPayload, EnquiryTopic } from '@/types';

interface EnquiriesNewFormProps {
  propertyId: string;
  propertyName: string;
  toUserId: string;
  replyTo?: {
    enquiry_id: string;
    title: string;
    topic: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface EnquiryFormData {
  title: string;
  content: string;
  topic: EnquiryTopic;
}

const TOPIC_OPTIONS: { value: EnquiryTopic; label: string }[] = [
  { value: 'schedule' as EnquiryTopic, label: 'Schedule Visit' },
  { value: 'payment' as EnquiryTopic, label: 'Payment' },
  { value: 'sales' as EnquiryTopic, label: 'Sales' },
  { value: 'info' as EnquiryTopic, label: 'Information' },
];

export function EnquiriesNewForm({
  propertyId,
  propertyName,
  toUserId,
  replyTo,
  onSuccess,
  onCancel,
}: EnquiriesNewFormProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const initialFetchDone = useAppSelector(selectEnquiriesInitialFetchDone);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnquiryFormData>({
    defaultValues: {
      title: replyTo ? `Re: ${replyTo.title}` : '',
      content: '',
      topic: replyTo?.topic ? (replyTo.topic as EnquiryTopic) : ('info' as EnquiryTopic),
    },
  });

  const onSubmit = async (data: EnquiryFormData): Promise<void> => {
    if (!user) {
      toast.error('Please sign in to send an enquiry');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!initialFetchDone) {
        await dispatch(fetchEnquiries());
      }

      const payload: CreateEnquiryPayload = {
        title: data.title,
        content: data.content,
        topic: data.topic,
        property_id: propertyId,
        to_user_id: toUserId,
        replyTo: replyTo?.enquiry_id,
      };

      const result = await dispatch(createEnquiry(payload));

      if (createEnquiry.fulfilled.match(result)) {
        toast.success('Message sent successfully');
        reset();
        onSuccess?.();
      } else {
        const errorMessage = result.payload as string;
        toast.error(errorMessage || 'Failed to send message. Please try again.');
      }
    } catch {
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    void handleSubmit(onSubmit)(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <Input
        label="Title"
        type="text"
        placeholder="Enter enquiry title"
        error={errors.title?.message}
        {...register('title', {
          required: 'Title is required',
          minLength: {
            value: 8,
            message: 'Title must be at least 8 characters',
          },
        })}
      />

      <div className="w-full">
        <label htmlFor="content" className="mb-1 block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          id="content"
          rows={5}
          placeholder="Enter your message"
          className={`
            w-full rounded-md border px-3 py-2 text-sm
            transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0
            ${
              errors.content
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }
          `}
          {...register('content', {
            required: 'Message content is required',
            minLength: {
              value: 8,
              message: 'Message must be at least 8 characters',
            },
          })}
        />
        {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
      </div>

      <div className="w-full">
        <label htmlFor="topic" className="mb-1 block text-sm font-medium text-gray-700">
          Topic
        </label>
        <select
          id="topic"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
          {...register('topic', { required: 'Please select a topic' })}
        >
          {TOPIC_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.topic && <p className="mt-1 text-sm text-red-600">{errors.topic.message}</p>}
      </div>

      {propertyName && (
        <p className="text-sm text-gray-500">
          Regarding property: <span className="font-medium">{propertyName}</span>
        </p>
      )}

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isSubmitting} fullWidth={!onCancel}>
          {replyTo ? 'Send Reply' : 'Submit'}
        </Button>
      </div>
    </form>
  );
}
