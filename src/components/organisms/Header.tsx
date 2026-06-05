import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export interface HeaderProps {
  showMenuButton?: boolean;
  onMenuPress?: () => void;
  hasNotifications?: boolean;
}

export default function Header({
  showMenuButton = false,
  onMenuPress,
  hasNotifications = true,
}: HeaderProps) {
  const badgeScale = useSharedValue(1);

  useEffect(() => {
    if (!hasNotifications) {
      badgeScale.value = 1;
      return;
    }

    badgeScale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 900 }),
        withTiming(1, { duration: 900 }),
      ),
      -1,
      false,
    );
  }, [badgeScale, hasNotifications]);

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(260)}
      className="flex-row items-center justify-between border-b border-light-gray bg-primary px-5 py-4"
    >
      <View className="flex-row items-center gap-3">
        {showMenuButton ? (
          <Pressable
            accessibilityLabel="Abrir menu lateral"
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center bg-primary"
            onPress={onMenuPress}
          >
            <Ionicons color="#FFFFFF" name="menu-outline" size={22} />
          </Pressable>
        ) : null}
       
      </View>

      <View className="flex-row items-center gap-3">
        <Animated.View
          entering={FadeInRight.delay(80).duration(240)}
          className="relative h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-primary"
        >
          <Ionicons color="#FFFFFF" name="notifications-outline" size={20} />
          {hasNotifications ? (
            <Animated.View
              style={badgeAnimatedStyle}
              className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-accent"
            />
          ) : null}
        </Animated.View>

        <Animated.View
          entering={FadeInRight.delay(140).duration(240)}
          className="h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-accent"
        >
          <Ionicons color="#FFFFFF" name="person-outline" size={20} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}
