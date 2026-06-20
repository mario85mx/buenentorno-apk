import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Animated,
  Easing,
  Pressable,
  Text,
  View,
} from 'react-native';

export interface NavbarItem {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}

export interface NavbarProps {
  items: NavbarItem[];
  activeItem: string;
  onSelectItem?: (key: string) => void;
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function FadeSlideUp({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
    >
      {children}
    </Animated.View>
  );
}

export default function Navbar({
  items,
  activeItem,
  onSelectItem,
}: NavbarProps) {
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const containerTranslateY = useRef(new Animated.Value(14)).current;

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
    ]).start();
  }, [containerOpacity, containerTranslateY]);

  return (
    <Animated.View
      className="flex-row border-t border-light-gray bg-white px-3 py-3"
      style={{
        opacity: containerOpacity,
        transform: [{ translateY: containerTranslateY }],
      }}
    >
      {items.map((item, index) => {
        const isActive = item.key === activeItem;

        return (
          <FadeSlideUp key={item.key} delay={60 + index * 35}>
            <View className="flex-1">
              <Pressable
                accessibilityRole="button"
                className={cn(
                  'items-center justify-center gap-1 rounded-2xl py-2',
                  isActive && 'bg-[#FCECEF]',
                )}
                onPress={() => onSelectItem?.(item.key)}
              >
                <Ionicons
                  color={isActive ? '#E2354D' : '#9CA3AF'}
                  name={item.icon}
                  size={20}
                />
                <Text
                  className={cn(
                    'font-body text-sm',
                    isActive ? 'text-accent' : 'text-med-gray',
                  )}
                >
                  {item.label}
                </Text>
              </Pressable>
            </View>
          </FadeSlideUp>
        );
      })}
    </Animated.View>
  );
}
