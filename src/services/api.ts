import axios from 'axios';
import { Platform } from 'react-native';

function getEnvValue(value?: string) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

const fallbackBaseUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

const platformBaseUrl = Platform.select({
  ios: getEnvValue(process.env.EXPO_PUBLIC_API_URL_IOS),
  android: getEnvValue(process.env.EXPO_PUBLIC_API_URL_ANDROID),
  default: undefined,
});

export const API_BASE_URL =
  platformBaseUrl ??
  getEnvValue(process.env.EXPO_PUBLIC_API_URL) ??
  fallbackBaseUrl;

let accessToken: string | null = null;

export function setApiAccessToken(token: string | null) {
  accessToken = token;
}

export function getApiAccessToken() {
  return accessToken;
}

export function buildApiUrl(path?: string | null) {
  if (!path) {
    return '';
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
  timeout: 10_000,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});
