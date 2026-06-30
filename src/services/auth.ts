import { api } from './api';
import type {
  AuthResponse,
  AuthUser,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  RegisterPushTokenPayload,
  UpdateMePayload,
} from './types';

export async function login(payload: LoginPayload) {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  const { data } = await api.post<ForgotPasswordResponse>(
    '/auth/forgot-password',
    payload,
  );
  return data;
}

export async function getMe() {
  const { data } = await api.get<AuthUser>('/auth/me');
  return data;
}

export async function updateMe(payload: UpdateMePayload) {
  const { data } = await api.patch<AuthUser>('/auth/me', payload);
  return data;
}

export async function registerPushToken(payload: RegisterPushTokenPayload) {
  const { data } = await api.post<{ success: boolean }>(
    '/auth/push-tokens',
    payload,
  );
  return data;
}

export async function unregisterPushToken(token: string) {
  const { data } = await api.delete<{ success: boolean }>('/auth/push-tokens', {
    data: { token },
  });
  return data;
}
