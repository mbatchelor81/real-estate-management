export type UserNotificationType = 'ACCOUNT' | 'ENQUIRY' | 'PROPERTY' | 'SYSTEM';

export const UserNotificationTypeValues = {
  Account: 'ACCOUNT',
  Enquiry: 'ENQUIRY',
  Property: 'PROPERTY',
  System: 'SYSTEM',
} as const;

export interface MarkAsReadPayload {
  id: string | string[];
}

export interface DeleteNotificationPayload {
  id: string | string[];
}
