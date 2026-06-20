import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Animated,
  Easing,
  Pressable,
  View,
} from 'react-native';

export interface HeaderProps {
  showMenuButton?: boolean;
  onMenuPress?: () => void;
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
  hasNotifications?: boolean;
  notificationCount?: number;
}

export default function Header({
  showMenuButton = false,
  onMenuPress,
  onProfilePress,
  onNotificationsPress,
  hasNotifications = true,
  notificationCount = 0,
}: HeaderProps) {
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const containerTranslateY = useRef(new Animated.Value(-10)).current;
  const notificationsOpacity = useRef(new Animated.Value(0)).current;
  const notificationsTranslateX = useRef(new Animated.Value(10)).current;
  const profileOpacity = useRef(new Animated.Value(0)).current;
  const profileTranslateX = useRef(new Animated.Value(10)).current;
  const badgeScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(containerTranslateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(60),
        Animated.parallel([
          Animated.timing(notificationsOpacity, {
            toValue: 1,
            duration: 180,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(notificationsTranslateX, {
            toValue: 0,
            duration: 180,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(110),
        Animated.parallel([
          Animated.timing(profileOpacity, {
            toValue: 1,
            duration: 180,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(profileTranslateX, {
            toValue: 0,
            duration: 180,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [
    containerOpacity,
    containerTranslateY,
    notificationsOpacity,
    notificationsTranslateX,
    profileOpacity,
    profileTranslateX,
  ]);

  useEffect(() => {
    if (!hasNotifications) {
      badgeScale.stopAnimation();
      badgeScale.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(badgeScale, {
          toValue: 1.14,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(badgeScale, {
          toValue: 1,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => {
      loop.stop();
      badgeScale.stopAnimation();
      badgeScale.setValue(1);
    };
  }, [badgeScale, hasNotifications]);

  return (
    <Animated.View
      className="flex-row items-center justify-between border-b border-light-gray bg-primary px-5 py-4"
      style={{
        opacity: containerOpacity,
        transform: [{ translateY: containerTranslateY }],
      }}
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
        <Pressable
          accessibilityLabel="Abrir notificaciones"
          accessibilityRole="button"
          onPress={onNotificationsPress}
        >
          <Animated.View
            className="relative h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-primary"
            style={{
              opacity: notificationsOpacity,
              transform: [{ translateX: notificationsTranslateX }],
            }}
          >
            <Ionicons color="#FFFFFF" name="notifications-outline" size={20} />
            {hasNotifications ? (
              <Animated.View
                className="absolute right-0.5 top-0.5 min-h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1"
                style={{ transform: [{ scale: badgeScale }] }}
              >
                <Animated.Text className="font-heading text-[10px] text-white">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Animated.Text>
              </Animated.View>
            ) : null}
          </Animated.View>
        </Pressable>

        <Pressable
          accessibilityLabel="Abrir perfil"
          accessibilityRole="button"
          onPress={onProfilePress}
        >
          <Animated.View
            className="h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-accent"
            style={{
              opacity: profileOpacity,
              transform: [{ translateX: profileTranslateX }],
            }}
          >
            <Ionicons color="#FFFFFF" name="person-outline" size={20} />
          </Animated.View>
        </Pressable>
      </View>
    </Animated.View>
  );
}
