import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { NotificationType } from './types';

const notificationTypes: NotificationType[] = [
  'NEW_CHARGE',
  'PAYMENT_REVIEW',
  'PAYMENT_APPROVED',
  'PAYMENT_REJECTED',
  'VISITOR_ACCESS_APPROVED',
  'VISITOR_ACCESS_ENTRY_REGISTERED',
  'COMMON_AREA_RESERVATION_CREATED',
  'COMMON_AREA_RESERVATION_APPROVED',
  'TICKET_CREATED',
  'TICKET_MESSAGE',
  'NOTICE',
];

export interface PushNotificationPayload {
  notificationId?: string;
  type?: NotificationType;
  title?: string;
  message?: string;
  href?: string;
  createdAt?: string;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function isNotificationType(value: unknown): value is NotificationType {
  return (
    typeof value === 'string' &&
    notificationTypes.includes(value as NotificationType)
  );
}

function getProjectId() {
  const easProjectId = Constants.easConfig?.projectId;

  if (typeof easProjectId === 'string' && easProjectId.trim().length > 0) {
    return easProjectId;
  }

  const expoProjectId = Constants.expoConfig?.extra?.eas?.projectId;

  if (typeof expoProjectId === 'string' && expoProjectId.trim().length > 0) {
    return expoProjectId;
  }

  return undefined;
}

function extractContent(
  notification: Notifications.Notification | Notifications.NotificationResponse,
) {
  if ('notification' in notification) {
    return notification.notification.request.content;
  }

  return notification.request.content;
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'General',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#18052E',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (finalStatus !== 'granted') {
    const permission = await Notifications.requestPermissionsAsync();
    finalStatus = permission.status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = getProjectId();

  if (!projectId) {
    throw new Error('Expo projectId is not configured for push notifications.');
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}

export function getPushNotificationPayload(
  notification: Notifications.Notification | Notifications.NotificationResponse,
): PushNotificationPayload | null {
  const content = extractContent(notification);
  const data = content.data as Record<string, unknown>;
  const type = isNotificationType(data.type) ? data.type : undefined;
  const href =
    typeof data.href === 'string' && data.href.trim().length > 0
      ? data.href
      : undefined;
  const createdAt =
    typeof data.createdAt === 'string' && data.createdAt.trim().length > 0
      ? data.createdAt
      : undefined;
  const notificationId =
    typeof data.notificationId === 'string' &&
    data.notificationId.trim().length > 0
      ? data.notificationId
      : undefined;

  if (!type && !href) {
    return null;
  }

  return {
    notificationId,
    type,
    title: content.title ?? undefined,
    message: content.body ?? undefined,
    href,
    createdAt,
  };
}
