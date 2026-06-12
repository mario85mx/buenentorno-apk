import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import Card from '../components/atoms/Card';

export interface Notice {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  publishedBy: string;
  imageUrl: string;
  content: string[];
}

export const noticeItems: Notice[] = [
  {
    id: 'notice-1',
    title: 'Mantenimiento preventivo en cisterna',
    excerpt:
      'El viernes 14 de junio se realizará mantenimiento preventivo en la cisterna principal.',
    date: '11/06/2026',
    publishedBy: 'Administración Buen Entorno',
    imageUrl:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    content: [
      'Se informa a todos los residentes que el viernes 14 de junio de 2026 se llevará a cabo mantenimiento preventivo en la cisterna principal del condominio.',
      'Durante los trabajos, el suministro de agua podría presentar variaciones de presión entre las 9:00 a.m. y las 2:00 p.m. Les pedimos tomar previsiones para sus actividades dentro de ese horario.',
      'El servicio quedará restablecido una vez concluidas las labores y se notificará cualquier cambio adicional por este mismo medio.',
    ],
  },
  {
    id: 'notice-2',
    title: 'Poda programada en áreas comunes',
    excerpt:
      'La cuadrilla de jardinería realizará poda y limpieza general en jardines y andadores.',
    date: '09/06/2026',
    publishedBy: 'Coordinación de Mantenimiento',
    imageUrl:
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80',
    content: [
      'El próximo martes se llevará a cabo la poda programada en las áreas verdes, camellones y andadores del conjunto.',
      'Se solicita a los residentes evitar dejar objetos personales en jardines y mantener libres los accesos cercanos a las zonas de trabajo para facilitar las maniobras.',
      'Estas acciones forman parte del programa mensual de conservación para mantener los espacios comunes en condiciones seguras y ordenadas.',
    ],
  },
  {
    id: 'notice-3',
    title: 'Actualización de reglamento para uso del salón',
    excerpt:
      'Se publicó una actualización con nuevas reglas de reservación y horario para el salón de usos múltiples.',
    date: '06/06/2026',
    publishedBy: 'Comité de Convivencia',
    imageUrl:
      'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
    content: [
      'Se actualizó el reglamento para el uso del salón de usos múltiples con el objetivo de mejorar la convivencia y ordenar el proceso de reservación.',
      'Entre los cambios principales se incluyen nuevos horarios, tiempos mínimos de solicitud y lineamientos de limpieza y entrega del espacio al finalizar cada evento.',
      'Les recomendamos revisar el aviso completo antes de realizar su próxima reservación para evitar contratiempos o rechazos por información incompleta.',
    ],
  },
];

interface AvisosProps {
  onOpenNoticeDetail?: (notice: Notice) => void;
}

export default function Avisos({ onOpenNoticeDetail }: AvisosProps) {
  return (
    <View className="gap-5">
      <View className="gap-2">
        <Text className="font-heading text-2xl text-primary">Avisos</Text>
        <Text className="font-body text-base text-med-gray">
          Consulta noticias y comunicados recientes de la administración.
        </Text>
      </View>

      <View className="gap-3">
        {noticeItems.map((notice) => (
          <Pressable
            key={notice.id}
            accessibilityHint="Abre el detalle del aviso"
            accessibilityRole="button"
            className="rounded-lg"
            onPress={() => onOpenNoticeDetail?.(notice)}
          >
            <Card className="rounded-lg border border-light-gray px-4 py-4">
              <View className="gap-3">
                <Image
                  accessibilityLabel={notice.title}
                  className="h-44 w-full rounded-2xl"
                  resizeMode="cover"
                  source={{ uri: notice.imageUrl }}
                />

                <View className="flex-row items-start justify-between gap-3">
                  <Text className="flex-1 font-heading text-lg text-primary">
                    {notice.title}
                  </Text>
                  <Ionicons
                    color="#9CA3AF"
                    name="chevron-forward"
                    size={18}
                  />
                </View>

                <Text className="font-body text-sm leading-6 text-primary">
                  {notice.excerpt}
                </Text>

                <Text className="font-body text-xs text-med-gray">
                  {notice.date}
                </Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
