import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends PressableProps {
  title?: string;
  label?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  textClassName?: string;
}

const containerVariants: Record<ButtonVariant, string> = {
  primary: 'border-primary bg-primary',
  secondary: 'border-secondary bg-secondary',
  danger: 'border-danger bg-danger',
};

const textVariants: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-white',
  danger: 'text-white',
};

const sizeVariants: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 py-2.5',
  md: 'min-h-11 px-4 py-3',
  lg: 'min-h-14 px-5 py-3.5',
};

const textSizeVariants: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function Button({
  title,
  label,
  icon,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className,
  textClassName,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const textContent = children ?? title ?? label;
  const iconColor = '#ffffff';

  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-xl border',
        containerVariants[variant],
        sizeVariants[size],
        isDisabled && 'opacity-50',
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <>
          {icon ? <Ionicons color={iconColor} name={icon} size={20} /> : null}
          {typeof textContent === 'string' || typeof textContent === 'number' ? (
            <Text
              className={cn(
                'font-body-semibold',
                textVariants[variant],
                textSizeVariants[size],
                textClassName,
              )}
            >
              {textContent}
            </Text>
          ) : (
            textContent
          )}
        </>
      )}
    </Pressable>
  );
}

export default Button;
