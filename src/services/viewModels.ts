import type { NotificationType } from './types';

export type TransactionStatus =
  | 'Pagado'
  | 'Pendiente'
  | 'Vencido'
  | 'En revisión'
  | 'Rechazado'
  | 'Cancelado'
  | 'Parcial';
export type TransactionBadgeVariant = 'success' | 'danger' | 'warning';

export interface PaymentConceptDetail {
  label: string;
  amount: string;
}

export interface PaymentTransactionReceipt {
  id: string;
  unit: string;
  types: string;
  concepts: string[];
  conceptDetails: PaymentConceptDetail[];
  amount: string;
  conceptsAmount: string;
  creditGenerated: string;
  paymentDate: string;
  method: string;
  reference: string;
  trackingKey: string;
  status: string;
  reviewNotes: string;
}

export interface PaymentTransaction {
  id: string;
  kind: 'charge' | 'payment';
  concept: string;
  concepts: string[];
  summary: string;
  dateLabel: string;
  dueDate: string;
  status: TransactionStatus;
  amount: string;
  reference: string;
  method: string;
  badgeVariant: TransactionBadgeVariant;
  receipt?: PaymentTransactionReceipt | null;
}

export type ReceiptStatus =
  | 'Pagado'
  | 'En revisión'
  | 'Rechazado'
  | 'Cancelado'
  | 'Pendiente'
  | 'Parcial';
export type ReceiptBadgeVariant = 'warning' | 'success' | 'danger';

export interface PaymentReceipt {
  id: string;
  type: string;
  unit: string;
  types: string;
  concepts: string[];
  conceptDetails: PaymentConceptDetail[];
  amount: string;
  conceptsAmount: string;
  creditGenerated: string;
  generated: string;
  paymentDate: string;
  dueDate: string;
  method: string;
  reference: string;
  trackingKey: string;
  status: ReceiptStatus;
  review: string;
  voucher: string;
  fileUrl: string;
  mimeType?: string | null;
  badgeVariant: ReceiptBadgeVariant;
}

export interface Notice {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  publishedBy: string;
  imageUrl: string;
  content: string[];
}

export interface NotificationViewModel {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  createdAt: string;
  href?: string;
  icon:
    | 'wallet-outline'
    | 'megaphone-outline'
    | 'ticket-outline'
    | 'calendar-outline'
    | 'alert-circle-outline';
  accentClassName: string;
  iconColor: string;
}

export interface HomeOverview {
  periodLabel: string;
  houseLabel: string;
  creditLabel: string;
  pendingBalance: string;
  maintenanceBalance: string;
  waterBalance: string;
  otherBalance: string;
}
