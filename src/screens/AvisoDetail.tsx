import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import Card from '../components/atoms/Card';
import type { Notice } from '../services/viewModels';

interface AvisoDetailProps {
  notice?: Notice | null;
  onBack?: () => void;
}

export default function AvisoDetail({ notice, onBack }: AvisoDetailProps) {
  if (!notice) {
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

        <Card width="full">
          <Text className="font-body text-base text-med-gray">
            No se encontró el aviso solicitado.
          </Text>
        </Card>
      </View>
    );
  }

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
          Detalle del aviso
        </Text>
        <Text className="font-body text-base text-med-gray">
          Información publicada para consulta de los residentes.
        </Text>
      </View>

      <Card width="full">
        <View className="gap-5">
          <View className="gap-2">
            <Text className="font-heading text-2xl leading-8 text-primary">
              {notice.title}
            </Text>
            <Text className="font-body text-sm text-med-gray">
              {notice.date}
            </Text>
          </View>

          <View className="gap-2 rounded-2xl bg-[#F8F7FA] p-4">
            <Text className="font-heading text-sm text-primary">
              Publicado por
            </Text>
            <Text className="font-body-semibold text-base text-primary">
              {notice.publishedBy}
            </Text>
          </View>

          <Image
            accessibilityLabel={notice.title}
            className="h-56 w-full rounded-2xl"
            resizeMode="cover"
            source={{ uri: notice.imageUrl }}
          />

          <View className="gap-4">
            {notice.content.map((paragraph) => (
              <Text
                key={paragraph}
                className="font-body text-base leading-7 text-primary"
              >
                {paragraph}
              </Text>
            ))}
          </View>
        </View>
      </Card>
    </View>
  );
}
