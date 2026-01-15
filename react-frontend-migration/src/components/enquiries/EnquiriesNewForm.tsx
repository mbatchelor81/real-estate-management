import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createEnquiry, fetchEnquiries, selectEnquiries } from '@/store/slices/enquiriesSlice';
import { selectAuthUser } from '@/store/slices/authSlice';
import { useRestriction } from '@/hooks/useRestriction';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Property, EnquiryTopic, CreateEnquiryPayload } from '@/types';

interface ReplyToInfo {
  enquiry_id: string;
  title: string;
  topic: string;
}

interface EnquiriesNewFormProps {
  property: Partial<Property>;
  userTo: string;
  replyTo?: ReplyToInfo;
  onSuccess?: () => void;
  onNeedSignIn?: () => void;
}

const TOPIC_OPTIONS: { value: EnquiryTopic; label: string }[] = [
  { value: 'schedule' as EnquiryTopic, label: 'Schedule Visit' },
  { value: 'payment' as EnquiryTopic, label: 'Payment' },
  { value: 'sales' as EnquiryTopic, label: 'Sales' },
  { value: 'info' as EnquiryTopic, label: 'Information' },
];

export function EnquiriesNewForm({
  property,
  userTo,
  replyTo,
  onSuccess,
  onNeedSignIn,
}: EnquiriesNewFormProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const enquiries = useAppSelector(selectEnquiries);
  const { restricted, showAlert } = useRestriction();

  const [title, setTitle] = useState(replyTo ? `Re: ${replyTo.title}` : '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState<EnquiryTopic>(
    replyTo?.topic ? (replyTo.topic as EnquiryTopic) : ('info' as EnquiryTopic)
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    email?: string;
    content?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!title || title.length < 8) {
      newErrors.title = 'Title must be at least 8 characters';
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!content || content.length < 8) {
      newErrors.content = 'Message content must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    if (restricted) {
      await showAlert();
      setSubmitting(false);
      onSuccess?.();
      return;
    }

    if (!user) {
      setSubmitting(false);
      onNeedSignIn?.();
      return;
    }

    if (enquiries.length === 0) {
      void dispatch(fetchEnquiries());
    }

    const payload: CreateEnquiryPayload = {
      title,
      content,
      topic,
      property_id: property.property_id ?? '',
      to_user_id: userTo,
      ...(replyTo ? { replyTo: replyTo.enquiry_id } : {}),
    };

    try {
      await dispatch(createEnquiry(payload)).unwrap();
      toast.success('Success, message is sent.');
      setTitle('');
      setEmail('');
      setContent('');
      setTopic('info' as EnquiryTopic);
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong, please try again later.';
      toast.error(`Error: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      className="space-y-4"
    >
      <div>
        <Input
          type="text"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          placeholder="Enter enquiry title"
        />
      </div>

      <div>
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.content ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your message"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-500">{errors.content}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Topic
        </label>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value as EnquiryTopic)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {TOPIC_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={submitting}
        className="w-full"
      >
        {submitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
