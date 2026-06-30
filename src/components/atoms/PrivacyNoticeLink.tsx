import { Linking, Pressable, Text } from 'react-native';

const PRIVACY_NOTICE_URL = 'https://buenentorno.com/aviso.html';

export default function PrivacyNoticeLink() {
  const handlePress = () => {
    void Linking.openURL(PRIVACY_NOTICE_URL);
  };

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel="Aviso de Privacidad"
      hitSlop={8}
      onPress={handlePress}
    >
      <Text className="font-body text-sm text-[#2D5BBD] underline">
        Aviso de Privacidad
      </Text>
    </Pressable>
  );
}
