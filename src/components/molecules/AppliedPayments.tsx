import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AppliedPayment } from '../../services/viewModels';
import { useAppThemeColors } from '../../theme/tokens';

export default function AppliedPayments({ payments, expanded = false }: {
  payments: AppliedPayment[];
  expanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const colors = useAppThemeColors();
  return (
    <View className="gap-3 rounded-lg border border-light-gray p-3 dark:border-[#3B3345]">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        onPress={() => setIsExpanded((value) => !value)}
        className="min-h-11 flex-row items-center justify-between gap-3"
      >
        <Text className="font-heading text-sm text-primary dark:text-[#F7F2FB]">
          Pagos aplicados ({payments.length})
        </Text>
        <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.text} />
      </Pressable>
      {isExpanded && (payments.length ? payments.map((payment) => (
        <View key={payment.id} className="gap-1 border-t border-light-gray pt-3 dark:border-[#3B3345]">
          <Text className="font-heading text-sm text-primary dark:text-[#F7F2FB]">
            Pago #{payment.id} · {payment.amount}
          </Text>
          <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
            {payment.date} · {payment.method}
          </Text>
          <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
            Referencia: {payment.reference}{'\n'}Saldo a favor aplicado: {payment.creditAmount}
          </Text>
          {!!payment.notes && <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">{payment.notes}</Text>}
        </View>
      )) : <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">Sin pagos aplicados.</Text>)}
    </View>
  );
}
