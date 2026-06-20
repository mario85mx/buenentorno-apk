import { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../atoms/Card';

export interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <LinearGradient
      colors={['#2D1B45', '#E2354D']}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-5 py-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center gap-6">
            <Card className="rounded-[28px] px-5 py-6">
              <View className="gap-6">
                <View className="gap-3">
                  <Image
                    accessibilityLabel="Buen Entorno"
                    resizeMode="contain"
                    source={require('../../../assets/logo.png')}
                    style={{ width: 152, height: 42 }}
                  />
                  <View className="gap-2">
                    <Text className="font-heading text-3xl text-primary">{title}</Text>
                    <Text className="font-body text-base leading-6 text-med-gray">
                      {subtitle}
                    </Text>
                  </View>
                </View>

                <View className="gap-4">{children}</View>

                {footer ? <View>{footer}</View> : null}
              </View>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
