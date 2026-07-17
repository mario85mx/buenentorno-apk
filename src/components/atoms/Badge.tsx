import { Text, View, ViewProps } from 'react-native';

type BadgeVariant =
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral'
  | 'accent';

export interface BadgeProps extends ViewProps {
  label: string;
  variant?: BadgeVariant;
}

const containerVariants: Record<BadgeVariant, string> = {
  success: 'border-success/20 bg-success/15',
  danger: 'border-danger/20 bg-danger/15',
  warning: 'border-warning/20 bg-warning/15',
  info: 'border-[#2F7CF6]/20 bg-[#2F7CF6]/10',
  neutral: 'border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-800',
  accent: 'border-[#5A3D8A]/20 bg-[#E7DEF5] dark:border-[#8066A0] dark:bg-[#382C45]',
};

const textVariants: Record<BadgeVariant, string> = {
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning',
  info: 'text-[#2F7CF6] dark:text-[#8CB7FF]',
  neutral: 'text-slate-700 dark:text-slate-200',
  accent: 'text-primary dark:text-[#F7F2FB]',
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
