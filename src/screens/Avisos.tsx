import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image, Pressable, Text, View } from 'react-native';
import Card from '../components/atoms/Card';
import { getErrorMessage } from '../services/error';
import { mapNoticeDtoToViewModel } from '../services/mappers';
import { listNotices } from '../services/notices';
import { queryKeys } from '../services/queryKeys';
import type { Notice } from '../services/viewModels';

export type { Notice } from '../services/viewModels';

interface AvisosProps {
  onOpenNoticeDetail?: (notice: Notice) => void;
}

export default function Avisos({ onOpenNoticeDetail }: AvisosProps) {
  const noticesQuery = useQuery({
    queryKey: queryKeys.notices,
    queryFn: listNotices,
    select: (notices) => notices.map(mapNoticeDtoToViewModel),
  });

  return (
    <View className="gap-5">
      <View className="gap-2">
        <Text className="font-heading text-2xl text-primary">Avisos</Text>
        <Text className="font-body text-base text-med-gray">
          Consulta noticias y comunicados recientes de la administración.
        </Text>
      </View>

      <View className="gap-3">
        {noticesQuery.isLoading ? (
          <Card width="full">
            <Text className="font-body text-sm text-med-gray">
              Cargando avisos...
            </Text>
          </Card>
        ) : noticesQuery.error ? (
          <Card width="full">
            <Text className="font-body text-sm text-danger">
              {getErrorMessage(
                noticesQuery.error,
                'No fue posible cargar los avisos.',
              )}
            </Text>
          </Card>
        ) : noticesQuery.data?.length ? (
          noticesQuery.data.map((notice) => (
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
          ))
        ) : (
          <Card width="full">
            <Text className="font-body text-sm text-med-gray">
              No hay avisos publicados todavía.
            </Text>
          </Card>
        )}
      </View>
    </View>
  );
}
