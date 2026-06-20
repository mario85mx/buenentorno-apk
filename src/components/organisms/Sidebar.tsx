import { useEffect, useRef } from 'react';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';

type SidebarIcon =
  | {
      library: 'feather';
      name: React.ComponentProps<typeof Feather>['name'];
    }
  | {
      library: 'ionicons';
      name: React.ComponentProps<typeof Ionicons>['name'];
    }
  | {
      library: 'material-icons';
      name: React.ComponentProps<typeof MaterialIcons>['name'];
    };

export interface SidebarItem {
  key: string;
  label: string;
  icon: SidebarIcon;
}

export interface SidebarProps {
  items: SidebarItem[];
  activeItem: string;
  onSelectItem?: (key: string) => void;
  onLogout?: () => void;
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function SidebarIconView({
  color,
  icon,
}: {
  color: string;
  icon: SidebarIcon;
}) {
  if (icon.library === 'feather') {
    return <Feather color={color} name={icon.name} size={20} />;
  }

  if (icon.library === 'material-icons') {
    return <MaterialIcons color={color} name={icon.name} size={20} />;
  }

  return <Ionicons color={color} name={icon.name} size={20} />;
}

function FadeSlideIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-14)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 220,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();
  }, [delay, opacity, translateX]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateX }],
      }}
    >
      {children}
    </Animated.View>
  );
}

export default function Sidebar({
  items,
  activeItem,
  onSelectItem,
  onLogout,
}: SidebarProps) {
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const containerTranslateX = useRef(new Animated.Value(-18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(containerTranslateX, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [containerOpacity, containerTranslateX]);

  return (
    <Animated.View
      className="h-full w-full border-r border-[#2E2145] bg-primary px-4 pb-6 pt-8"
      style={{
        opacity: containerOpacity,
        transform: [{ translateX: containerTranslateX }],
      }}
    >
      <View className="flex-1">
        <FadeSlideIn delay={40}>
          <View className="mb-8">
            <Image
              accessibilityLabel="Buen Entorno"
              resizeMode="contain"
              source={require('../../../assets/logo-w.png')}
              style={{ width: 149, height: 40 }}
            />
          </View>
        </FadeSlideIn>

        <View className="gap-2">
          {items.map((item, index) => {
            const isActive = item.key === activeItem;

            return (
              <FadeSlideIn key={item.key} delay={80 + index * 45}>
                <Pressable
                  accessibilityRole="button"
                  className={cn(
                    'flex-row items-center gap-3 rounded-2xl px-4 py-3',
                    isActive ? 'bg-white' : 'bg-transparent',
                  )}
                  onPress={() => onSelectItem?.(item.key)}
                >
                  <SidebarIconView
                    color={isActive ? '#18052E' : '#FFFFFF'}
                    icon={item.icon}
                  />
                  <Text
                    className={cn(
                      'font-body-semibold text-base',
                      isActive ? 'text-primary' : 'text-white',
                    )}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              </FadeSlideIn>
            );
          })}
        </View>
      </View>

      <FadeSlideIn delay={160}>
        <View className="mt-6 border-t border-white/10 pt-4">
          <Pressable
            accessibilityRole="button"
            className="flex-row items-center gap-3 rounded-2xl px-4 py-3"
            onPress={onLogout}
          >
            <Ionicons color="#FFFFFF" name="log-out-outline" size={20} />
            <Text className="font-body-semibold text-base text-white">
              Cerrar sesión
            </Text>
          </Pressable>
        </View>
      </FadeSlideIn>
    </Animated.View>
  );
}
