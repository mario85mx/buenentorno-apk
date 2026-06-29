import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';
import DatePickerField from '../components/molecules/DatePickerField';
import InputField from '../components/molecules/InputField';
import SelectField from '../components/molecules/SelectField';
import {
  BottomSheet,
  FIELD_CONTROL_CLASS,
  FieldShell,
  cn,
} from '../components/molecules/fieldShared';
import { getMyCondominoDetail, reportPayment } from '../services/condomino';
import { getErrorMessage } from '../services/error';
import { formatCurrency } from '../services/mappers';
import { queryKeys } from '../services/queryKeys';
import type {
  UnitDetailDto,
  UploadReceiptFilePayload,
} from '../services/types';

interface UploadReceiptProps {
  onBack?: () => void;
  onSubmitSuccess?: () => void;
}

const paymentMethodOptions = [{ label: 'Transferencia', value: 'TRANSFER' }];
const allowedReceiptMimeTypes = [
  'image/jpeg',
  'image/png',
  'application/pdf',
] as const;
const maxReceiptFileSize = 10 * 1024 * 1024;

function normalizeReceiptMimeType(
  mimeType?: string | null,
  fileName?: string | null,
  uri?: string | null,
): UploadReceiptFilePayload['mimeType'] | null {
  if (mimeType === 'image/jpeg' || mimeType === 'image/png' || mimeType === 'application/pdf') {
    return mimeType;
  }

  const normalizedName = (fileName?.trim() || uri?.trim() || '').toLowerCase();

  if (normalizedName.endsWith('.jpg') || normalizedName.endsWith('.jpeg')) {
    return 'image/jpeg';
  }

  if (normalizedName.endsWith('.png')) {
    return 'image/png';
  }

  if (normalizedName.endsWith('.pdf')) {
    return 'application/pdf';
  }

  return null;
}

function receiptMimeTypeLabel(mimeType: UploadReceiptFilePayload['mimeType']) {
  switch (mimeType) {
    case 'image/jpeg':
      return 'JPG';
    case 'image/png':
      return 'PNG';
    default:
      return 'PDF';
  }
}

function receiptFileExtension(mimeType: UploadReceiptFilePayload['mimeType']) {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    default:
      return 'pdf';
  }
}

