import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeInUp,
  LinearTransition,
} from 'react-native-reanimated';

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

export default function Navbar({
  items,
  activeItem,
  onSelectItem,
}: NavbarProps) {
  return (
    <Animated.View
      entering={FadeInUp.duration(260)}
      className="flex-row border-t border-light-gray bg-white px-3 py-3"
    >
      {items.map((item, index) => {
        const isActive = item.key === activeItem;

        return (
          <Animated.View
            key={item.key}
            entering={FadeInUp.delay(60 + index * 40).duration(220)}
            layout={LinearTransition.duration(180)}
            className="flex-1"
          >
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
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}
