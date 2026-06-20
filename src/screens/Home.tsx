import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';
import { BottomSheet } from '../components/molecules/fieldShared';
import MobileTabs from '../components/organisms/MobileTabs';
import { API_BASE_URL } from '../services/api';
import { getDashboardSummary, getMyCondominoDetail } from '../services/condomino';
import {
  getErrorMessage,
  getHttpStatus,
  isNetworkError,
} from '../services/error';
import {
  mapAccountMovements,
  mapDashboardOverview,
  mapPaymentsToReceipts,
} from '../services/mappers';
import { queryKeys } from '../services/queryKeys';
import type {
  PaymentReceipt,
  PaymentTransaction,
} from '../services/viewModels';

const movementStatusOptions = [
  'Todos',
  'Pendiente',
  'Vencido',
  'En revisión',
  'Pagado',
  'Parcial',
  'Rechazado',
  'Cancelado',
] as const;
const receiptStatusOptions = [
  'Todos',
  'Pendiente',
  'En revisión',
  'Parcial',
  'Rechazado',
  'Cancelado',
  'Pagado',
] as const;

function movementAmountColor(status: PaymentTransaction['status']) {
  if (status === 'Pagado') {
    return 'text-success';
  }

  if (status === 'Pendiente' || status === 'En revisión') {
    return 'text-warning';
  }

  if (status === 'Parcial') {
    return 'text-warning';
  }

  return 'text-danger';
}

function getTransactionConcepts(movement: PaymentTransaction) {
  if (Array.isArray(movement.concepts) && movement.concepts.length > 0) {
    return movement.concepts;
  }

  return movement.concept ? [movement.concept] : [];
}

function getReceiptConcepts(receipt: PaymentReceipt) {
  if (Array.isArray(receipt.concepts) && receipt.concepts.length > 0) {
    return receipt.concepts;
  }

  return receipt.type ? [receipt.type] : [];
}

interface HomeProps {
  initialTab?: 'movimientos' | 'comprobantes';
  onOpenPaymentTransactionDetail?: (transaction: PaymentTransaction) => void;
  onOpenPaymentReceiptDetail?: (receipt: PaymentReceipt) => void;
  onOpenUploadReceipt?: () => void;
}

