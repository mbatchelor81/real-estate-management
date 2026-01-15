export enum EnquiryTopic {
  Info = 'info',
  Sales = 'sales',
  Schedule = 'schedule',
  Payment = 'payment',
}

export interface EnquiryUser {
  user_id: string;
  keep: boolean;
}

export interface EnquiryProperty {
  property_id: string;
  name: string;
}

export interface EnquiryReplyTo {
  enquiry_id: string;
}

export interface Enquiry {
  enquiry_id: string;
  title: string;
  content: string;
  topic: EnquiryTopic;
  users: {
    from: EnquiryUser;
    to: EnquiryUser;
  };
  property: EnquiryProperty;
  replyTo?: EnquiryReplyTo;
  read: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEnquiryPayload {
  title: string;
  content: string;
  topic: EnquiryTopic;
  property_id: string;
  to_user_id: string;
  replyTo?: string;
}
