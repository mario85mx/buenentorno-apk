import type { NotificationType } from './types';

export type TransactionStatus =
  | 'Pagado'
  | 'Pendiente'
  | 'Vencido'
  | 'En revisión';
export type TransactionBadgeVariant = 'success' | 'danger' | 'warning';

export interface PaymentTransactionReceipt {
  id: string;
  unit: string;
  types: string;
  amount: string;
  paymentDate: string;
  method: string;
  reference: string;
  trackingKey: string;
  status: string;
  reviewNotes: string;
}

export interface PaymentTransaction {
  id: string;
  concept: string;
  dueDate: string;
  status: TransactionStatus;
  amount: string;
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
  amount: string;
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
  icon: 'wallet-outline' | 'megaphone-outline' | 'ticket-outline' | 'alert-circle-outline';
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