function formatFileSize(size?: number | null) {
  if (!size || size <= 0) {
    return '';
  }

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function roundCurrencyAmount(value: number) {
  return Number(value.toFixed(2));
}

function getCreditApplication(
  selectedTotal: number,
  availableCredit: number,
  useCreditBalance: boolean,
) {
  const creditAppliedAmount = useCreditBalance
    ? Math.min(selectedTotal, availableCredit)
    : 0;
  const remainingReceiptAmount = Math.max(
    selectedTotal - creditAppliedAmount,
    0,
  );

  return {
    creditAppliedAmount: roundCurrencyAmount(creditAppliedAmount),
    remainingReceiptAmount: roundCurrencyAmount(remainingReceiptAmount),
  };
}

function getUnitBlockedChargeIds(unit: UnitDetailDto) {
  const blockedChargeIds = new Set<number>();

  unit.payments.forEach((payment) => {
    if (payment.status !== 'PENDING_REVIEW') {
      return;
    }

    payment.allocations.forEach((allocation) => {
      if (allocation.chargeId) {
        blockedChargeIds.add(allocation.chargeId);
      }
    });
  });

  return blockedChargeIds;
}

function hasAvailableCharge(unit: UnitDetailDto, blockedChargeIds: Set<number>) {
  return unit.charges.some(
    (charge) =>
      charge.pendingAmount > 0 &&
      charge.status !== 'PAID' &&
      charge.status !== 'CANCELLED' &&
      !blockedChargeIds.has(charge.id),
  );
}

export default function UploadReceipt({
  onBack,
  onSubmitSuccess,
}: UploadReceiptProps) {
  const queryClient = useQueryClient();
  const condominiumQuery = useQuery({
    queryKey: queryKeys.condominiumDetail,
    queryFn: getMyCondominoDetail,
  });
  const reportPaymentMutation = useMutation({
    mutationFn: reportPayment,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.condominiumDetail }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary }),
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
      ]);
      onSubmitSuccess?.();
    },
  });

  const [paymentDate, setPaymentDate] = useState<Date | null>(new Date());
  const [reference, setReference] = useState('');
  const [trackingKey, setTrackingKey] = useState('');
  const [note, setNote] = useState('');
  const [observations, setObservations] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedChargeIds, setSelectedChargeIds] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] =
    useState<UploadReceiptFilePayload | null>(null);
  const [activePicker, setActivePicker] = useState<'photo' | 'file' | null>(null);
  const [isChargesOpen, setIsChargesOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [useCreditBalance, setUseCreditBalance] = useState(false);

  useEffect(() => {
    if (!selectedUnitId && condominiumQuery.data?.units.length) {
      setSelectedUnitId(String(condominiumQuery.data.units[0].id));
    }
  }, [condominiumQuery.data?.units, selectedUnitId]);

  const unitOptions = useMemo(
    () =>
      (condominiumQuery.data?.units ?? []).map((unit) => ({
        label: unit.houseNumber,
        value: String(unit.id),
      })),
    [condominiumQuery.data?.units],
  );

  const selectedUnit = useMemo(
    () =>
      condominiumQuery.data?.units.find(
        (unit) => String(unit.id) === selectedUnitId,
      ) ?? null,
    [condominiumQuery.data?.units, selectedUnitId],
  );

  const selectedUnitBlockedChargeIds = useMemo(
    () => (selectedUnit ? getUnitBlockedChargeIds(selectedUnit) : new Set<number>()),
    [selectedUnit],
  );

  const selectedUnitBlockedMessage = useMemo(() => {
    if (!selectedUnit) {
      return '';
    }

    if (
      selectedUnitBlockedChargeIds.size > 0 &&
      !hasAvailableCharge(selectedUnit, selectedUnitBlockedChargeIds)
    ) {
      return 'Los adeudos pendientes de esta casa ya tienen un comprobante en revisión.';
    }

    return '';
  }, [selectedUnit, selectedUnitBlockedChargeIds]);

  const chargeOptions = useMemo(
    () =>
      (selectedUnit?.charges ?? [])
        .filter(
          (charge) =>
            charge.pendingAmount > 0 &&
            charge.status !== 'PAID' &&
            charge.status !== 'CANCELLED' &&
            !selectedUnitBlockedChargeIds.has(charge.id),
        )
        .map((charge) => ({
          id: String(charge.id),
          charge: charge.concept,
          amount: charge.pendingAmount,
        })),
    [selectedUnit?.charges, selectedUnitBlockedChargeIds],
  );

  useEffect(() => {
    setSelectedChargeIds((currentSelection) =>
      currentSelection.filter((chargeId) =>
        chargeOptions.some((chargeOption) => chargeOption.id === chargeId),
      ),
    );
  }, [chargeOptions]);

  const selectedCharges = useMemo(
    () =>
      chargeOptions.filter((chargeOption) =>
        selectedChargeIds.includes(chargeOption.id),
      ),
    [chargeOptions, selectedChargeIds],
  );
  const uploadAmount = useMemo(
    () =>
      selectedCharges.reduce(
        (total, selectedCharge) => total + selectedCharge.amount,
        0,
      ),
    [selectedCharges],
  );
  const creditAppliedAmount = useMemo(
    () =>
      getCreditApplication(
        uploadAmount,
        selectedUnit?.balance.credit ?? 0,
        useCreditBalance,
      ).creditAppliedAmount,
    [selectedUnit?.balance.credit, uploadAmount, useCreditBalance],
  );
  const remainingReceiptAmount = useMemo(
    () =>
      getCreditApplication(
        uploadAmount,
        selectedUnit?.balance.credit ?? 0,
        useCreditBalance,
      ).remainingReceiptAmount,
    [selectedUnit?.balance.credit, uploadAmount, useCreditBalance],
  );
  const selectedChargesLabel = selectedCharges.length
    ? `${selectedCharges.length} cargo${
        selectedCharges.length > 1 ? 's' : ''
      } seleccionado${selectedCharges.length > 1 ? 's' : ''}`
    : 'Selecciona cargos';

  const toggleCharge = (chargeId: string) => {
    setSelectedChargeIds((current) =>
      current.includes(chargeId)
        ? current.filter((itemId) => itemId !== chargeId)
        : [...current, chargeId],
    );
  };

  const selectReceiptAsset = ({
    uri,
    mimeType,
    name,
    size,
  }: {
    uri: string;
    mimeType?: string | null;
    name?: string | null;
    size?: number | null;
  }) => {
    const normalizedMimeType = normalizeReceiptMimeType(mimeType, name, uri);

    if (!normalizedMimeType) {
      setErrorMessage('Solo se permiten archivos JPG, PNG o PDF.');
      return;
    }

    if (size && size > maxReceiptFileSize) {
      setErrorMessage('El archivo supera el límite de 10 MB.');
      return;
    }

    setSelectedFile({
      uri,
      name:
        name?.trim() ||
        `comprobante-${Date.now()}.${receiptFileExtension(normalizedMimeType)}`,
      mimeType: normalizedMimeType,
      size,
    });
  };

  const pickReceiptFromFiles = async () => {
    setErrorMessage('');
    setActivePicker('file');

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [...allowedReceiptMimeTypes],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      if (!asset) {
        setErrorMessage('No se pudo leer el archivo seleccionado.');
        return;
      }

      selectReceiptAsset({
        uri: asset.uri,
        mimeType: asset.mimeType,
        name: asset.name,
        size: asset.size,
      });
    } finally {
      setActivePicker(null);
    }
  };

  const pickReceiptFromPhotos = async () => {
    setErrorMessage('');
    setActivePicker('photo');

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setErrorMessage('Necesitamos permiso para acceder a tus fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 1,
        preferredAssetRepresentationMode:
          ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      if (!asset) {
        setErrorMessage('No se pudo leer la foto seleccionada.');
        return;
      }

      selectReceiptAsset({
        uri: asset.uri,
        mimeType: asset.mimeType,
        name: asset.fileName,
        size: asset.fileSize,
      });
    } finally {
      setActivePicker(null);
    }
  };

  const canSubmit =
    !!selectedUnit &&
    !!paymentDate &&
    remainingReceiptAmount > 0 &&
    !!selectedFile &&
    !reportPaymentMutation.isPending;

  return (
    <>
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
            Subir comprobante
          </Text>
          <Text className="font-body text-base text-med-gray">
            Envía tu comprobante a revisión y aplica los cargos que cubre el pago.
          </Text>
        </View>

        <Card width="full">
          <View className="gap-4">
            {condominiumQuery.isLoading ? (
              <Text className="font-body text-sm text-med-gray">
                Cargando cargos del residente...
              </Text>
            ) : condominiumQuery.error ? (
              <Text className="font-body text-sm text-danger">
                {getErrorMessage(
                  condominiumQuery.error,
                  'No fue posible cargar la información de pago.',
                )}
              </Text>
            ) : (
              <>
                <SelectField
                  label="Casa"
                  options={unitOptions}
                  value={selectedUnitId}
                  onChange={(value) => {
                    setSelectedUnitId(value);
                    setSelectedChargeIds([]);
                    setUseCreditBalance(false);
                    if (errorMessage) {
                      setErrorMessage('');
                    }
                  }}
                />

                <FieldShell
                  disabled
                  label="Comprobante por subir"
                  helperText="Se calcula automáticamente según los cargos seleccionados y el saldo a favor aplicado."
                >
                  <View className={cn(FIELD_CONTROL_CLASS, 'justify-center')}>
                    <Text className="font-body-semibold text-base text-primary">
                      {formatCurrency(remainingReceiptAmount)}
                    </Text>
                  </View>
                </FieldShell>

                <DatePickerField
                  label="Fecha de Pago"
                  value={paymentDate}
                  onChange={setPaymentDate}
                />

                <SelectField
                  disabled
                  label="Método"
                  options={paymentMethodOptions}
                  value="TRANSFER"
                  onChange={() => undefined}
                />

                <InputField
                  errorText={errorMessage}
                  label="Referencia"
                  placeholder="REF-2026-06-001"
                  value={reference}
                  onChangeText={(value) => {
                    setReference(value);
                    if (errorMessage) {
                      setErrorMessage('');
                    }
                  }}
                />

                <InputField
                  label="Clave de Rastreo"
                  placeholder="547382910456"
                  value={trackingKey}
                  onChangeText={(value) => {
                    setTrackingKey(value);
                    if (errorMessage) {
                      setErrorMessage('');
                    }
                  }}
                />

                <FieldShell
                  active={isChargesOpen}
                  helperText={
                    selectedUnitBlockedMessage ||
                    (selectedCharges.length
                      ? `Total seleccionado: ${formatCurrency(uploadAmount)}. Saldo a favor descontado: ${formatCurrency(
                          creditAppliedAmount,
                        )}. Comprobante restante: ${formatCurrency(
                          remainingReceiptAmount,
                        )}.`
                      : 'Selecciona uno o más cargos para aplicar el pago.')
                  }
                  label="Aplicar cargos"
                >
                  <Pressable
                    accessibilityRole="button"
                    className={cn(
                      FIELD_CONTROL_CLASS,
                      'flex-row items-center justify-between gap-3',
                    )}
                    onPress={() => setIsChargesOpen(true)}
                  >
                    <Text className="flex-1 font-body text-base text-primary">
                      {selectedChargesLabel}
                    </Text>
                    <Ionicons
                      color="#6B7280"
                      name={isChargesOpen ? 'chevron-up' : 'chevron-down'}
                      size={20}
                    />
                  </Pressable>
                </FieldShell>

                {selectedCharges.length ? (
                  <View className="gap-2 rounded-xl border border-light-gray bg-[#F8F7FA] p-3">
                    {selectedCharges.map((selectedCharge) => (
                      <View
                        key={selectedCharge.id}
                        className="flex-row items-center justify-between gap-3"
                      >
                        <Text className="flex-1 font-body text-sm text-primary">
                          {selectedCharge.charge}
                        </Text>
                        <Text className="font-body-semibold text-sm text-primary">
                          {formatCurrency(selectedCharge.amount)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {selectedUnit && selectedUnit.balance.credit > 0 ? (
                  <View className="gap-2 rounded-xl border border-[#B7E4C7] bg-[#F0FDF4] p-4">
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityState={{
                        checked: useCreditBalance,
                        disabled:
                          reportPaymentMutation.isPending ||
                          selectedCharges.length === 0,
                      }}
                      className="flex-row items-start gap-3"
                      disabled={
                        reportPaymentMutation.isPending || selectedCharges.length === 0
                      }
                      onPress={() => setUseCreditBalance((current) => !current)}
                    >
                      <Ionicons
                        color={useCreditBalance ? '#18052E' : '#6B7280'}
                        name={useCreditBalance ? 'checkbox-outline' : 'square-outline'}
                        size={22}
                      />
                      <View className="flex-1 gap-1">
                        <Text className="font-body-semibold text-sm text-primary">
                          Pagar con saldo a favor disponible{' '}
                          {formatCurrency(selectedUnit.balance.credit)}
                        </Text>
                        {useCreditBalance && selectedCharges.length > 0 ? (
                          <Text className="font-body text-xs text-[#166534]">
                            Se descontarán {formatCurrency(creditAppliedAmount)} del
                            saldo a favor y el comprobante cubrirá{' '}
                            {formatCurrency(remainingReceiptAmount)}.
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>
                  </View>
                ) : null}

                {remainingReceiptAmount > 0 ? (
                  <>
                    <FieldShell
                      active={!!selectedFile}
                      helperText={
                        selectedFile
                          ? 'Archivo listo para enviarse con el comprobante.'
                          : 'Elige una foto o un archivo JPG, PNG o PDF de hasta 10 MB.'
                      }
                      label="Archivo"
                    >
                      <View className="gap-3">
                        <View
                          className={cn(
                            FIELD_CONTROL_CLASS,
                            'flex-row items-center justify-between gap-3',
                          )}
                        >
                          <View className="flex-1 flex-row items-center gap-3">
                            <Ionicons
                              color="#18052E"
                              name="attach-outline"
                              size={20}
                            />
                            <View className="flex-1">
                              <Text
                                className="font-body text-base text-primary"
                                numberOfLines={1}
                              >
                                {selectedFile?.name ?? 'Ningún archivo seleccionado'}
                              </Text>
                              {selectedFile ? (
                                <Text className="font-body text-sm text-med-gray">
                                  {receiptMimeTypeLabel(selectedFile.mimeType)}
                                  {selectedFile.size
                                    ? ` · ${formatFileSize(selectedFile.size)}`
                                    : ''}
                                </Text>
                              ) : null}
                            </View>
                          </View>
                          <Ionicons
                            color="#6B7280"
                            name={
                              selectedFile
                                ? 'checkmark-circle-outline'
                                : 'cloud-upload-outline'
                            }
                            size={20}
                          />
                        </View>

                        <View className="flex-row gap-3">
                          <Button
                            className="flex-1"
                            disabled={activePicker === 'file'}
                            icon="images-outline"
                            loading={activePicker === 'photo'}
                            title="Fotos"
                            variant="secondary"
                            onPress={() => {
                              void pickReceiptFromPhotos();
                            }}
                          />
                          <Button
                            className="flex-1"
                            disabled={activePicker === 'photo'}
                            icon="document-outline"
                            loading={activePicker === 'file'}
                            title="Archivos"
                            variant="secondary"
                            onPress={() => {
                              void pickReceiptFromFiles();
                            }}
                          />
                        </View>
                      </View>
                    </FieldShell>

                    {selectedFile ? (
                      <Pressable
                        accessibilityRole="button"
                        className="self-start rounded-full border border-light-gray px-3 py-2"
                        onPress={() => setSelectedFile(null)}
                      >
                        <Text className="font-body-semibold text-sm text-primary">
                          Quitar archivo
                        </Text>
                      </Pressable>
                    ) : null}

                    <InputField
                      label="Nota"
                      placeholder="transferencia desde BBVA"
                      value={note}
                      onChangeText={setNote}
                    />
                  </>
                ) : selectedCharges.length > 0 && creditAppliedAmount > 0 ? (
                  <View className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
                    <Text className="font-body text-sm text-[#1D4ED8]">
                      El saldo a favor cubre todo el total seleccionado. Esta
                      pantalla solo envía comprobantes, así que no hay nada por
                      subir con esta selección.
                    </Text>
                  </View>
                ) : null}

                <FieldShell label="Observaciones">
                  <View className="min-h-[76px] justify-center">
                    <TextInput
                      multiline
                      numberOfLines={2}
                      className="font-body text-base text-primary"
                      placeholder="Observaciones adicionales"
                      placeholderTextColor="#6B7280"
                      selectionColor="#18052E"
                      style={{ textAlignVertical: 'top' }}
                      value={observations}
                      onChangeText={setObservations}
                    />
                  </View>
                </FieldShell>

                <Button
                  disabled={!canSubmit}
                  icon="cloud-upload-outline"
                  loading={reportPaymentMutation.isPending}
                  title="Enviar a revisión"
                  onPress={() => {
                    if (
                      !selectedUnit ||
                      !paymentDate ||
                      uploadAmount <= 0 ||
                      remainingReceiptAmount <= 0
                    ) {
                      return;
                    }

                    if (!selectedFile) {
                      setErrorMessage(
                        'Selecciona una foto o un archivo JPG, PNG o PDF antes de enviar el comprobante.',
                      );
                      return;
                    }

                    reportPaymentMutation.mutate(
                      {
                        unitId: selectedUnit.id,
                        amount: remainingReceiptAmount,
                        creditAppliedAmount:
                          creditAppliedAmount > 0 ? creditAppliedAmount : undefined,
                        paymentDate: paymentDate.toISOString(),
                        method: 'TRANSFER',
                        reference: reference.trim() || undefined,
                        trackingKey: trackingKey.trim() || undefined,
                        notes: note.trim() || undefined,
                        receiptNotes: observations.trim() || undefined,
                        allocations: selectedCharges.map((charge) => ({
                          chargeId: Number(charge.id),
                          amount: charge.amount,
                        })),
                        file: selectedFile,
                      },
                      {
                        onError: (error) => {
                          setErrorMessage(
                            getErrorMessage(
                              error,
                              'No fue posible enviar el comprobante.',
                            ),
                          );
                        },
                      },
                    );
                  }}
                />
              </>
            )}
          </View>
        </Card>
      </View>

      <BottomSheet
        title="Aplicar cargos"
        visible={isChargesOpen}
        onClose={() => setIsChargesOpen(false)}
        footer={
          <View className="gap-3">
            <Button
              title="Cerrar"
              variant="secondary"
              onPress={() => setIsChargesOpen(false)}
            />
          </View>
        }
      >
        <View className="gap-3">
          {chargeOptions.length ? (
            chargeOptions.map((chargeOption) => {
              const isSelected = selectedChargeIds.includes(chargeOption.id);

              return (
                <Pressable
                  key={chargeOption.id}
                  className={cn(
                    'flex-row items-center justify-between gap-3 rounded-lg border px-4 py-3',
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-light-gray bg-[#F8F7FA]',
                  )}
                  onPress={() => toggleCharge(chargeOption.id)}
                >
                  <View className="flex-1 gap-1">
                    <Text
                      className={cn(
                        'font-body-semibold text-base',
                        isSelected ? 'text-white' : 'text-primary',
                      )}
                    >
                      {chargeOption.charge}
                    </Text>
                    <Text
                      className={cn(
                        'font-body text-sm',
                        isSelected ? 'text-white/85' : 'text-med-gray',
                      )}
                    >
                      {formatCurrency(chargeOption.amount)}
                    </Text>
                  </View>
                  <Ionicons
                    color={isSelected ? '#FFFFFF' : '#6B7280'}
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                  />
                </Pressable>
              );
            })
          ) : (
            <Text className="font-body text-sm text-med-gray">
              {selectedUnitBlockedMessage ||
                'No hay adeudos pendientes disponibles para esta unidad.'}
            </Text>
          )}
        </View>
      </BottomSheet>
    </>
  );
}
