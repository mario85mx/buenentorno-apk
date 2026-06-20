import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';
import type { PaymentTransaction } from '../services/viewModels';

export type { PaymentTransaction } from '../services/viewModels';

export interface PaymentTransactionDetailProps {
  onBack?: () => void;
  transaction?: PaymentTransaction | null;
}

function formatReceiptDate(value: Date) {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(value);
}

export default function PaymentTransactionDetail({
  onBack,
  transaction,
}: PaymentTransactionDetailProps) {
  const [isReceiptVisible, setIsReceiptVisible] = useState(false);
  const currentTransaction: PaymentTransaction = transaction ?? {
    id: 'movement-1',
    kind: 'charge',
    concept: 'Mantenimiento Junio 2026',
    concepts: ['Mantenimiento Junio 2026'],
    summary: 'Cargo de mantenimiento asociado a la casa.',
    dateLabel: 'Fecha de vencimiento',
    dueDate: '10/06/2026',
    status: 'Pendiente',
    amount: '$120.00',
    reference: 'Sin referencia',
    method: 'Sin método registrado',
    badgeVariant: 'warning',
    receipt: null,
  };

  const currentReceipt = currentTransaction.receipt;
  const transactionConcepts =
    Array.isArray(currentTransaction.concepts) &&
    currentTransaction.concepts.length > 0
      ? currentTransaction.concepts
      : [currentTransaction.concept];
  const receiptConcepts =
    Array.isArray(currentReceipt?.concepts) && currentReceipt.concepts.length > 0
      ? currentReceipt.concepts
      : [];
  const receiptConceptDetails =
    Array.isArray(currentReceipt?.conceptDetails) &&
    currentReceipt.conceptDetails.length > 0
      ? currentReceipt.conceptDetails
      : receiptConcepts.map((concept) => ({
          label: concept,
          amount: currentReceipt?.conceptsAmount ?? currentReceipt?.amount ?? '$0.00',
        }));
  const downloadDate = useMemo(() => formatReceiptDate(new Date()), []);
  const detailRows = [
    { label: currentTransaction.dateLabel, value: currentTransaction.dueDate },
    {
      label: 'Referencia',
      value: currentReceipt?.reference ?? currentTransaction.reference,
    },
    {
      label: 'Metodo de pago',
      value: currentReceipt?.method ?? currentTransaction.method,
    },
  ];
  const amountColor =
    currentTransaction.status === 'Pagado'
      ? 'text-success'
      : currentTransaction.status === 'Vencido' ||
          currentTransaction.status === 'Rechazado' ||
          currentTransaction.status === 'Cancelado'
        ? 'text-danger'
        : 'text-warning';
  const showReceiptButton =
    currentTransaction.status === 'Pagado' && !!currentReceipt;
  const receiptRows = useMemo(
    () =>
      currentReceipt
        ? [
            { label: 'Folio', value: `#${currentReceipt.id}` },
            { label: 'Casa', value: `Casa ${currentReceipt.unit ?? 'Sin casa'}` },
            {
              label: 'Tipos',
              value:
                currentReceipt.types ??
                (receiptConcepts.join(', ') || 'Pago reportado'),
            },
            { label: 'Monto total pagado', value: currentReceipt.amount },
            {
              label: 'Monto de conceptos',
              value: currentReceipt.conceptsAmount ?? currentReceipt.amount,
            },
            {
              label: 'Saldo a favor generado',
              value: currentReceipt.creditGenerated ?? '$0.00',
            },
            { label: 'Fecha de pago', value: currentReceipt.paymentDate },
            { label: 'Método', value: currentReceipt.method },
            { label: 'Referencia', value: currentReceipt.reference },
            { label: 'Clave de rastreo', value: currentReceipt.trackingKey },
            { label: 'Estatus', value: currentReceipt.status },
            { label: 'Revisión', value: currentReceipt.reviewNotes },
          ]
        : [],
    [currentReceipt],
  );

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
          {isReceiptVisible && currentReceipt ? (
            <View className="gap-5">
              <View className="overflow-hidden rounded-2xl border border-light-gray bg-white">
                <View className="bg-primary px-5 py-5">
                  <Text className="font-heading text-2xl text-white">
                    Buen Entorno
                  </Text>
                  <Text className="mt-2 font-body text-sm text-white/85">
                    Recibo del movimiento
                  </Text>
                </View>

                <View className="h-2 bg-accent" />

                <View className="gap-4 px-5 py-5">
                  <View className="gap-1">
                    <Text className="font-heading text-lg text-primary">
                      Detalle del pago
                    </Text>
                    <Text className="font-body text-sm text-med-gray">
                      Puedes capturar esta pantalla si necesitas guardarlo como
                      imagen.
                    </Text>
                  </View>

                  <View className="gap-3">
                    {receiptRows.map((row) => (
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

                  <View className="gap-3 border-t border-light-gray pt-4">
                    <Text className="font-heading text-lg text-primary">
                      Conceptos liquidados
                    </Text>
                    <View className="gap-2">
                      {receiptConceptDetails.map((detail, index) => (
                        <View
                          key={`${detail.label}-${index}`}
                          className="flex-row items-start justify-between gap-4 border-b border-light-gray pb-3"
                        >
                          <Text className="flex-1 font-body-semibold text-base text-primary">
                            {index + 1}. {detail.label}
                          </Text>
                          <Text className="font-heading text-base text-primary">
                            {detail.amount}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View className="gap-2 pt-2">
                    <Text className="font-body text-xs text-med-gray">
                      Documento generado desde el portal de condominio de Buen Entorno.
                    </Text>
                    <Text className="font-body text-xs text-med-gray">
                      Fecha de descarga: {downloadDate}
                    </Text>
                  </View>
                </View>
              </View>

              <Button
                title="Volver al detalle"
                variant="secondary"
                onPress={() => setIsReceiptVisible(false)}
              />
            </View>
          ) : (
            <>
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1 gap-2">
                  <Text className="font-heading text-lg text-primary">
                    {currentTransaction.concept}
                  </Text>
                  <Text className="font-body text-sm text-med-gray">
                    {currentTransaction.summary}
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
                <Text className="font-heading text-sm text-primary">
                  Conceptos
                </Text>
                <View className="gap-2">
                  {transactionConcepts.map((concept, index) => (
                    <View
                      key={`${concept}-${index}`}
                      className="flex-row items-start gap-3 border-b border-light-gray pb-3"
                    >
                      <Text className="font-heading text-sm text-primary">
                        {index + 1}.
                      </Text>
                      <Text className="flex-1 font-body-semibold text-sm text-primary">
                        {concept}
                      </Text>
                    </View>
                  ))}
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
                  <Button
                    icon="document-text-outline"
                    title="Ver recibo"
                    onPress={() => setIsReceiptVisible(true)}
                  />
                ) : null}
                <Button
                  title="Regresar a movimientos"
                  variant="secondary"
                  onPress={onBack}
                />
              </View>
            </>
          )}
        </View>
      </Card>
    </View>
  );
}
