import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthResponse } from './types';

const SESSION_STORAGE_KEY = '@buenentorno/session';
const NOTIFICATIONS_SEEN_AT_KEY_PREFIX = '@buenentorno/notifications-seen-at';

export async function loadStoredSession() {
  const value = await AsyncStorage.getItem(SESSION_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthResponse;
  } catch {
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export async function storeSession(session: AuthResponse) {
  await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function clearStoredSession() {
  await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
}

function getNotificationSeenAtStorageKey(userId: number) {
  return `${NOTIFICATIONS_SEEN_AT_KEY_PREFIX}:${userId}`;
}

export async function loadNotificationSeenAt(userId: number) {
  return AsyncStorage.getItem(getNotificationSeenAtStorageKey(userId));
}

export async function storeNotificationSeenAt(userId: number, seenAt: string) {
  await AsyncStorage.setItem(getNotificationSeenAtStorageKey(userId), seenAt);
}
