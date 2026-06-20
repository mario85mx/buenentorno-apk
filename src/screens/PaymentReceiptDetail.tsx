import * as FileSystem from 'expo-file-system/legacy';
import {
  copyAsync,
  documentDirectory,
  getContentUriAsync,
} from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { Linking, Platform, Pressable, Text, View } from 'react-native';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';
import { getApiAccessToken } from '../services/api';
import type { PaymentReceipt } from '../services/viewModels';

export type { PaymentReceipt } from '../services/viewModels';

export interface PaymentReceiptDetailProps {
  onBack?: () => void;
  receipt?: PaymentReceipt | null;
}

function formatReceiptDate(value: Date) {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(value);
}

export default function PaymentReceiptDetail({
  onBack,
  receipt,
}: PaymentReceiptDetailProps) {
  const [isOpeningReceipt, setIsOpeningReceipt] = useState(false);
  const [openReceiptError, setOpenReceiptError] = useState('');
  const currentReceipt: PaymentReceipt = receipt ?? {
    id: 'receipt-1',
    type: 'Pago de mantenimiento',
    unit: '38',
    types: 'Mantenimiento',
    concepts: ['Mantenimiento Junio 2026'],
    conceptDetails: [{ label: 'Mantenimiento Junio 2026', amount: '$120.00' }],
    amount: '$120.00',
    conceptsAmount: '$120.00',
    creditGenerated: '$0.00',
    generated: '01/06/2026',
    paymentDate: '08/06/2026',
    dueDate: '10/06/2026',
    method: 'Transferencia SPEI',
    reference: 'REC-2026-06-001',
    trackingKey: '547382910456',
    status: 'Pagado',
    review: 'Aprobado por administración',
    voucher: 'comprobante-junio-2026.pdf',
    fileUrl: '',
    mimeType: 'application/pdf',
    badgeVariant: 'success',
  };
  const receiptConcepts =
    Array.isArray(currentReceipt.concepts) && currentReceipt.concepts.length > 0
      ? currentReceipt.concepts
      : [currentReceipt.type];
  const conceptDetails =
    Array.isArray(currentReceipt.conceptDetails) &&
    currentReceipt.conceptDetails.length > 0
      ? currentReceipt.conceptDetails
      : receiptConcepts.map((concept) => ({
          label: concept,
          amount: currentReceipt.conceptsAmount ?? currentReceipt.amount,
        }));
  const downloadDate = useMemo(() => formatReceiptDate(new Date()), []);

  const amountColor =
    currentReceipt.status === 'Pagado'
      ? 'text-success'
      : currentReceipt.status === 'Rechazado' ||
          currentReceipt.status === 'Cancelado'
        ? 'text-danger'
        : 'text-warning';

  const receiptExtension = useMemo(() => {
    const normalizedVoucher = currentReceipt.voucher.toLowerCase();

    if (normalizedVoucher.endsWith('.pdf')) {
      return 'pdf';
    }

    if (normalizedVoucher.endsWith('.png')) {
      return 'png';
    }

    if (normalizedVoucher.endsWith('.jpg') || normalizedVoucher.endsWith('.jpeg')) {
      return 'jpg';
    }

    if (currentReceipt.mimeType === 'image/png') {
      return 'png';
    }

    if (currentReceipt.mimeType === 'image/jpeg') {
      return 'jpg';
    }

    return 'pdf';
  }, [currentReceipt.mimeType, currentReceipt.voucher]);

  const handleOpenReceipt = useCallback(async () => {
    if (!currentReceipt.fileUrl) {
      setOpenReceiptError('Este comprobante no tiene un archivo disponible.');
      return;
    }

    const accessToken = getApiAccessToken();

    if (!accessToken) {
      setOpenReceiptError('Tu sesión ya no es válida. Inicia sesión nuevamente.');
      return;
    }

    if (!FileSystem.cacheDirectory) {
      setOpenReceiptError('No hay almacenamiento temporal disponible en el dispositivo.');
      return;
    }

    setIsOpeningReceipt(true);
    setOpenReceiptError('');

    const localFileUri =
      `${FileSystem.cacheDirectory}receipt-${currentReceipt.id}-${Date.now()}.${receiptExtension}`;

    try {
      const result = await FileSystem.downloadAsync(currentReceipt.fileUrl, localFileUri, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        if (!documentDirectory) {
          setOpenReceiptError('No hay almacenamiento disponible para abrir el comprobante.');
          return;
        }

        const exportedUri =
          `${documentDirectory}comprobante-${currentReceipt.id}.${receiptExtension}`;

        await copyAsync({
          from: result.uri,
          to: exportedUri,
        });

        const openableUri =
          Platform.OS === 'android'
            ? await getContentUriAsync(exportedUri)
            : exportedUri;

        await Linking.openURL(openableUri);
        return;
      }

      await Sharing.shareAsync(result.uri, {
        dialogTitle: currentReceipt.voucher,
        mimeType: currentReceipt.mimeType ?? undefined,
      });
    } catch {
      setOpenReceiptError('No se pudo abrir el comprobante.');
    } finally {
      setIsOpeningReceipt(false);
    }
  }, [
    currentReceipt.fileUrl,
    currentReceipt.id,
    currentReceipt.mimeType,
    currentReceipt.voucher,
    receiptExtension,
  ]);

  const detailRows = [
    { label: 'Folio', value: `#${currentReceipt.id}` },
    { label: 'Casa', value: `Casa ${currentReceipt.unit ?? 'Sin casa'}` },
    {
      label: 'Tipos',
      value: currentReceipt.types ?? (receiptConcepts.join(', ') || 'Pago reportado'),
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
    { label: 'Metodo', value: currentReceipt.method },
    { label: 'Referencia', value: currentReceipt.reference },
    { label: 'Clave de rastreo', value: currentReceipt.trackingKey },
    { label: 'Estatus', value: currentReceipt.status },
    { label: 'Revision', value: currentReceipt.review },
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
              <Text className={`font-heading text-2xl ${amountColor}`}>
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

          <View className="gap-3 border-t border-light-gray pt-4">
            <Text className="font-heading text-lg text-primary">
              Conceptos liquidados
            </Text>
            <View className="gap-2">
              {conceptDetails.map((detail, index) => (
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

          <View className="gap-3">
            {openReceiptError ? (
              <Text className="font-body text-sm text-danger">
                {openReceiptError}
              </Text>
            ) : null}
            <Button loading={isOpeningReceipt} onPress={() => void handleOpenReceipt()}>
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
