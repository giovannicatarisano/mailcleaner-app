export type EmailProvider = 'gmail' | 'outlook' | 'libero' | 'yahoo' | 'imap';

export interface EmailAccount {
  id: string;
  email: string;
  provider: EmailProvider;
  name: string;
  status: 'connected' | 'syncing' | 'error';
  totalEmails: number;
  unreadEmails: number;
  storageUsedMb: number;
  lastCleanedAt?: string;
  imapHost?: string;
  imapPort?: number;
  useSsl?: boolean;
}

export interface RuleConditions {
  olderThanDays?: number; // e.g. 7, 15, 30
  senders?: string[]; // e.g. ["*@newsletter.it", "promo@zalando.it"]
  subjectKeywords?: string[]; // e.g. ["Sconto", "Offerta", "Saldi", "Newsletter"]
  unreadOnly?: boolean;
  minSizeKb?: number;
  hasAttachments?: boolean;
}

export interface RuleWhitelist {
  senders: string[]; // protected senders/domains
  protectStarred: boolean;
  protectReceipts: boolean; // protect orders/invoices
}

export interface CleanRule {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  targetAccountIds: 'all' | string[];
  conditions: RuleConditions;
  action: 'trash' | 'permanent_delete';
  whitelist: RuleWhitelist;
  createdAt: string;
  lastAppliedAt?: string;
  stats: {
    emailsMatched: number;
    storageFreedMb: number;
  };
}

export interface EmailMessage {
  id: string;
  accountId: string;
  accountEmail: string;
  sender: string;
  senderName: string;
  subject: string;
  date: string; // ISO string
  sizeKb: number;
  isRead: boolean;
  isStarred: boolean;
  isReceipt: boolean;
  snippet: string;
  folder: 'inbox' | 'promotions' | 'social' | 'spam' | 'trash';
  status: 'inbox' | 'trashed' | 'deleted';
  trashedAt?: string;
  matchedRuleId?: string;
  matchedRuleName?: string;
}

export interface CleanHistoryLog {
  id: string;
  timestamp: string;
  accountIds: string[];
  emailsCleaned: number;
  storageFreedMb: number;
  action: 'trash' | 'permanent_delete';
  ruleBreakdown: { ruleName: string; count: number }[];
  isDailyAutoRun: boolean;
  executionDurationMs: number;
}

export interface AppSettings {
  autoCleanEnabled: boolean;
  scheduledTime: string; // "03:00"
  defaultAction: 'trash' | 'permanent_delete';
  autoEmptyTrashDays: number; // 30
  notificationsEnabled: boolean;
  devicePreview: 'iphone' | 'pixel' | 'fluid';
}
