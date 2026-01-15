import { useState, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { EnquiriesNewForm } from './EnquiriesNewForm';
import type { Property } from '@/types';

interface ReplyToInfo {
  enquiry_id: string;
  title: string;
  topic: string;
}

interface EnquiriesReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  property: Partial<Property>;
  userTo: string;
  replyTo?: ReplyToInfo;
  onNeedSignIn?: () => void;
}

export function EnquiriesReplyModal({
  isOpen,
  onClose,
  title = 'Reply to Enquiry',
  property,
  userTo,
  replyTo,
  onNeedSignIn,
}: EnquiriesReplyModalProps): React.ReactElement {
  const handleSuccess = useCallback((): void => {
    onClose();
  }, [onClose]);

  const handleNeedSignIn = useCallback((): void => {
    onClose();
    onNeedSignIn?.();
  }, [onClose, onNeedSignIn]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <EnquiriesNewForm
        property={property}
        userTo={userTo}
        replyTo={replyTo}
        onSuccess={handleSuccess}
        onNeedSignIn={handleNeedSignIn}
      />
    </Modal>
  );
}

interface UseEnquiriesReplyModalOptions {
  property: Partial<Property>;
  userTo: string;
  replyTo?: ReplyToInfo;
  onNeedSignIn?: () => void;
}

interface UseEnquiriesReplyModalReturn {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  ModalComponent: React.ReactElement;
}

export function useEnquiriesReplyModal({
  property,
  userTo,
  replyTo,
  onNeedSignIn,
}: UseEnquiriesReplyModalOptions): UseEnquiriesReplyModalReturn {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback((): void => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback((): void => {
    setIsOpen(false);
  }, []);

  const title = replyTo ? `Re: ${replyTo.title}` : 'Create Enquiry';

  const ModalComponent = (
    <EnquiriesReplyModal
      isOpen={isOpen}
      onClose={closeModal}
      title={title}
      property={property}
      userTo={userTo}
      replyTo={replyTo}
      onNeedSignIn={onNeedSignIn}
    />
  );

  return {
    isOpen,
    openModal,
    closeModal,
    ModalComponent,
  };
}