export default function Home({
  initialTab = 'movimientos',
  onOpenPaymentTransactionDetail,
  onOpenPaymentReceiptDetail,
  onOpenUploadReceipt,
}: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedMovementStatus, setSelectedMovementStatus] =
    useState<(typeof movementStatusOptions)[number]>('Todos');
  const [receiptSearchQuery, setReceiptSearchQuery] = useState('');
  const [isReceiptFilterOpen, setIsReceiptFilterOpen] = useState(false);
  const [selectedReceiptStatus, setSelectedReceiptStatus] =
    useState<(typeof receiptStatusOptions)[number]>('Todos');

  const condominiumQuery = useQuery({
    queryKey: queryKeys.condominiumDetail,
    queryFn: getMyCondominoDetail,
  });
  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboardSummary,
    queryFn: getDashboardSummary,
  });

  const overview = useMemo(
    () => mapDashboardOverview(dashboardQuery.data, condominiumQuery.data),
    [condominiumQuery.data, dashboardQuery.data],
  );
  const movementItems = useMemo(
    () => mapAccountMovements(condominiumQuery.data),
    [condominiumQuery.data],
  );
  const receiptItems = useMemo(
    () => mapPaymentsToReceipts(condominiumQuery.data),
    [condominiumQuery.data],
  );

  const isLoading = condominiumQuery.isLoading;
  const errorMessage = useMemo(() => {
    if (condominiumQuery.error) {
      if (getHttpStatus(condominiumQuery.error) === 404) {
        return 'Tu cuenta no tiene un condomino vinculado en el backend. Los movimientos y comprobantes salen de GET /condominos/me.';
      }

      if (isNetworkError(condominiumQuery.error)) {
        return `No se pudo conectar con el API en ${API_BASE_URL}. Si estás en Android emulator usa http://10.0.2.2:3000 y verifica que el backend esté levantado.`;
      }

      return getErrorMessage(
        condominiumQuery.error,
        'No fue posible cargar el estado de cuenta.',
      );
    }

    return '';
  }, [condominiumQuery.error]);

  const filteredMovements = movementItems.filter((movement) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const concepts = getTransactionConcepts(movement);
    const matchesSearch =
      normalizedQuery.length === 0 ||
      movement.concept.toLowerCase().includes(normalizedQuery) ||
      concepts.some((concept) =>
        concept.toLowerCase().includes(normalizedQuery),
      ) ||
      movement.dueDate.includes(searchQuery.trim()) ||
      movement.reference.toLowerCase().includes(normalizedQuery);
    const matchesStatus =
      selectedMovementStatus === 'Todos' ||
      movement.status === selectedMovementStatus;

    return matchesSearch && matchesStatus;
  });

  const filteredReceipts = receiptItems.filter((receipt) => {
    const normalizedQuery = receiptSearchQuery.trim().toLowerCase();
    const concepts = getReceiptConcepts(receipt);
    const matchesSearch =
      normalizedQuery.length === 0 ||
      receipt.type.toLowerCase().includes(normalizedQuery) ||
      concepts.some((concept) =>
        concept.toLowerCase().includes(normalizedQuery),
      ) ||
      receipt.trackingKey.includes(receiptSearchQuery.trim()) ||
      receipt.paymentDate.includes(receiptSearchQuery.trim());
    const matchesStatus =
      selectedReceiptStatus === 'Todos' ||
      receipt.status === selectedReceiptStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <View className="gap-5">
        <View className="gap-4">
          <View className="flex-row flex-wrap justify-between gap-y-4">
            <Text className="font-heading text-sm text-primary">
              {overview.periodLabel}
            </Text>
            <Text className="font-heading text-sm text-success">
              {overview.creditLabel}
            </Text>
          </View>

          <Text className="font-body text-sm text-med-gray">
            Casa asociada: {overview.houseLabel}
          </Text>

          <View className="flex-row flex-wrap justify-between gap-y-4">
            <Card width="half">
              <Text className="font-body text-sm text-primary">
                Saldo Pendiente
              </Text>
              <Text className="mt-2 font-heading text-2xl text-danger">
                {overview.pendingBalance}
              </Text>
            </Card>

            <Card width="half">
              <Text className="font-body text-sm text-primary">
                Mantenimiento
              </Text>
              <Text className="mt-2 font-heading text-2xl text-success">
                {overview.maintenanceBalance}
              </Text>
            </Card>

            <Card width="half">
              <Text className="font-body text-sm text-primary">Agua</Text>
              <Text className="mt-2 font-heading text-2xl text-primary">
                {overview.waterBalance}
              </Text>
            </Card>

            <Card width="half">
              <Text className="font-body text-sm text-primary">
                Multas y Otros
              </Text>
              <Text className="mt-2 font-heading text-2xl text-gray-400">
                {overview.otherBalance}
              </Text>
            </Card>
          </View>

          <Button
            icon="document-text-outline"
            title="Subir comprobante"
            size="md"
            variant="primary"
            onPress={onOpenUploadReceipt}
          />
        </View>

        <MobileTabs
          defaultActiveKey={initialTab}
          items={[
            {
              key: 'movimientos',
              label: 'Movimientos',
              content: (
                <View className="gap-4">
                  <View className="flex-row items-center gap-3">
                    <Button
                      icon="options-outline"
                      title="Filtrar"
                      size="md"
                      variant="secondary"
                      onPress={() => setIsFilterOpen(true)}
                    />

                    <View className="flex-1 rounded-xl border border-light-gray bg-white px-3">
                      <View className="min-h-11 flex-row items-center gap-2">
                        <Ionicons color="#6B7280" name="search-outline" size={18} />
                        <TextInput
                          className="flex-1 font-body text-base text-primary"
                          placeholder="Buscar"
                          placeholderTextColor="#6B7280"
                          selectionColor="#18052E"
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                        />
                      </View>
                    </View>
                  </View>

                  {isLoading ? (
                    <Card className="rounded-lg border border-light-gray px-4 py-4">
                      <Text className="font-body text-sm text-med-gray">
                        Cargando movimientos...
                      </Text>
                    </Card>
                  ) : errorMessage ? (
                    <Card className="rounded-lg border border-light-gray px-4 py-4">
                      <Text className="font-body text-sm text-danger">
                        {errorMessage}
                      </Text>
                    </Card>
                  ) : filteredMovements.length ? (
                    filteredMovements.map((movement) => {
                      const concepts = getTransactionConcepts(movement);

                      return (
                        <Pressable
                          key={movement.id}
                          accessibilityHint="Abre el detalle del movimiento"
                          accessibilityRole="button"
                          className="rounded-lg"
                          onPress={() => onOpenPaymentTransactionDetail?.(movement)}
                        >
                          <Card className="rounded-lg border border-light-gray px-3 py-2">
                            <View className="flex-row items-start justify-between">
                              <View className="flex-1 gap-2 pr-3">
                                <View className="gap-1">
                                  <Text className="font-heading text-sm text-primary">
                                    Conceptos:
                                  </Text>
                                  <View className="gap-1">
                                    {concepts.slice(0, 2).map((concept) => (
                                      <Text
                                        key={`${movement.id}-${concept}`}
                                        className="font-body-semibold text-sm text-primary"
                                        numberOfLines={1}
                                      >
                                        {concept}
                                      </Text>
                                    ))}
                                  </View>
                                </View>

                                <View className="flex-row items-center gap-1">
                                  <Text className="font-heading text-sm text-primary">
                                    {movement.dateLabel}:
                                  </Text>
                                  <Text
                                    className="font-body-semibold text-sm text-primary"
                                    numberOfLines={1}
                                  >
                                    {movement.dueDate}
                                  </Text>
                                </View>
                              </View>

                              <View className="shrink-0 items-end gap-2">
                                <View className="flex-row items-center gap-1">
                                  <Badge
                                    className="self-end"
                                    label={movement.status}
                                    variant={movement.badgeVariant}
                                  />
                                  <Ionicons
                                    color="#9CA3AF"
                                    name="chevron-forward"
                                    size={18}
                                  />
                                </View>

                                <Text
                                  className={`w-full font-heading text-right text-sm ${movementAmountColor(
                                    movement.status,
                                  )}`}
                                >
                                  {movement.amount}
                                </Text>
                              </View>
                            </View>
                          </Card>
                        </Pressable>
                      );
                    })
                  ) : (
                    <Card className="rounded-lg border border-light-gray px-4 py-4">
                      <Text className="font-body text-sm text-med-gray">
                        No hay movimientos que coincidan con tu búsqueda o filtro.
                      </Text>
                    </Card>
                  )}
                </View>
              ),
            },
            {
              key: 'comprobantes',
              label: 'Comprobantes',
              content: (
                <View className="gap-4">
                  <View className="flex-row items-center gap-3">
                    <Button
                      icon="options-outline"
                      title="Filtrar"
                      size="md"
                      variant="secondary"
                      onPress={() => setIsReceiptFilterOpen(true)}
                    />

                    <View className="flex-1 rounded-xl border border-light-gray bg-white px-3">
                      <View className="min-h-11 flex-row items-center gap-2">
                        <Ionicons color="#6B7280" name="search-outline" size={18} />
                        <TextInput
                          className="flex-1 font-body text-base text-primary"
                          placeholder="Buscar"
                          placeholderTextColor="#6B7280"
                          selectionColor="#18052E"
                          value={receiptSearchQuery}
                          onChangeText={setReceiptSearchQuery}
                        />
                      </View>
                    </View>
                  </View>

                  {isLoading ? (
                    <Card className="rounded-lg border border-light-gray px-4 py-4">
                      <Text className="font-body text-sm text-med-gray">
                        Cargando comprobantes...
                      </Text>
                    </Card>
                  ) : errorMessage ? (
                    <Card className="rounded-lg border border-light-gray px-4 py-4">
                      <Text className="font-body text-sm text-danger">
                        {errorMessage}
                      </Text>
                    </Card>
                  ) : filteredReceipts.length ? (
                    filteredReceipts.map((receipt) => {
                      const concepts = getReceiptConcepts(receipt);

                      return (
                        <Pressable
                          key={receipt.id}
                          accessibilityHint="Abre el detalle del comprobante"
                          accessibilityRole="button"
                          className="rounded-lg"
                          onPress={() => onOpenPaymentReceiptDetail?.(receipt)}
                        >
                          <Card className="rounded-lg border border-light-gray px-3 py-2">
                            <View className="flex-row items-start justify-between">
                              <View className="flex-1 gap-2 pr-3">
                                <View className="gap-1">
                                  <Text className="font-heading text-sm text-primary">
                                    Conceptos:
                                  </Text>
                                  <View className="gap-1">
                                    {concepts.slice(0, 2).map((concept) => (
                                      <Text
                                        key={`${receipt.id}-${concept}`}
                                        className="font-body-semibold text-sm text-primary"
                                        numberOfLines={1}
                                      >
                                        {concept}
                                      </Text>
                                    ))}
                                  </View>
                                </View>

                                <View className="flex-row items-center gap-1">
                                  <Text className="font-heading text-sm text-primary">
                                    Fecha pago:
                                  </Text>
                                  <Text
                                    className="font-body-semibold text-sm text-primary"
                                    numberOfLines={1}
                                  >
                                    {receipt.paymentDate}
                                  </Text>
                                </View>
                              </View>

                              <View className="shrink-0 items-end gap-2">
                                <View className="flex-row items-center gap-1">
                                  <Badge
                                    className="self-end"
                                    label={receipt.status}
                                    variant={receipt.badgeVariant}
                                  />
                                  <Ionicons
                                    color="#9CA3AF"
                                    name="chevron-forward"
                                    size={18}
                                  />
                                </View>

                                <Text className="w-full font-heading text-right text-sm text-success">
                                  {receipt.amount}
                                </Text>
                              </View>
                            </View>
                          </Card>
                        </Pressable>
                      );
                    })
                  ) : (
                    <Card className="rounded-lg border border-light-gray px-4 py-4">
                      <Text className="font-body text-sm text-med-gray">
                        Aún no hay comprobantes enviados o validados.
                      </Text>
                    </Card>
                  )}
                </View>
              ),
            },
          ]}
        />
      </View>

      <BottomSheet
        title="Filtrar movimientos"
        visible={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        footer={
          <View className="gap-3">
            <Button
              title="Cerrar"
              variant="secondary"
              onPress={() => setIsFilterOpen(false)}
            />
          </View>
        }
      >
        <View className="gap-3">
          {movementStatusOptions.map((status) => {
            const isSelected = selectedMovementStatus === status;

            return (
              <Pressable
                key={status}
                className={`rounded-lg border px-4 py-3 ${
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-light-gray bg-[#F8F7FA]'
                }`}
                onPress={() => setSelectedMovementStatus(status)}
              >
                <Text
                  className={`font-body-semibold text-base ${
                    isSelected ? 'text-white' : 'text-primary'
                  }`}
                >
                  {status}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>

      <BottomSheet
        title="Filtrar comprobantes"
        visible={isReceiptFilterOpen}
        onClose={() => setIsReceiptFilterOpen(false)}
        footer={
          <View className="gap-3">
            <Button
              title="Cerrar"
              variant="secondary"
              onPress={() => setIsReceiptFilterOpen(false)}
            />
          </View>
        }
      >
        <View className="gap-3">
          {receiptStatusOptions.map((status) => {
            const isSelected = selectedReceiptStatus === status;

            return (
              <Pressable
                key={status}
                className={`rounded-lg border px-4 py-3 ${
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-light-gray bg-[#F8F7FA]'
                }`}
                onPress={() => setSelectedReceiptStatus(status)}
              >
                <Text
                  className={`font-body-semibold text-base ${
                    isSelected ? 'text-white' : 'text-primary'
                  }`}
                >
                  {status}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </>
  );
}
