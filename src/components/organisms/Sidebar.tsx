import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, {
  FadeInLeft,
  LinearTransition,
} from 'react-native-reanimated';

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

export default function Sidebar({
  items,
  activeItem,
  onSelectItem,
}: SidebarProps) {
  return (
    <Animated.View
      entering={FadeInLeft.duration(180)}
      className="h-full w-full border-r border-[#2E2145] bg-primary px-4 pb-6 pt-8"
    >
      <View className="mb-8">
        <Image
          accessibilityLabel="Buen Entorno"
          resizeMode="contain"
          source={require('../../../assets/logo-w.png')}
          style={{ width: 149, height: 40 }}
        />
      </View>

      <View className="gap-2">
        {items.map((item, index) => {
          const isActive = item.key === activeItem;

          return (
            <Animated.View
              key={item.key}
              entering={FadeInLeft.delay(70 + index * 45).duration(220)}
              layout={LinearTransition.duration(180)}
            >
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
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );
}
