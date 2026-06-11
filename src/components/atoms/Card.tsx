import { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

type CardWidth = 'full' | 'half';

export interface CardProps extends ViewProps {
  children: ReactNode;
  width?: CardWidth;
}

const widthVariants: Record<CardWidth, string> = {
  full: 'card-full',
  half: 'card-half',
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function Card({
  children,
  width = 'full',
  className,
  ...props
}: CardProps) {
  return (
    <View
      className={cn('card-base', widthVariants[width], className)}
      {...props}
    >
      {children}
    </View>
  );
}

export default Card;
