import { api } from './api';
import type {
  CreateVisitorAccessPayload,
  VisitorAccessCreatedDto,
  VisitorAccessDto,
  VisitorAccessListResponse,
  RegisterVisitorAccessPayload,
  ValidateVisitorAccessPayload,
  ValidateVisitorAccessResponse,
  VisitorAccessLogsResponse,
} from './types';

export async function createVisitorAccess(payload: CreateVisitorAccessPayload) {
  const { data } = await api.post<VisitorAccessCreatedDto>(
    '/visitor-access',
    payload,
  );
  return data;
}

export async function getMyVisitorAccesses() {
  const { data } = await api.get<VisitorAccessListResponse>('/visitor-access/my');
  return data.data;
}

export async function cancelVisitorAccess(accessId: number) {
  const { data } = await api.patch<VisitorAccessDto>(
    `/visitor-access/${accessId}/cancel`,
  );
  return data;
}

export async function validateVisitorAccess(
  payload: ValidateVisitorAccessPayload,
) {
  const { data } = await api.post<ValidateVisitorAccessResponse>(
    '/visitor-access/validate',
    payload,
  );
  return data;
}

export async function registerVisitorAccessEntry(
  accessId: number,
  payload: RegisterVisitorAccessPayload,
) {
  const { data } = await api.post(
    `/visitor-access/${accessId}/entry`,
    payload,
  );
  return data;
}

export async function registerVisitorAccessExit(
  accessId: number,
  payload: RegisterVisitorAccessPayload,
) {
  const { data } = await api.post(
    `/visitor-access/${accessId}/exit`,
    payload,
  );
  return data;
}

export async function getOperatorTodayVisitorAccessLogs() {
  const { data } = await api.get<VisitorAccessLogsResponse>(
    '/visitor-access/operator/today',
  );
  return data.data;
}
