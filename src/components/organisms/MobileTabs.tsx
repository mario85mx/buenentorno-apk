import { ReactNode, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export interface MobileTabItem {
  key: string;
  label: string;
  content: ReactNode;
}

export interface MobileTabsProps {
  items: MobileTabItem[];
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export default function MobileTabs({
  items,
  defaultActiveKey,
  onChange,
}: MobileTabsProps) {
  const fallbackKey = items[0]?.key;
  const [activeKey, setActiveKey] = useState(defaultActiveKey ?? fallbackKey);

  const activeItem = useMemo(
    () => items.find((item) => item.key === activeKey) ?? items[0],
    [activeKey, items],
  );

  if (!activeItem) {
    return null;
  }

  return (
    <View className="gap-4">
      <View className="mobile-tabs-list">
        {items.map((item) => {
          const isActive = item.key === activeItem.key;

          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              className={cn(
                'mobile-tabs-trigger',
                isActive && 'mobile-tabs-trigger-active',
              )}
              onPress={() => {
                setActiveKey(item.key);
                onChange?.(item.key);
              }}
            >
              <Text
                className={cn(
                  'font-heading text-sm',
                  isActive ? 'text-primary' : 'text-med-gray',
                )}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View accessibilityRole="tablist" className="mobile-tabs-panel">
        {activeItem.content}
      </View>
    </View>
  );
}
