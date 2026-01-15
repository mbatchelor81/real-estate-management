export type UserNotificationType = 'ACCOUNT' | 'ENQUIRY' | 'PROPERTY' | 'SYSTEM';

export const UserNotificationTypeValues = {
  Account: 'ACCOUNT',
  Enquiry: 'ENQUIRY',
  Property: 'PROPERTY',
  System: 'SYSTEM',
} as const;
