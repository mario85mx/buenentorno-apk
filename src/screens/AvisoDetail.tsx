import { useAppThemeColors } from '../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import Card from '../components/atoms/Card';
import type { Notice } from '../services/viewModels';

interface AvisoDetailProps {
  notice?: Notice | null;
  onBack?: () => void;
}

export default function AvisoDetail({ notice, onBack }: AvisoDetailProps) {
  const themeColors = useAppThemeColors();
  if (!notice) {
    return (
      <View className="gap-5">
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center self-start rounded-full px-1 py-1"
          onPress={onBack}
        >
          <Ionicons color={themeColors.text} name="chevron-back" size={20} />
          <Text className="font-heading text-sm text-primary dark:text-[#F7F2FB]">Volver</Text>
        </Pressable>

        <Card width="full">
          <Text className="font-body text-base text-med-gray dark:text-[#B9B2C2]">
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
        <Ionicons color={themeColors.text} name="chevron-back" size={20} />
        <Text className="font-heading text-sm text-primary dark:text-[#F7F2FB]">Volver</Text>
      </Pressable>

      <View className="gap-2">
        <Text className="font-heading text-2xl text-primary dark:text-[#F7F2FB]">
          Detalle del aviso
        </Text>
        <Text className="font-body text-base text-med-gray dark:text-[#B9B2C2]">
          Información publicada para consulta de los residentes.
        </Text>
      </View>

      <Card width="full">
        <View className="gap-5">
          <View className="gap-2">
            <Text className="font-heading text-2xl leading-8 text-primary dark:text-[#F7F2FB]">
              {notice.title}
            </Text>
            <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
              {notice.date}
            </Text>
          </View>

          <View className="gap-2 rounded-2xl bg-[#F8F7FA] dark:bg-[#18131F] p-4">
            <Text className="font-heading text-sm text-primary dark:text-[#F7F2FB]">
              Publicado por
            </Text>
            <Text className="font-body-semibold text-base text-primary dark:text-[#F7F2FB]">
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
                className="font-body text-base leading-7 text-primary dark:text-[#F7F2FB]"
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
