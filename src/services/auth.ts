import { api } from './api';
import type {
  AuthResponse,
  AuthUser,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
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

