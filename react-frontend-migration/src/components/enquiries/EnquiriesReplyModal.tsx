import { useState } from 'react';
import { Modal } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createEnquiry } from '@/store/slices/enquiriesSlice';
import { selectAuthUser } from '@/store/slices/authSlice';
import { useRestriction } from '@/hooks';
import { EnquiryTopic } from '@/types';
import type { EnquiryProperty, CreateEnquiryPayload } from '@/types';
import toast from 'react-hot-toast';

interface ReplyToInfo {
  enquiry_id: string;
  title: string;
  topic: string;
}

interface EnquiriesReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  property: EnquiryProperty;
  replyTo?: ReplyToInfo;
  userTo: string;
}

interface FormData {
  title: string;
  email: string;
  content: string;
  topic: EnquiryTopic;
}

interface FormErrors {
  title?: string;
  email?: string;
  content?: string;
}

const TOPIC_OPTIONS = [
  { value: EnquiryTopic.Schedule, label: 'Schedule Visit' },
  { value: EnquiryTopic.Payment, label: 'Payment' },
  { value: EnquiryTopic.Sales, label: 'Sales' },
  { value: EnquiryTopic.Info, label: 'Information' },
];

export function EnquiriesReplyModal({
  isOpen,
  onClose,
  title = 'Reply Enquiry',
  property,
  replyTo,
  userTo,
}: EnquiriesReplyModalProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const { restricted, showAlert } = useRestriction();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    email: user?.email ?? '',
    content: '',
    topic: EnquiryTopic.Info,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title || formData.title.length < 8) {
      newErrors.title = 'Title must be at least 8 characters';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.content || formData.content.length < 8) {
      newErrors.content = 'Message content must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    if (restricted) {
      onClose();
      await showAlert();
      return;
    }

    if (!user) {
      toast.error('Please sign in to send an enquiry');
      return;
    }

    setSubmitting(true);

    const payload: CreateEnquiryPayload = {
      title: formData.title,
      content: formData.content,
      topic: formData.topic,
      property_id: property.property_id,
      to_user_id: userTo,
      replyTo: replyTo?.enquiry_id,
    };

    try {
      await dispatch(createEnquiry(payload)).unwrap();
      toast.success('Message sent successfully');
      setFormData({
        title: '',
        email: user.email,
        content: '',
        topic: EnquiryTopic.Info,
      });
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter enquiry title"
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your email"
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={6}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your message"
          />
          {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
        </div>

        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
            Topic
          </label>
          <select
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TOPIC_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-green-600 px-4 py-3 text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Sending...' : 'Submit'}
        </button>
      </form>
    </Modal>
  );
}
