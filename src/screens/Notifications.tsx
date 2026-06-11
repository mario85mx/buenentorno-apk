import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import Card from '../components/atoms/Card';

interface NotificationsProps {
  onBack?: () => void;
}

const notifications = [
  {
    id: 'notification-1',
    title: 'Nuevo Cargo',
    message: 'Se generó el cargo de mantenimiento correspondiente a Junio 2026.',
    time: 'Hace 5 min',
    icon: 'wallet-outline' as const,
    accentClassName: 'bg-danger/10',
    iconColor: '#FF1F1F',
  },
  {
    id: 'notification-2',
    title: 'Nuevo Aviso',
    message: 'La administración publicó un aviso sobre trabajos en áreas comunes.',
    time: 'Hace 1 h',
    icon: 'megaphone-outline' as const,
    accentClassName: 'bg-warning/10',
    iconColor: '#C59D2D',
  },
  {
    id: 'notification-3',
    title: 'Nuevo Ticket',
    message: 'Se actualizó tu ticket de soporte con una nueva respuesta.',
    time: 'Hace 3 h',
    icon: 'ticket-outline' as const,
    accentClassName: 'bg-success/10',
    iconColor: '#83A96A',
  },
];

export default function Notifications({ onBack }: NotificationsProps) {
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
        {notifications.map((notification) => (
          <Card key={notification.id} width="full">
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
                  <Text className="font-heading text-base text-primary">
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
        ))}
      </View>
    </View>
  );
}
