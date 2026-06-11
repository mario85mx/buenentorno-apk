import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
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

interface UploadReceiptProps {
  onBack?: () => void;
  onSubmit?: () => void;
}

interface ChargeItem {
  id: string;
  charge: string;
  amount: number;
}

const chargeOptions: ChargeItem[] = [
  { id: 'maintenance-jun', charge: 'Mantenimiento Junio 2026', amount: 120 },
  { id: 'water-jun', charge: 'Agua Junio 2026', amount: 80 },
  { id: 'fine-jun', charge: 'Multa estacionamiento', amount: 150 },
];

const paymentMethodOptions = [
  { label: 'Transfer', value: 'transfer' },
];

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

export default function UploadReceipt({
  onBack,
  onSubmit,
}: UploadReceiptProps) {
  const [paymentDate, setPaymentDate] = useState<Date | null>(new Date());
  const [reference, setReference] = useState('');
  const [trackingKey, setTrackingKey] = useState('');
  const [uploadedFileName] = useState('');
  const [note, setNote] = useState('');
  const [observations, setObservations] = useState('');
  const [selectedChargeIds, setSelectedChargeIds] = useState<string[]>([
    chargeOptions[0].id,
  ]);
  const [isChargesOpen, setIsChargesOpen] = useState(false);

  const selectedCharges = useMemo(
    () =>
      chargeOptions.filter((chargeOption) =>
        selectedChargeIds.includes(chargeOption.id),
      ),
    [selectedChargeIds],
  );
  const uploadAmount = useMemo(
    () =>
      selectedCharges.reduce(
        (total, selectedCharge) => total + selectedCharge.amount,
        0,
      ),
    [selectedCharges],
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
            <FieldShell
              disabled
              label="Comprobante por subir"
              helperText="Se calcula automáticamente según los cargos seleccionados."
            >
              <View className={cn(FIELD_CONTROL_CLASS, 'justify-center')}>
                <Text className="font-body-semibold text-base text-primary">
                  {formatCurrency(uploadAmount)}
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
              value="transfer"
              onChange={() => undefined}
            />

            <InputField
              label="Referencia"
              placeholder="REF-2026-06-001"
              value={reference}
              onChangeText={setReference}
            />

            <InputField
              label="Clave de Rastreo"
              placeholder="547382910456"
              value={trackingKey}
              onChangeText={setTrackingKey}
            />

            <FieldShell
              active={isChargesOpen}
              helperText="Selecciona uno o más cargos para aplicar el pago."
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

            <FieldShell
              helperText="Adjunta el archivo del comprobante para enviarlo a revisión."
              label="Archivo"
            >
              <Pressable
                accessibilityRole="button"
                className={cn(
                  FIELD_CONTROL_CLASS,
                  'flex-row items-center justify-between gap-3',
                )}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons color="#18052E" name="attach-outline" size={20} />
                  <Text className="font-body text-base text-primary">
                    {uploadedFileName || 'Seleccionar archivo'}
                  </Text>
                </View>
                <Ionicons color="#6B7280" name="cloud-upload-outline" size={20} />
              </Pressable>
            </FieldShell>

            <InputField
              label="Nota"
              placeholder="transferencia desde BBVA"
              value={note}
              onChangeText={setNote}
            />

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
              icon="cloud-upload-outline"
              title="Enviar a revisión"
              onPress={onSubmit}
            />
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
          {chargeOptions.map((chargeOption) => {
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
          })}
        </View>
      </BottomSheet>
    </>
  );
}
