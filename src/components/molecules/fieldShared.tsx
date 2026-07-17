import { ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface FieldShellProps {
  label: string;
  active?: boolean;
  errorText?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export interface BottomSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export const FIELD_SHELL_CLASS = 'field-shell';
export const FIELD_CONTROL_CLASS = 'field-control';
export const FIELD_INPUT_CLASS = 'field-input';
export const FIELD_PLACEHOLDER_CLASS = 'text-dark-gray dark:text-[#D1CAD9]';

export function FieldShell({
  label,
  active = false,
  errorText,
  helperText,
  disabled = false,
  className,
  children,
}: FieldShellProps) {
  const message = errorText ?? helperText;
  const messageColor = errorText ? 'text-danger' : 'text-med-gray dark:text-[#B9B2C2]';

  return (
    <View className={cn('gap-1.5', className)}>
      <Text
        className={cn(
          'px-1 font-body text-sm text-primary dark:text-[#F7F2FB]',
          errorText && 'text-danger',
          disabled && 'opacity-60',
        )}
      >
        {label}
      </Text>

      <View
        className={cn(
          FIELD_SHELL_CLASS,
          active ? 'border-primary' : 'border-light-gray dark:border-[#3B3345]',
          errorText && 'border-danger',
          disabled && 'bg-[#F8F7FA] dark:bg-[#18131F] opacity-60',
        )}
      >
        {children}
      </View>

      {message ? (
        <Text className={cn('px-1 font-body text-sm', messageColor)}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

export function BottomSheet({
  visible,
  title,
  onClose,
  children,
  footer,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end bg-black/35">
        <Pressable className="flex-1" onPress={onClose} />
        <View
          className="max-h-[85%] rounded-t-[32px] bg-white dark:bg-[#211A29] px-5 pt-4"
          style={{ paddingBottom: 24 + insets.bottom }}
        >
          <View className="mb-4 items-center">
            <View className="h-1.5 w-14 rounded-lg bg-light-gray" />
            <Text className="mt-4 font-heading text-xl text-primary dark:text-[#F7F2FB]">
              {title}
            </Text>
          </View>

          <ScrollView
            className="grow"
            contentContainerClassName="pb-4"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {footer ? <View className="pt-2">{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}
