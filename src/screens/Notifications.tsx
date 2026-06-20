import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Pressable, Text, View } from 'react-native';
import Card from '../components/atoms/Card';
import { getNotifications } from '../services/condomino';
import { getErrorMessage } from '../services/error';
import { mapNotificationToViewModel } from '../services/mappers';
import { queryKeys } from '../services/queryKeys';
import type { NotificationViewModel } from '../services/viewModels';

interface NotificationsProps {
  onBack?: () => void;
  onOpenNotification?: (notification: NotificationViewModel) => void;
  onMarkAsSeen?: () => void;
}

export default function Notifications({
  onBack,
  onOpenNotification,
  onMarkAsSeen,
}: NotificationsProps) {
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: getNotifications,
    select: (notifications) => notifications.map(mapNotificationToViewModel),
  });

  useEffect(() => {
    if (notificationsQuery.data?.length) {
      onMarkAsSeen?.();
    }
  }, [notificationsQuery.data, onMarkAsSeen]);

  return (
    <View className="gap-5">
      <Pressable
        accessibilityRole="button"
        className="flex-row items-center self-start rounded-full px-1 py-1"
        onPress={onBack}
      >
        <Ionicons color="#18052E" name="chevron-back" size={20} />
        <Text className="font-heading text-sm text-primary">Volver</Text>
      </Pressable>

      <View className="gap-2">
        <Text className="font-heading text-2xl text-primary">
          Notificaciones
        </Text>
        <Text className="font-body text-base text-med-gray">
          Revisa los últimos movimientos y eventos relevantes de tu cuenta.
        </Text>
      </View>

      <View className="gap-3">
        {notificationsQuery.isLoading ? (
          <Card width="full">
            <Text className="font-body text-sm text-med-gray">
              Cargando notificaciones...
            </Text>
          </Card>
        ) : notificationsQuery.error ? (
          <Card width="full">
            <Text className="font-body text-sm text-danger">
              {getErrorMessage(
                notificationsQuery.error,
                'No fue posible cargar las notificaciones.',
              )}
            </Text>
          </Card>
        ) : notificationsQuery.data?.length ? (
          notificationsQuery.data.map((notification) => (
            <Pressable
              key={notification.id}
              accessibilityHint="Abre el contenido relacionado con la notificación"
              accessibilityRole="button"
              onPress={() => onOpenNotification?.(notification)}
            >
              <Card width="full">
                <View className="flex-row items-start gap-3">
                  <View
                    className={`h-11 w-11 items-center justify-center rounded-full ${notification.accentClassName}`}
                  >
                    <Ionicons
                      color={notification.iconColor}
                      name={notification.icon}
                      size={20}
                    />
                  </View>

                  <View className="flex-1 gap-1">
                    <View className="flex-row items-center justify-between gap-3">
                      <Text className="flex-1 font-heading text-base text-primary">
                        {notification.title}
                      </Text>
                      <Text className="font-body text-xs text-med-gray">
                        {notification.time}
                      </Text>
                    </View>

                    <Text className="font-body text-sm leading-5 text-primary">
                      {notification.message}
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))
        ) : (
          <Card width="full">
            <Text className="font-body text-sm text-med-gray">
              No hay notificaciones nuevas.
            </Text>
          </Card>
        )}
      </View>
    </View>
  );
}
