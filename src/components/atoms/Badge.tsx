import { Text, View, ViewProps } from 'react-native';

type BadgeVariant = 'success' | 'danger' | 'warning';

export interface BadgeProps extends ViewProps {
  label: string;
  variant?: BadgeVariant;
}

const containerVariants: Record<BadgeVariant, string> = {
  success: 'border-success/20 bg-success/15',
  danger: 'border-danger/20 bg-danger/15',
  warning: 'border-warning/20 bg-warning/15',
};

const textVariants: Record<BadgeVariant, string> = {
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning',
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function Badge({
  label,
  variant = 'success',
  className,
  ...props
}: BadgeProps) {
  return (
    <View
      className={cn(
        'rounded-full border px-1',
        containerVariants[variant],
        className,
      )}
      {...props}
    >
      <Text
        className={cn('font-body-semibold text-[10px]', textVariants[variant])}
      >
        {label}
      </Text>
    </View>
  );
}

export default Badge;
