import { ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { colorTokens } from '../../theme/tokens';

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
export const FIELD_PLACEHOLDER_CLASS = 'text-dark-gray';
export const FIELD_PLACEHOLDER_COLOR = colorTokens.darkGray;

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
  const messageColor = errorText ? 'text-danger' : 'text-med-gray';

  return (
    <View className={cn('gap-1.5', className)}>
      <Text
        className={cn(
          'px-1 font-body text-sm text-primary',
          errorText && 'text-danger',
          disabled && 'opacity-60',
        )}
      >
        {label}
      </Text>

      <View
        className={cn(
          FIELD_SHELL_CLASS,
          active ? 'border-primary' : 'border-light-gray',
          errorText && 'border-danger',
          disabled && 'bg-[#F8F7FA] opacity-60',
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
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end bg-black/35">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="max-h-[85%] rounded-t-[32px] bg-white px-5 pb-6 pt-4">
          <View className="mb-4 items-center">
            <View className="h-1.5 w-14 rounded-lg bg-light-gray" />
            <Text className="mt-4 font-heading text-xl text-primary">
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
