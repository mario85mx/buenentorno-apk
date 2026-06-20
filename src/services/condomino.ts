import { api } from './api';
import type {
  CondominoDetailDto,
  DashboardSummaryDto,
  NotificationsResponse,
  ReportPaymentPayload,
} from './types';

export async function getMyCondominoDetail() {
  const { data } = await api.get<CondominoDetailDto>('/condominos/me');
  return data;
}

export async function getNotifications() {
  const { data } = await api.get<NotificationsResponse>(
    '/condominos/notifications',
  );
  return data.data;
}

export async function getDashboardSummary() {
  const { data } = await api.get<DashboardSummaryDto>('/dashboard/summary');
  return data;
}

export async function reportPayment(payload: ReportPaymentPayload) {
  const form = new FormData();
  form.append('unitId', String(payload.unitId));
  form.append('amount', String(payload.amount));
  form.append('paymentDate', payload.paymentDate);
  form.append('method', payload.method);

  if (payload.reference) {
    form.append('reference', payload.reference);
  }

  if (payload.trackingKey) {
    form.append('trackingKey', payload.trackingKey);
  }

  if (payload.notes) {
    form.append('notes', payload.notes);
  }

  if (payload.receiptNotes) {
    form.append('receiptNotes', payload.receiptNotes);
  }

  if (payload.allocations?.length) {
    form.append('allocations', JSON.stringify(payload.allocations));
  }

  if (payload.file) {
    form.append('file', {
      uri: payload.file.uri,
      name: payload.file.name,
      type: payload.file.mimeType,
    } as never);
  }

  const { data } = await api.post('/condominos/me/payments/report', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
}
