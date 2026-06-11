import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';

type ReceiptStatus = 'Pendiente' | 'Validado';
type BadgeVariant = 'warning' | 'success';

export interface PaymentReceipt {
  id: string;
  type: string;
  amount: string;
  generated: string;
  paymentDate: string;
  dueDate: string;
  method: string;
  reference: string;
  trackingKey: string;
  status: ReceiptStatus;
  review: string;
  voucher: string;
  badgeVariant: BadgeVariant;
}

export interface PaymentReceiptDetailProps {
  onBack?: () => void;
  receipt?: PaymentReceipt | null;
}

export default function PaymentReceiptDetail({
  onBack,
  receipt,
}: PaymentReceiptDetailProps) {
  const currentReceipt: PaymentReceipt = receipt ?? {
    id: 'receipt-1',
    type: 'Pago de mantenimiento',
    amount: '$120.00',
    generated: '01/06/2026',
    paymentDate: '08/06/2026',
    dueDate: '10/06/2026',
    method: 'Transferencia SPEI',
    reference: 'REC-2026-06-001',
    trackingKey: '547382910456',
    status: 'Validado',
    review: 'Aprobado por administración',
    voucher: 'comprobante-junio-2026.pdf',
    badgeVariant: 'success',
  };

  const detailRows = [
    { label: 'Tipos', value: currentReceipt.type },
    { label: 'Monto', value: currentReceipt.amount },
    { label: 'Generado', value: currentReceipt.generated },
    { label: 'Fecha pago', value: currentReceipt.paymentDate },
    { label: 'Vence', value: currentReceipt.dueDate },
    { label: 'Método', value: currentReceipt.method },
    { label: 'Referencia', value: currentReceipt.reference },
    { label: 'Clave de Rastreo', value: currentReceipt.trackingKey },
    { label: 'Estatus', value: currentReceipt.status },
    { label: 'Revisión', value: currentReceipt.review },
    { label: 'Comprobante', value: currentReceipt.voucher },
  ];

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
          Detalle del comprobante
        </Text>
        <Text className="font-body text-base text-med-gray">
          Revisa la información del pago y el archivo enviado.
        </Text>
      </View>

      <Card width="full">
        <View className="gap-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1 gap-2">
              <Text className="font-heading text-lg text-primary">
                {currentReceipt.type}
              </Text>
              <Text className="font-body text-sm text-med-gray">
                Comprobante asociado al pago registrado en la cuenta.
              </Text>
            </View>

            <View className="items-end gap-2">
              <Badge
                label={currentReceipt.status}
                variant={currentReceipt.badgeVariant}
              />
              <Text className="font-heading text-2xl text-success">
                {currentReceipt.amount}
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
            <Button>
              <>
                <FontAwesome color="#FFFFFF" name="eye" size={18} />
                <Text className="font-body-semibold text-base text-white">
                  Ver Comprobante
                </Text>
              </>
            </Button>
            <Button
              title="Regresar a comprobantes"
              variant="secondary"
              onPress={onBack}
            />
          </View>
        </View>
      </Card>
    </View>
  );
}
