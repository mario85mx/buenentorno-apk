import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';

type TransactionStatus = 'Adeudo' | 'Pagado';
type BadgeVariant = 'danger' | 'success' | 'warning';

export interface PaymentTransaction {
  id: string;
  concept: string;
  dueDate: string;
  status: TransactionStatus;
  amount: string;
  badgeVariant: BadgeVariant;
}

export interface PaymentTransactionDetailProps {
  onBack?: () => void;
  transaction?: PaymentTransaction | null;
}

export default function PaymentTransactionDetail({
  onBack,
  transaction,
}: PaymentTransactionDetailProps) {
  const currentTransaction: PaymentTransaction = transaction ?? {
    id: 'movement-1',
    concept: 'Mantenimiento Junio 2026',
    dueDate: '10/06/2026',
    status: 'Adeudo',
    amount: '$120.00',
    badgeVariant: 'danger',
  };

  const detailRows = [
    { label: 'Concepto', value: currentTransaction.concept },
    { label: 'Fecha de vencimiento', value: currentTransaction.dueDate },
    { label: 'Referencia', value: 'MTTO-2026-06-001' },
    {
      label: 'Metodo de pago',
      value:
        currentTransaction.status === 'Pagado'
          ? 'Transferencia validada'
          : 'Transferencia pendiente',
    },
  ];
  const amountColor =
    currentTransaction.status === 'Pagado' ? 'text-success' : 'text-danger';
  const showReceiptButton = currentTransaction.status === 'Pagado';

  return (
    <View className="gap-5">
      <Pressable
        accessibilityRole="button"
        className="flex-row items-center self-start rounded-full px-1 py-1"
        onPress={onBack}
      >
        <Ionicons color="#18052E" name="chevron-back" size={20} />
        <Text className="font-heading text-sm text-primary">Volver</Text>
      </Pressable>

      <View className="gap-2">
        <Text className="font-heading text-2xl text-primary">
          Detalle del movimiento
        </Text>
        <Text className="font-body text-base text-med-gray">
          Revisa el estado y la informacion del movimiento.
        </Text>
      </View>

      <Card width="full">
        <View className="gap-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1 gap-2">
              <Text className="font-heading text-lg text-primary">
                {currentTransaction.concept}
              </Text>
              <Text className="font-body text-sm text-med-gray">
                Movimiento generado para la cuota mensual de mantenimiento.
              </Text>
            </View>

            <View className="items-end gap-2">
              <Badge
                label={currentTransaction.status}
                variant={currentTransaction.badgeVariant}
              />
              <Text className={`font-heading text-2xl ${amountColor}`}>
                {currentTransaction.amount}
              </Text>
            </View>
          </View>

          <View className="gap-3">
            {detailRows.map((row) => (
              <View
                key={row.label}
                className="flex-row items-start justify-between gap-4 border-b border-light-gray pb-3"
              >
                <Text className="font-heading text-sm text-primary">
                  {row.label}
                </Text>
                <Text className="flex-1 text-right font-body-semibold text-sm text-primary">
                  {row.value}
                </Text>
              </View>
            ))}
          </View>

          <View className="gap-3">
            {showReceiptButton ? (
              <Button icon="document-text-outline" title="Ver recibo" />
            ) : null}
            <Button
              title="Regresar a movimientos"
              variant="secondary"
              onPress={onBack}
            />
          </View>
        </View>
      </Card>
    </View>
  );
}
